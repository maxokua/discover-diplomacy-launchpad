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

interface Path {
  title: string
  why: string
  exampleRoles: string[]
  exampleEmployers: string[]
}

interface Props {
  name?: string
  summary?: string
  paths?: Path[]
  days0to30?: string[]
  days30to60?: string[]
  days60to90?: string[]
  networkingStrategy?: string[]
  resumeUpdates?: string[]
  recommendedTier?: string
  tierRationale?: string
  consultationUrl?: string
  planUrl?: string
}

const FALLBACK_CONSULT = 'https://discoverdiplomacy.org/contact'

const Email = ({
  name,
  summary = 'Here is the personalized plan we built from your assessment.',
  paths = [],
  days0to30 = [],
  days30to60 = [],
  days60to90 = [],
  networkingStrategy = [],
  resumeUpdates = [],
  recommendedTier = 'Career Membership',
  tierRationale = '',
  consultationUrl = FALLBACK_CONSULT,
  planUrl,
}: Props) => {
  const greeting = name ? `${name}, here's your map.` : "Here's your map."
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your personalized career plan from Discover Diplomacy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>DISCOVER DIPLOMACY · CAREER ASSESSMENT</Text>
          <Heading style={h1}>{greeting}</Heading>
          <Text style={paragraph}>{summary}</Text>

          <Section style={ctaWrap}>
            <Link href={consultationUrl} style={ctaPrimary}>
              Schedule a free consultation
            </Link>
            {planUrl ? (
              <Text style={subCta}>
                <Link href={planUrl} style={linkStyle}>
                  View your full plan online →
                </Link>
              </Text>
            ) : null}
          </Section>

          <Hr style={hr} />

          {paths.length > 0 && (
            <>
              <Heading as="h2" style={h2}>Three paths that fit you</Heading>
              {paths.map((p, i) => (
                <Section key={i} style={pathCard}>
                  <Text style={pathLabel}>PATH 0{i + 1}</Text>
                  <Text style={pathTitle}>{p.title}</Text>
                  <Text style={paragraph}>{p.why}</Text>
                  {p.exampleRoles?.length > 0 && (
                    <Text style={smallLabel}>
                      <strong>Example roles:</strong> {p.exampleRoles.join(' · ')}
                    </Text>
                  )}
                  {p.exampleEmployers?.length > 0 && (
                    <Text style={smallLabel}>
                      <strong>Target employers:</strong> {p.exampleEmployers.join(', ')}
                    </Text>
                  )}
                </Section>
              ))}
              <Hr style={hr} />
            </>
          )}

          <Heading as="h2" style={h2}>Your 90-day action plan</Heading>
          <PlanBucket label="Days 0–30" items={days0to30} />
          <PlanBucket label="Days 30–60" items={days30to60} />
          <PlanBucket label="Days 60–90" items={days60to90} />

          <Hr style={hr} />

          {networkingStrategy.length > 0 && (
            <ListBlock title="Networking strategy" items={networkingStrategy} />
          )}
          {resumeUpdates.length > 0 && (
            <ListBlock title="Resume updates" items={resumeUpdates} />
          )}

          <Hr style={hr} />

          <Section style={tierBox}>
            <Text style={eyebrowEmerald}>RECOMMENDED FOR YOU</Text>
            <Text style={tierTitle}>{recommendedTier}</Text>
            {tierRationale ? <Text style={paragraph}>{tierRationale}</Text> : null}
            <Link href={consultationUrl} style={ctaPrimary}>
              Book your consultation
            </Link>
          </Section>

          <Text style={footer}>
            You're receiving this because you completed the Discover Diplomacy career
            assessment. Questions? Reply to this email — a real person reads every
            message.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

function PlanBucket({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <Section style={bucket}>
      <Text style={bucketLabel}>{label}</Text>
      {items.map((it, i) => (
        <Text key={i} style={bullet}>→ {it}</Text>
      ))}
    </Section>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Section style={{ marginTop: '20px' }}>
      <Text style={h3}>{title}</Text>
      {items.map((it, i) => (
        <Text key={i} style={bullet}>· {it}</Text>
      ))}
    </Section>
  )
}

export const template = {
  component: Email,
  subject: ({ name }: Record<string, any>) =>
    name ? `${name}, your Discover Diplomacy career plan` : 'Your Discover Diplomacy career plan',
  displayName: 'Assessment career plan',
  previewData: {
    name: 'Sam',
    summary:
      "You're well-positioned to move into international policy work, with a few concrete moves over the next 90 days.",
    paths: [
      {
        title: 'Foreign Service Officer track',
        why: 'Your language background and policy interest map directly to the consular and political cones.',
        exampleRoles: ['Foreign Service Officer', 'Civil Service policy analyst'],
        exampleEmployers: ['U.S. Department of State', 'USAID', 'Foreign Commercial Service'],
      },
      {
        title: 'Think tank research',
        why: 'Builds your published profile while you wait on long government clearance cycles.',
        exampleRoles: ['Research Associate', 'Program Coordinator'],
        exampleEmployers: ['CSIS', 'Brookings', 'Atlantic Council', 'CFR'],
      },
      {
        title: 'Multilateral institutions',
        why: 'Your French + econ background opens UN/WB/IMF JPO and YPP pipelines.',
        exampleRoles: ['Junior Professional Officer', 'Young Professional', 'Analyst'],
        exampleEmployers: ['World Bank', 'IMF', 'UN Secretariat', 'OECD'],
      },
    ],
    days0to30: [
      'Rewrite resume against three target job descriptions',
      'Schedule four informational interviews with State / CSIS alumni',
      'Register for the FSOT and book a study calendar',
    ],
    days30to60: [
      'Publish one short policy memo on a region you know',
      'Apply to two PMF-eligible roles',
      'Attend one in-person DC event per week',
    ],
    days60to90: [
      'Submit final FSOT prep timeline',
      'Decide on JPO vs. think tank track based on offers received',
      'Refresh LinkedIn with new bylines',
    ],
    networkingStrategy: [
      'Lead with specific asks, not "can I pick your brain"',
      'Follow up within 24 hours with a 3-line thank you',
      'Build a target list of 25 people, work through it monthly',
    ],
    resumeUpdates: [
      'Lead each bullet with a verb and a number',
      'Move the language proficiency line to the top',
      'Trim coursework section to two lines',
    ],
    recommendedTier: 'Career Membership',
    tierRationale:
      'You have momentum and need structured accountability over the next 90 days — Membership gives you weekly office hours, the directory, and a community moving in the same direction.',
    consultationUrl: FALLBACK_CONSULT,
  },
} satisfies TemplateEntry

// ---------- styles ----------
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#1a2342',
}
const container = { padding: '32px 28px', maxWidth: '640px', margin: '0 auto' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '0.14em',
  color: '#5a6478',
  fontWeight: 600 as const,
  margin: '0 0 14px',
}
const eyebrowEmerald = {
  ...eyebrow,
  color: '#0f6b3f',
}
const h1 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '28px',
  lineHeight: 1.2,
  color: '#0e1a3a',
  margin: '0 0 14px',
}
const h2 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '20px',
  color: '#0e1a3a',
  margin: '28px 0 14px',
}
const h3 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '15px',
  color: '#0e1a3a',
  margin: '0 0 8px',
  fontWeight: 600 as const,
}
const paragraph = {
  fontSize: '15px',
  lineHeight: 1.55,
  color: '#1a2342',
  margin: '0 0 14px',
}
const ctaWrap = { margin: '20px 0 8px' }
const ctaPrimary = {
  display: 'inline-block',
  padding: '12px 22px',
  backgroundColor: '#0e1a3a',
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: '12px',
  letterSpacing: '0.1em',
  fontWeight: 600 as const,
  textTransform: 'uppercase' as const,
  borderRadius: '2px',
}
const subCta = { fontSize: '13px', margin: '10px 0 0' }
const linkStyle = { color: '#0e1a3a', textDecoration: 'underline' }
const hr = { borderColor: '#e5e2dc', margin: '28px 0' }
const pathCard = {
  padding: '16px 0',
  borderTop: '1px solid #e5e2dc',
}
const pathLabel = {
  fontSize: '10px',
  letterSpacing: '0.14em',
  color: '#0f6b3f',
  fontWeight: 700 as const,
  margin: '0 0 6px',
}
const pathTitle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '17px',
  color: '#0e1a3a',
  margin: '0 0 8px',
  fontWeight: 600 as const,
}
const smallLabel = {
  fontSize: '13px',
  lineHeight: 1.5,
  color: '#3c4763',
  margin: '6px 0',
}
const bucket = {
  padding: '12px 14px',
  backgroundColor: '#f7f5f0',
  marginBottom: '10px',
}
const bucketLabel = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '14px',
  fontWeight: 700 as const,
  color: '#0e1a3a',
  margin: '0 0 8px',
}
const bullet = {
  fontSize: '14px',
  lineHeight: 1.5,
  color: '#1a2342',
  margin: '4px 0',
}
const tierBox = {
  padding: '22px',
  backgroundColor: '#0e1a3a',
  borderRadius: '2px',
  marginTop: '20px',
}
const tierTitle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '22px',
  color: '#ffffff',
  margin: '0 0 10px',
}
const footer = {
  fontSize: '12px',
  color: '#6b7488',
  lineHeight: 1.5,
  marginTop: '32px',
}

// Override paragraph color inside dark tier box
Object.assign(tierBox, {})
