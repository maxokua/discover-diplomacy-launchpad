import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  universityName?: string
  directorName?: string
  activeStudents?: number
  placements?: number
  monthLabel?: string
  scheduleUrl?: string
  dashboardUrl?: string
}

const Email = ({
  universityName = 'Your University',
  directorName,
  activeStudents = 0,
  placements = 0,
  monthLabel = 'this month',
  scheduleUrl = 'https://discoverdiplomacy.org/contact',
  dashboardUrl = 'https://discoverdiplomacy.org/university',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {`${universityName} cohort: ${activeStudents} students active, ${placements} placements ${monthLabel}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {directorName ? `${directorName}, here's your ${monthLabel} update.` : `Your ${monthLabel} update.`}
        </Heading>
        <Text style={text}>
          The <strong>{universityName}</strong> cohort is thriving. Snapshot of the
          last 30 days:
        </Text>
        <Section style={metrics}>
          <Metric value={activeStudents} label="Active students" />
          <Metric value={placements} label="Placements" />
        </Section>
        <Text style={text}>
          Full breakdown — engagement, resumes reviewed, coaching sessions, Resume
          Drop opt-ins — is in your admin portal.
        </Text>
        <div style={ctaWrap}>
          <Link style={cta} href={dashboardUrl}>
            Open the program portal
          </Link>
        </div>
        <Text style={text}>
          Questions or want to talk about expanding the cohort?{' '}
          <Link style={inlineLink} href={scheduleUrl}>
            Schedule a call
          </Link>
          .
        </Text>
        <Hr style={hr} />
        <Text style={muted}>
          Discover Diplomacy · hello@discoverdiplomacy.org · Washington, DC
        </Text>
      </Container>
    </Body>
  </Html>
)

const Metric = ({ value, label }: { value: number; label: string }) => (
  <div style={metricBox}>
    <div style={metricValue}>{value}</div>
    <div style={metricLabel}>{label}</div>
  </div>
)

export const template: TemplateEntry = {
  component: Email,
  subject: (data) =>
    `${data.universityName ?? 'Your University'} cohort: ${data.activeStudents ?? 0} students active, ${data.placements ?? 0} placements this month`,
  displayName: 'University Director Monthly Report',
  previewData: {
    universityName: 'American University',
    directorName: 'Dr. Patel',
    activeStudents: 47,
    placements: 6,
    monthLabel: 'November',
  },
}

const main: React.CSSProperties = { backgroundColor: '#F5F1E8', fontFamily: 'Georgia, "Times New Roman", serif', padding: '40px 20px' }
const container: React.CSSProperties = { maxWidth: '640px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', border: '1px solid #e5e0d4' }
const h1: React.CSSProperties = { color: '#0E1E36', fontSize: '24px', margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#1f2937', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }
const metrics: React.CSSProperties = { display: 'flex', gap: '16px', margin: '24px 0' }
const metricBox: React.CSSProperties = { flex: 1, border: '1px solid #e5e0d4', padding: '20px', textAlign: 'center' }
const metricValue: React.CSSProperties = { color: '#0E1E36', fontSize: '36px', fontFamily: 'Georgia, serif' }
const metricLabel: React.CSSProperties = { color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '8px' }
const ctaWrap: React.CSSProperties = { textAlign: 'center', margin: '24px 0' }
const cta: React.CSSProperties = { backgroundColor: '#0E1E36', color: '#F5F1E8', padding: '14px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block' }
const inlineLink: React.CSSProperties = { color: '#0E1E36', textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e5e0d4', margin: '32px 0 16px' }
const muted: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.6' }
