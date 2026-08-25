
DROP POLICY "Anyone can submit an assessment" ON public.assessment_leads;

CREATE POLICY "Anyone can submit a valid assessment"
  ON public.assessment_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
    AND jsonb_typeof(answers) = 'object'
    AND answers <> '{}'::jsonb
  );