
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS ai_followups jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_core_signature text;

CREATE INDEX IF NOT EXISTS candidate_profiles_ai_followups_idx
  ON public.candidate_profiles USING gin (ai_followups);

CREATE TABLE IF NOT EXISTS public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  surface text NOT NULL,
  input_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  model text,
  ok boolean NOT NULL DEFAULT true,
  error text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_logs TO authenticated;
GRANT ALL ON public.ai_logs TO service_role;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_logs_admin_read ON public.ai_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY ai_logs_own_insert ON public.ai_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.employer_shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text CHECK (note IS NULL OR char_length(note) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employer_id, candidate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employer_shortlists TO authenticated;
GRANT ALL ON public.employer_shortlists TO service_role;
ALTER TABLE public.employer_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY shortlist_owner_all ON public.employer_shortlists FOR ALL TO authenticated
  USING (employer_id = auth.uid()) WITH CHECK (employer_id = auth.uid());
CREATE INDEX IF NOT EXISTS employer_shortlists_employer_idx ON public.employer_shortlists(employer_id);

CREATE TABLE IF NOT EXISTS public.filter_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_count integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.filter_usage_log TO authenticated;
GRANT ALL ON public.filter_usage_log TO service_role;
ALTER TABLE public.filter_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY filter_log_own_insert ON public.filter_usage_log FOR INSERT TO authenticated
  WITH CHECK (employer_id = auth.uid());
CREATE POLICY filter_log_admin_read ON public.filter_usage_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
