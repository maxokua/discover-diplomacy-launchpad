
CREATE TABLE public.assessment_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  answers jsonb NOT NULL,
  plan jsonb NOT NULL,
  recommended_tier text,
  consent_newsletter boolean NOT NULL DEFAULT true,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.assessment_leads TO anon;
GRANT SELECT, INSERT ON public.assessment_leads TO authenticated;
GRANT ALL ON public.assessment_leads TO service_role;

ALTER TABLE public.assessment_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an assessment"
  ON public.assessment_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read assessments"
  ON public.assessment_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX assessment_leads_email_idx ON public.assessment_leads (email);
CREATE INDEX assessment_leads_created_at_idx ON public.assessment_leads (created_at DESC);
