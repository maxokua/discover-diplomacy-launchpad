// Server-only HubSpot CRM sync helper.
// Upserts a contact by email and sets Discover Diplomacy lifecycle properties.

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/hubspot'

export interface HubspotContactSync {
  email: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  /** e.g. 'compass', 'resume_review' */
  product: string
  /** e.g. 'subscription_active', 'purchase_completed' */
  lifecycleStage?: string
  /** Free-form note attached as a HubSpot property. */
  note?: string
}

function splitName(full?: string | null): { first?: string; last?: string } {
  if (!full) return {}
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return {}
  if (parts.length === 1) return { first: parts[0] }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

async function hubspotFetch(path: string, init: RequestInit) {
  const lovableKey = process.env.LOVABLE_API_KEY
  const hubspotKey = process.env.HUBSPOT_API_KEY
  if (!lovableKey || !hubspotKey) {
    throw new Error('HubSpot connector secrets are not configured')
  }
  return fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': hubspotKey,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

/**
 * Upsert a HubSpot contact by email. Safe to call multiple times — HubSpot
 * dedupes on email. Failures are logged but never thrown; CRM sync must never
 * block a paid checkout webhook.
 */
export async function syncHubspotContact(args: HubspotContactSync): Promise<void> {
  try {
    const emailNorm = args.email.trim().toLowerCase()
    if (!emailNorm) return

    const nameParts = args.firstName || args.lastName
      ? { first: args.firstName || undefined, last: args.lastName || undefined }
      : splitName(args.fullName)

    const properties: Record<string, string> = {
      email: emailNorm,
      dd_product: args.product,
      dd_last_purchase_at: new Date().toISOString(),
    }
    if (nameParts.first) properties.firstname = nameParts.first
    if (nameParts.last) properties.lastname = nameParts.last
    if (args.lifecycleStage) properties.dd_lifecycle = args.lifecycleStage
    if (args.note) properties.dd_note = args.note

    // Search for existing contact
    const searchRes = await hubspotFetch('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [{ propertyName: 'email', operator: 'EQ', value: emailNorm }],
          },
        ],
        properties: ['email'],
        limit: 1,
      }),
    })

    if (!searchRes.ok) {
      const body = await searchRes.text()
      console.error(`[hubspot] search failed [${searchRes.status}]: ${body}`)
      return
    }
    const searchJson = (await searchRes.json()) as { results?: Array<{ id: string }> }
    const existingId = searchJson.results?.[0]?.id

    if (existingId) {
      const upd = await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      })
      if (!upd.ok) {
        const body = await upd.text()
        console.error(`[hubspot] update failed [${upd.status}]: ${body}`)
      }
    } else {
      const create = await hubspotFetch('/crm/v3/objects/contacts', {
        method: 'POST',
        body: JSON.stringify({ properties }),
      })
      if (!create.ok) {
        const body = await create.text()
        console.error(`[hubspot] create failed [${create.status}]: ${body}`)
      }
    }
  } catch (e) {
    console.error('[hubspot] sync error', e)
  }
}
