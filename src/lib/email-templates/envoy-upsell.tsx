import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  upgradeUrl?: string
}

const Email = ({ name, upgradeUrl = 'https://discoverdiplomacy.org/pricing' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thinking about hands-on coaching?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, want a mentor in the loop?` : 'Want a mentor in the loop?'}
        </Heading>
        <Text style={text}>
          You've been running Compass for about a month. Some members find that
          recurring 1:1 coaching at the Envoy tier is what shifts the search from "I'm
          working on it" to "I have offers."
        </Text>
        <Text style={text}>
          Envoy gets you two 1:1 sessions per month with vetted coaches (extra sessions at member rate), priority
          matching, mock interviews, and faster employer attention through the
          Resume Drop.
        </Text>
        <Text style={text}>
          If you'd like to give it a month, the upgrade button below prorates the
          difference. If Compass is still the right fit, that's totally fine too —
          ignore this email.
        </Text>
        <div style={ctaWrap}>
          <Link style={cta} href={upgradeUrl}>
            See Envoy
          </Link>
        </div>
        <Hr style={hr} />
        <Text style={muted}>
          You can downgrade back to Compass anytime — no penalty.
          <br />
          Discover Diplomacy · hello@discoverdiplomacy.org
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template: TemplateEntry = {
  component: Email,
  subject: 'Thinking about hands-on coaching?',
  displayName: 'Compass → Envoy 30-day Check-in',
  previewData: { name: 'Jordan' },
}

const main: React.CSSProperties = { backgroundColor: '#F5F1E8', fontFamily: 'Georgia, "Times New Roman", serif', padding: '40px 20px' }
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', border: '1px solid #e5e0d4' }
const h1: React.CSSProperties = { color: '#0E1E36', fontSize: '26px', margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#1f2937', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }
const ctaWrap: React.CSSProperties = { textAlign: 'center', margin: '28px 0' }
const cta: React.CSSProperties = { backgroundColor: '#2C7A4B', color: '#0E1E36', padding: '14px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block' }
const hr: React.CSSProperties = { borderColor: '#e5e0d4', margin: '32px 0 16px' }
const muted: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.6' }
