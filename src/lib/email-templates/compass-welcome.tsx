import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  dashboardUrl?: string
}

const Email = ({
  name,
  dashboardUrl = 'https://discoverdiplomacy.org/dashboard',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Compass membership is live — here's what's included</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Welcome aboard, ${name}.` : 'Welcome aboard.'}
        </Heading>
        <Text style={text}>
          Your Compass membership is live. Here's how to make the most of it in the
          next week:
        </Text>

        <Section style={section}>
          <Text style={listItem}>
            <strong>1. Upload your resume</strong> — get an AI resume score and
            ATS check inside your dashboard.
          </Text>
          <Text style={listItem}>
            <strong>2. Set your opportunity filters</strong> — sector, region,
            language, graduation year. Your weekly digest will adapt to you.
          </Text>
          <Text style={listItem}>
            <strong>3. Opt into Resume Drop</strong> — let verified employers
            discover you when they're hiring. You stay in control.
          </Text>
          <Text style={listItem}>
            <strong>4. Browse the coach directory</strong> — see who's available.
            Compass members can book a single 30-minute intro for $25.
          </Text>
        </Section>

        <Section style={ctaWrap}>
          <Link style={cta} href={dashboardUrl}>
            Open your dashboard
          </Link>
        </Section>

        <Hr style={hr} />
        <Text style={muted}>
          Questions? Hit reply — you'll reach a person, not an inbox.
          <br />
          Discover Diplomacy · Washington, DC
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template: TemplateEntry = {
  component: Email,
  subject: "Your Compass membership is live — here's what's included",
  displayName: 'Compass Welcome',
  previewData: { name: 'Jordan' },
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
const h1: React.CSSProperties = { color: '#0E1E36', fontSize: '28px', margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#1f2937', fontSize: '16px', lineHeight: '1.6', margin: '0 0 12px' }
const section: React.CSSProperties = { margin: '20px 0' }
const listItem: React.CSSProperties = { color: '#1f2937', fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px' }
const ctaWrap: React.CSSProperties = { textAlign: 'center', margin: '28px 0' }
const cta: React.CSSProperties = {
  backgroundColor: '#0E1E36',
  color: '#F5F1E8',
  padding: '14px 28px',
  textDecoration: 'none',
  fontSize: '13px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'inline-block',
}
const hr: React.CSSProperties = { borderColor: '#e5e0d4', margin: '32px 0 16px' }
const muted: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.6' }
