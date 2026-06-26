import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  employerName?: string
  candidateName?: string
  candidateUrl?: string
}

const Email = ({
  employerName,
  candidateName = 'Your candidate',
  candidateUrl = 'https://discoverdiplomacy.org/employers',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You unlocked a candidate. Here's what happens next.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {employerName ? `${employerName}, you're connected.` : "You're connected."}
        </Heading>
        <Text style={text}>
          Great choice — <strong>{candidateName}</strong> has been notified and
          should be in touch within 48 hours. If you don't hear back, let us know
          and we'll nudge them on your behalf.
        </Text>
        <Text style={text}>
          A reminder on how unlocks work:
        </Text>
        <ul style={list}>
          <li style={li}>You now have their contact info and full resume.</li>
          <li style={li}>The placement fee (15% of first-year base salary) is only invoiced when this candidate is hired through this introduction.</li>
          <li style={li}>The candidate is never charged. We work for you on this side of the marketplace.</li>
        </ul>
        <div style={ctaWrap}>
          <Link style={cta} href={candidateUrl}>
            Review candidate details
          </Link>
        </div>
        <Hr style={hr} />
        <Text style={muted}>
          Questions, references, or background checks? Reply to this email and a
          human will help.
          <br />
          Discover Diplomacy · hello@discoverdiplomacy.org
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template: TemplateEntry = {
  component: Email,
  subject: 'You unlocked a candidate. Here are next steps.',
  displayName: 'Employer Unlock Confirmation',
  previewData: { employerName: 'Hiring Team', candidateName: 'Maya Chen' },
}

const main: React.CSSProperties = { backgroundColor: '#F5F1E8', fontFamily: 'Georgia, "Times New Roman", serif', padding: '40px 20px' }
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', border: '1px solid #e5e0d4' }
const h1: React.CSSProperties = { color: '#0E1E36', fontSize: '26px', margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#1f2937', fontSize: '16px', lineHeight: '1.6', margin: '0 0 14px' }
const list: React.CSSProperties = { paddingLeft: '20px', margin: '0 0 20px' }
const li: React.CSSProperties = { color: '#1f2937', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }
const ctaWrap: React.CSSProperties = { textAlign: 'center', margin: '28px 0' }
const cta: React.CSSProperties = { backgroundColor: '#0E1E36', color: '#F5F1E8', padding: '14px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block' }
const hr: React.CSSProperties = { borderColor: '#e5e0d4', margin: '32px 0 16px' }
const muted: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.6' }
