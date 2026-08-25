
-- ─── University Enterprise Program: schema ──────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'university_admin'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'university_admin';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.university_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_title text,
  department text NOT NULL,
  est_students integer NOT NULL,
  funding_model text NOT NULL,
  start_date_pref text,
  budget_cycle text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT university_leads_name_len CHECK (char_length(university_name) BETWEEN 2 AND 200),
  CONSTRAINT university_leads_contact_name_len CHECK (char_length(contact_name) BETWEEN 2 AND 100),
  CONSTRAINT university_leads_email_len CHECK (char_length(contact_email) BETWEEN 5 AND 254),
  CONSTRAINT university_leads_email_fmt CHECK (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT university_leads_department_len CHECK (char_length(department) BETWEEN 2 AND 120),
  CONSTRAINT university_leads_students_range CHECK (est_students BETWEEN 1 AND 100000),
  CONSTRAINT university_leads_funding_vals CHECK (funding_model IN ('direct','student_cost','hybrid','undecided')),
  CONSTRAINT university_leads_notes_len CHECK (notes IS NULL OR char_length(notes) <= 4000)
);

GRANT INSERT ON public.university_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.university_leads TO authenticated;
GRANT ALL ON public.university_leads TO service_role;

ALTER TABLE public.university_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a university lead"
  ON public.university_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view university leads"
  ON public.university_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update university leads"
  ON public.university_leads
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete university leads"
  ON public.university_leads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER university_leads_updated_at
  BEFORE UPDATE ON public.university_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.university_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  program_name text,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_email text NOT NULL,
  student_count integer NOT NULL DEFAULT 0,
  funding_model text NOT NULL DEFAULT 'direct',
  monthly_rate_cents integer NOT NULL DEFAULT 2000,
  status text NOT NULL DEFAULT 'onboarding',
  started_at date,
  renewal_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cohorts_name_len CHECK (char_length(university_name) BETWEEN 2 AND 200),
  CONSTRAINT cohorts_email_fmt CHECK (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT cohorts_funding_vals CHECK (funding_model IN ('direct','student_cost','hybrid')),
  CONSTRAINT cohorts_status_vals CHECK (status IN ('onboarding','active','paused','ended')),
  CONSTRAINT cohorts_students_range CHECK (student_count BETWEEN 0 AND 100000),
  CONSTRAINT cohorts_rate_range CHECK (monthly_rate_cents BETWEEN 0 AND 1000000)
);

CREATE INDEX IF NOT EXISTS university_cohorts_admin_idx ON public.university_cohorts(admin_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.university_cohorts TO authenticated;
GRANT ALL ON public.university_cohorts TO service_role;

ALTER TABLE public.university_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all cohorts"
  ON public.university_cohorts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cohort admin can view own cohort"
  ON public.university_cohorts
  FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid());

CREATE TRIGGER university_cohorts_updated_at
  BEFORE UPDATE ON public.university_cohorts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.university_cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.university_cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text,
  graduation_year integer,
  status text NOT NULL DEFAULT 'invited',
  invited_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cohort_member_email_fmt CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT cohort_member_status_vals CHECK (status IN ('invited','active','graduated','removed')),
  CONSTRAINT cohort_member_grad_range CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1950 AND 2100),
  CONSTRAINT cohort_member_name_len CHECK (full_name IS NULL OR char_length(full_name) <= 200),
  UNIQUE (cohort_id, email)
);

