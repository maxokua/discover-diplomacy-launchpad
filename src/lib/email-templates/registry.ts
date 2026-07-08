import type { ComponentType } from 'react'
import { template as assessmentPlanTemplate } from './assessment-plan'
import { template as compassWelcomeTemplate } from './compass-welcome'
import { template as envoyUpsellTemplate } from './envoy-upsell'
import { template as universityMonthlyTemplate } from './university-monthly'
import { template as employerUnlockTemplate } from './employer-unlock'
import { template as resumeReviewRequestTemplate } from './resume-review-request'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'assessment-plan': assessmentPlanTemplate,
  'compass-welcome': compassWelcomeTemplate,
  'envoy-upsell': envoyUpsellTemplate,
  'university-monthly': universityMonthlyTemplate,
  'employer-unlock': employerUnlockTemplate,
  'resume-review-request': resumeReviewRequestTemplate,
}
