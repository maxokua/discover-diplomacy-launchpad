// Server-only helper to enqueue a transactional email from internal server
// functions (no Supabase JWT required). Mirrors the rendering + enqueue logic
// in /lovable/email/transactional/send.ts, but skips the user-auth check.

import * as React from 'react'
import { render } from '@react-email/components'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'discover-diplomacy-launchpad'
const SENDER_DOMAIN = 'notify.discoverdiplomacy.org'
const FROM_DOMAIN = 'discoverdiplomacy.org'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export interface InternalSendArgs {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}

export interface InternalSendResult {
  success: boolean
  queued?: boolean
  reason?: string
  error?: string
}

export async function sendInternalTransactionalEmail(
  args: InternalSendArgs,
): Promise<InternalSendResult> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const supabase = supabaseAdmin

  const template = TEMPLATES[args.templateName]
  if (!template) return { success: false, error: 'template_not_found' }

  const effectiveRecipient = (template.to || args.recipientEmail).trim()
  if (!effectiveRecipient) return { success: false, error: 'no_recipient' }

  const normalizedEmail = effectiveRecipient.toLowerCase()
  const messageId = crypto.randomUUID()
  const idempotencyKey = args.idempotencyKey || messageId
  const templateData = args.templateData ?? {}

  // 1. Suppression check
  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed', suppressionError)
    return { success: false, error: 'suppression_check_failed' }
  }

  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // 2. Get or create unsubscribe token
  let unsubscribeToken: string
  const { data: existingToken } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    unsubscribeToken = generateToken()
    await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    const { data: storedToken } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (!storedToken) return { success: false, error: 'token_storage_failed' }
    unsubscribeToken = storedToken.token
  } else {
    return { success: false, reason: 'email_suppressed' }
  }

  // 3. Render template
  let html: string
  let plainText: string
  try {
    const element = React.createElement(template.component, templateData)
    html = await render(element)
    plainText = await render(element, { plainText: true })
  } catch (err) {
    console.error('Template render failed', err)
    return { success: false, error: 'render_failed' }
  }

  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  // 4. Log pending + enqueue
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: args.templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: args.templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue email', enqueueError)
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { success: false, error: 'enqueue_failed' }
  }

  return { success: true, queued: true }
}
