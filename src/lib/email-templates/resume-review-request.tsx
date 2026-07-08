import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  candidateName?: string
  candidateEmail?: string
  targetRole?: string
  notes?: string
  reviewId?: string
  dashboardUrl?: string
}

const Email = ({
  candidateName,
  candidateEmail,
  targetRole,
  notes,
  reviewId,
  dashboardUrl = 'https://discoverdiplomacy.org/admin/resume-reviews',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New paid resume review request</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Resume Review · Paid</Heading>
        <Text style={text}>A candidate just paid for a resume review.</Text>

        <Section style={section}>
          <Text style={row}><strong>Name:</strong> {candidateName || '—'}</Text>
          <Text style={row}><strong>Email:</strong> {candidateEmail || '—'}</Text>
          <Text style={row}><strong>Target role:</strong> {targetRole || '—'}</Text>
          {notes ? (
            <Text style={row}><strong>Notes:</strong> {notes}</Text>
          ) : null}
          {reviewId ? (
            <Text style={row}><strong>Review ID:</strong> {reviewId}</Text>
          ) : null}
        </Section>

        <Hr style={hr} />
        <Text style={muted}>
          Manage in the admin panel: {dashboardUrl}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template: TemplateEntry = {
  component: Email,
  subject: (d) =>
    `New resume review · ${d.candidateName || d.candidateEmail || 'candidate'}`,
  displayName: 'Resume Review Request (internal ping)',
  to: 'max@discoverdiplomacy.org',
  previewData: {
    candidateName: 'Jordan Nguyen',
    candidateEmail: 'jordan@example.com',
    targetRole: 'Foreign Service Officer',
    notes: 'Applying to State Dept.',
    reviewId: '00000000-0000-0000-0000-000000000000',
  },
}

const main: React.CSSProperties = {
  backgroundColor: '#F5F1E8',
  fontFamily: 'Georgia, "Times New Roman", serif',
  padding: '40px 20px',
}
const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '40px',
  border: '1px solid #e5e0d4',
}
const h1: React.CSSProperties = { color: '#0E1E36', fontSize: '24px', margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#1f2937', fontSize: '15px', lineHeight: '1.6', margin: '0 0 12px' }
const section: React.CSSProperties = { margin: '20px 0' }
const row: React.CSSProperties = { color: '#1f2937', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }
const hr: React.CSSProperties = { borderColor: '#e5e0d4', margin: '32px 0 16px' }
const muted: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.6' }