CREATE INDEX IF NOT EXISTS cohort_members_cohort_idx ON public.university_cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_members_user_idx ON public.university_cohort_members(user_id);
CREATE INDEX IF NOT EXISTS cohort_members_email_idx ON public.university_cohort_members(lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.university_cohort_members TO authenticated;
GRANT ALL ON public.university_cohort_members TO service_role;

ALTER TABLE public.university_cohort_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all cohort members"
  ON public.university_cohort_members
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cohort admin can view own members"
  ON public.university_cohort_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.university_cohorts c
      WHERE c.id = cohort_id AND c.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Cohort member can view own row"
  ON public.university_cohort_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER university_cohort_members_updated_at
  BEFORE UPDATE ON public.university_cohort_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.link_cohort_member_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.university_cohort_members
     SET user_id = NEW.id,
         status = CASE WHEN status = 'invited' THEN 'active' ELSE status END,
         activated_at = COALESCE(activated_at, now())
   WHERE lower(email) = lower(NEW.email)
     AND user_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_cohort_member_after_user ON auth.users;
CREATE TRIGGER link_cohort_member_after_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_cohort_member_on_signup();

ALTER TABLE public.university_leads
  ADD CONSTRAINT university_leads_status_vals
  CHECK (status IN ('new','contacted','qualified','won','lost'));

ALTER TABLE public.university_leads
  ADD CONSTRAINT university_leads_contact_title_len CHECK (contact_title IS NULL OR length(contact_title) <= 200),
  ADD CONSTRAINT university_leads_start_date_pref_len CHECK (start_date_pref IS NULL OR length(start_date_pref) <= 200),
  ADD CONSTRAINT university_leads_budget_cycle_len CHECK (budget_cycle IS NULL OR length(budget_cycle) <= 200);

DROP POLICY IF EXISTS "Anyone can submit a university lead" ON public.university_leads;
CREATE POLICY "Anyone can submit a university lead"
  ON public.university_leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "Admins can insert intros" ON public.employer_intros
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update intros" ON public.employer_intros
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete intros" ON public.employer_intros
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert unlocks" ON public.resume_unlocks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update unlocks" ON public.resume_unlocks
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete unlocks" ON public.resume_unlocks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_user_service_tier(_user_id uuid, _env text DEFAULT 'live'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tier text := NULL;
  _price text;
BEGIN
  SELECT price_id INTO _price
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND environment = _env
    AND (
      status IN ('active', 'trialing', 'past_due')
      OR (status = 'canceled' AND current_period_end > now())
    )
  ORDER BY
    CASE
      WHEN price_id IN ('envoy_monthly', 'envoy_annual') THEN 1
      WHEN price_id IN ('compass_monthly', 'compass_monthly_20', 'compass_annual') THEN 2
      ELSE 3
    END,
    created_at DESC
  LIMIT 1;

  IF _price IN ('envoy_monthly', 'envoy_annual') THEN
    _tier := 'envoy';
  ELSIF _price IN ('compass_monthly', 'compass_monthly_20', 'compass_annual') THEN
    _tier := 'compass';
  END IF;

  UPDATE public.profiles SET service_tier = _tier WHERE id = _user_id;
END;
$function$;
CREATE POLICY "Users delete own resume files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE TABLE public.employer_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  granted_total integer NOT NULL DEFAULT 0 CHECK (granted_total >= 0),
  spent_total integer NOT NULL DEFAULT 0 CHECK (spent_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.employer_credits TO authenticated;
GRANT ALL ON public.employer_credits TO service_role;

ALTER TABLE public.employer_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own credit balance"
  ON public.employer_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_employer_credits_updated_at
  BEFORE UPDATE ON public.employer_credits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.employer_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('purchase', 'unlock', 'admin_grant', 'admin_revoke', 'refund')),
  stripe_session_id text,
  resume_id uuid,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_emp_credit_ledger_user ON public.employer_credit_ledger(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_emp_credit_ledger_session ON public.employer_credit_ledger(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

GRANT SELECT ON public.employer_credit_ledger TO authenticated;
GRANT ALL ON public.employer_credit_ledger TO service_role;

ALTER TABLE public.employer_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own ledger"
  ON public.employer_credit_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.employer_spend_credit(
  _user_id uuid,
  _resume_id uuid,
  _env text DEFAULT 'live'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance integer;
BEGIN
  UPDATE public.employer_credits
     SET balance = balance - 1,
         spent_total = spent_total + 1,
         updated_at = now()
   WHERE user_id = _user_id
     AND balance > 0
   RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.employer_credit_ledger
    (user_id, delta, reason, resume_id, environment)
  VALUES (_user_id, -1, 'unlock', _resume_id, _env);

  RETURN _new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.employer_grant_purchase(
  _user_id uuid,
  _credits integer,
  _stripe_session_id text,
  _env text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance integer;
  _existing uuid;
BEGIN
  IF _credits IS NULL OR _credits <= 0 THEN RETURN NULL; END IF;

  SELECT id INTO _existing FROM public.employer_credit_ledger
   WHERE stripe_session_id = _stripe_session_id LIMIT 1;
  IF _existing IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _user_id;
    RETURN _new_balance;
  END IF;

  INSERT INTO public.employer_credits (user_id, balance, granted_total)
    VALUES (_user_id, _credits, _credits)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.employer_credits.balance + EXCLUDED.balance,
          granted_total = public.employer_credits.granted_total + EXCLUDED.granted_total,
          updated_at = now()
    RETURNING balance INTO _new_balance;

  INSERT INTO public.employer_credit_ledger
    (user_id, delta, reason, stripe_session_id, environment)
  VALUES (_user_id, _credits, 'purchase', _stripe_session_id, _env);

  RETURN _new_balance;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.employer_spend_credit(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.employer_grant_purchase(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
CREATE TABLE public.candidate_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text,
  bio text,
  target_roles text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  regions text[] NOT NULL DEFAULT '{}',
  sectors text[] NOT NULL DEFAULT '{}',
  experience_level text,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO service_role;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own profile"
  ON public.candidate_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers and admins can view public profiles"
  ON public.candidate_profiles FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    AND (
      public.has_role(auth.uid(), 'employer')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE TRIGGER candidate_profiles_set_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX candidate_profiles_skills_idx
  ON public.candidate_profiles USING GIN (skills);
CREATE INDEX candidate_profiles_regions_idx
  ON public.candidate_profiles USING GIN (regions);
CREATE INDEX candidate_profiles_sectors_idx
  ON public.candidate_profiles USING GIN (sectors);

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS years_intl text,
  ADD COLUMN IF NOT EXISTS career_stage text,
  ADD COLUMN IF NOT EXISTS highest_degree text,
  ADD COLUMN IF NOT EXISTS management_experience text,
  ADD COLUMN IF NOT EXISTS budget_responsibility text,
  ADD COLUMN IF NOT EXISTS org_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS functional_skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_theme text,
  ADD COLUMN IF NOT EXISTS secondary_themes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technical_skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language_proficiencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_base text,
  ADD COLUMN IF NOT EXISTS work_eligibility text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS relocation text,
  ADD COLUMN IF NOT EXISTS relocation_regions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_mode text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS work_type text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS roles_seeking text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_sectors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS salary_expectation text,
  ADD COLUMN IF NOT EXISTS security_clearance text,
  ADD COLUMN IF NOT EXISTS fellowship_category text,
  ADD COLUMN IF NOT EXISTS internship_count text,
  ADD COLUMN IF NOT EXISTS profile_completion_percent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_status text NOT NULL DEFAULT 'draft' CHECK (profile_status IN ('draft','complete','published')),
  ADD COLUMN IF NOT EXISTS include_in_resume_drop boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS candidate_profiles_career_stage_idx ON public.candidate_profiles (career_stage);
CREATE INDEX IF NOT EXISTS candidate_profiles_primary_theme_idx ON public.candidate_profiles (primary_theme);
CREATE INDEX IF NOT EXISTS candidate_profiles_current_base_idx ON public.candidate_profiles (current_base);
CREATE INDEX IF NOT EXISTS candidate_profiles_org_types_idx ON public.candidate_profiles USING GIN (org_types);
CREATE INDEX IF NOT EXISTS candidate_profiles_functional_skills_idx ON public.candidate_profiles USING GIN (functional_skills);
CREATE INDEX IF NOT EXISTS candidate_profiles_work_eligibility_idx ON public.candidate_profiles USING GIN (work_eligibility);
CREATE INDEX IF NOT EXISTS candidate_profiles_target_sectors_idx ON public.candidate_profiles USING GIN (target_sectors);

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

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS share_email_on_unlock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_email_on_unlock boolean NOT NULL DEFAULT true;

ALTER TABLE public.employer_intros
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

ALTER TABLE public.employer_intros
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.employer_intros
  DROP CONSTRAINT IF EXISTS employer_intros_status_chk;
ALTER TABLE public.employer_intros
  ADD CONSTRAINT employer_intros_status_chk CHECK (
    status = ANY (ARRAY['pending','accepted','declined','connected','closed','sent','read','responded'])
  );

ALTER TABLE public.employer_intros
  DROP CONSTRAINT IF EXISTS employer_intros_reason_chk;
ALTER TABLE public.employer_intros
  ADD CONSTRAINT employer_intros_reason_chk CHECK (
    reason IS NULL OR reason = ANY (ARRAY[
      'open_role_exploratory','open_role_active','pipeline','specific_project'
    ])
  );

DROP POLICY IF EXISTS "Employers can request intros for unlocked candidates" ON public.employer_intros;
CREATE POLICY "Employers can request intros for unlocked candidates"
  ON public.employer_intros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_user_id
    AND EXISTS (
      SELECT 1 FROM public.resume_unlocks u
      WHERE u.employer_user_id = auth.uid()
        AND u.member_id = employer_intros.member_id
    )
  );

DROP POLICY IF EXISTS "Members can respond to their intros" ON public.employer_intros;
CREATE POLICY "Members can respond to their intros"
  ON public.employer_intros
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Employers can update their intros" ON public.employer_intros;
CREATE POLICY "Employers can update their intros"
  ON public.employer_intros
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_user_id)
  WITH CHECK (auth.uid() = employer_user_id);

CREATE OR REPLACE FUNCTION public.unlock_candidate(
  _employer_id uuid,
  _candidate_id uuid,
  _env text DEFAULT 'live'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_unlock uuid;
  _new_balance integer;
  _new_unlock_id uuid;
BEGIN
  IF _employer_id IS NULL OR _candidate_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_input');
  END IF;

  SELECT id INTO _existing_unlock
    FROM public.resume_unlocks
   WHERE employer_user_id = _employer_id
     AND member_id = _candidate_id
   ORDER BY unlocked_at DESC
   LIMIT 1;

  IF _existing_unlock IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _employer_id;
    RETURN jsonb_build_object(
      'ok', true,
      'already_unlocked', true,
      'unlock_id', _existing_unlock,
      'balance', COALESCE(_new_balance, 0)
    );
  END IF;

  UPDATE public.employer_credits
     SET balance = balance - 1,
         spent_total = spent_total + 1,
         updated_at = now()
   WHERE user_id = _employer_id
     AND balance > 0
   RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_credits');
  END IF;

  INSERT INTO public.resume_unlocks (employer_user_id, member_id, credits_used)
    VALUES (_employer_id, _candidate_id, 1)
    RETURNING id INTO _new_unlock_id;

  INSERT INTO public.employer_credit_ledger (user_id, delta, reason, resume_id, environment)
    VALUES (_employer_id, -1, 'unlock', _new_unlock_id, _env);

  RETURN jsonb_build_object(
    'ok', true,
    'already_unlocked', false,
    'unlock_id', _new_unlock_id,
    'balance', _new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_candidate(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, uuid, text) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.unlock_candidate(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.unlock_candidate(
  _candidate_id uuid,
  _env text DEFAULT 'live'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _employer_id uuid := auth.uid();
  _existing_unlock uuid;
  _new_balance integer;
  _new_unlock_id uuid;
BEGIN
  IF _employer_id IS NULL OR _candidate_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT id INTO _existing_unlock
    FROM public.resume_unlocks
   WHERE employer_user_id = _employer_id
     AND member_id = _candidate_id
   ORDER BY unlocked_at DESC
   LIMIT 1;

  IF _existing_unlock IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _employer_id;
    RETURN jsonb_build_object(
      'ok', true, 'already_unlocked', true,
      'unlock_id', _existing_unlock, 'balance', COALESCE(_new_balance, 0)
    );
  END IF;

  UPDATE public.employer_credits
     SET balance = balance - 1,
         spent_total = spent_total + 1,
         updated_at = now()
   WHERE user_id = _employer_id
     AND balance > 0
   RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_credits');
  END IF;

  INSERT INTO public.resume_unlocks (employer_user_id, member_id, credits_used)
    VALUES (_employer_id, _candidate_id, 1)
    RETURNING id INTO _new_unlock_id;

  INSERT INTO public.employer_credit_ledger (user_id, delta, reason, resume_id, environment)
    VALUES (_employer_id, -1, 'unlock', _new_unlock_id, _env);

  RETURN jsonb_build_object(
    'ok', true, 'already_unlocked', false,
    'unlock_id', _new_unlock_id, 'balance', _new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_candidate(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, text) TO authenticated, service_role;
ALTER TABLE public.assessment_leads ADD COLUMN IF NOT EXISTS ip_hash text; CREATE INDEX IF NOT EXISTS idx_assessment_leads_ip_hash_created ON public.assessment_leads (ip_hash, created_at DESC);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dashboard_role text NOT NULL DEFAULT 'candidate',
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assessment_answers jsonb,
  ADD COLUMN IF NOT EXISTS archetype text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_dashboard_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_dashboard_role_check
  CHECK (dashboard_role IN ('candidate','employer','university'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free','compass','envoy'));

CREATE TABLE IF NOT EXISTS public.coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  background text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  price_per_session_cents integer NOT NULL DEFAULT 0,
  avatar_kind text NOT NULL DEFAULT 'illustration',
  photo_url text,
  is_sample boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coaches TO authenticated;
GRANT ALL ON public.coaches TO service_role;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Any signed-in user can view coaches" ON public.coaches;
CREATE POLICY "Any signed-in user can view coaches"
  ON public.coaches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage coaches" ON public.coaches;
CREATE POLICY "Admins can manage coaches"
  ON public.coaches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_coaches_updated_at ON public.coaches;
CREATE TRIGGER trg_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.plan_task_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('p1','p2','p3')),
  task_index integer NOT NULL CHECK (task_index >= 0 AND task_index < 20),
  checked boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phase, task_index)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_task_progress TO authenticated;
GRANT ALL ON public.plan_task_progress TO service_role;
ALTER TABLE public.plan_task_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own plan progress" ON public.plan_task_progress;
CREATE POLICY "Users manage own plan progress"
  ON public.plan_task_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_plan_task_progress_updated_at ON public.plan_task_progress;
CREATE TRIGGER trg_plan_task_progress_updated_at
  BEFORE UPDATE ON public.plan_task_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.coaches (slug, name, title, background, specialties, languages, price_per_session_cents, is_sample, sort_order)
VALUES
  ('sample-fso', 'Sample: Former Foreign Service Officer',
    'Retired FSO · Political Cone',
    '20 years at State Department across 4 overseas posts (Cairo, Bogotá, Warsaw, Manila). Former deputy political counselor.',
    ARRAY['FSOT/FSOA prep','Consular careers','Political cone strategy','Post bidding'],
    ARRAY['English','Spanish','Arabic'],
    12000, true, 1),
  ('sample-think-tank', 'Sample: Think Tank Research Director',
    'Hiring Manager · DC Think Tank',
    'Research Director at a major DC think tank. Has hired 40+ research associates over the past decade.',
    ARRAY['Policy writing samples','RA interviews','Think tank job market','Publication strategy'],
    ARRAY['English'],
    10000, true, 2),
  ('sample-un', 'Sample: UN Program Officer',
    'P-4 · UNDP',
    '12 years at UNDP split between field missions (Kenya, Bangladesh) and headquarters roles in New York.',
    ARRAY['UN entry programs (JPO/UNV)','P-track applications','Inspira system','Field vs HQ tradeoffs'],
    ARRAY['English','French','Swahili'],
    11000, true, 3),
  ('sample-risk', 'Sample: Political Risk Consultant',
    'Director · Private Sector Advisory',
    'Directs a country-risk team at a private geopolitical advisory. Formerly at a top global consultancy.',
    ARRAY['Private-sector transitions','Case interviews','Political risk writing','Client-facing communication'],
    ARRAY['English','Mandarin Chinese'],
    11500, true, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  background = EXCLUDED.background,
  specialties = EXCLUDED.specialties,
  languages = EXCLUDED.languages,
  price_per_session_cents = EXCLUDED.price_per_session_cents,
  is_sample = EXCLUDED.is_sample,
  sort_order = EXCLUDED.sort_order;
GRANT INSERT ON public.waitlist TO anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;