
-- ─── University Enterprise Program: schema ──────────────────────────────────

-- 1) Add 'university_admin' to app_role enum
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

-- 2) university_leads: inquiries from /universities form (public insert allowed)
CREATE TABLE IF NOT EXISTS public.university_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_title text,
  department text NOT NULL,
  est_students integer NOT NULL,
  funding_model text NOT NULL,         -- 'direct' | 'student_cost' | 'hybrid' | 'undecided'
  start_date_pref text,                -- 'next_semester' | 'next_fall' | 'asap' | other
  budget_cycle text,
  notes text,
  status text NOT NULL DEFAULT 'new',  -- new | contacted | qualified | won | lost
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

-- 3) university_cohorts: signed-up universities
CREATE TABLE IF NOT EXISTS public.university_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  program_name text,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_email text NOT NULL,
  student_count integer NOT NULL DEFAULT 0,
  funding_model text NOT NULL DEFAULT 'direct',
  monthly_rate_cents integer NOT NULL DEFAULT 2000,  -- $20/student/mo
  status text NOT NULL DEFAULT 'onboarding',         -- onboarding | active | paused | ended
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

-- 4) university_cohort_members: student roster
CREATE TABLE IF NOT EXISTS public.university_cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.university_cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text,
  graduation_year integer,
  status text NOT NULL DEFAULT 'invited',   -- invited | active | graduated | removed
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

-- 5) Auto-link new signups to their cohort by email
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

-- 6) Engagement aggregate helper (admin / cohort admin only via RLS on inputs)
CREATE OR REPLACE FUNCTION public.university_cohort_engagement(_cohort_id uuid)
RETURNS TABLE (
  total_members integer,
  active_members integer,
  graduated_members integer,
  resumes_uploaded integer,
  resume_analyses integer,
  resume_reviews integer,
  resume_drop_optins integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _is_cohort_admin boolean;
BEGIN
  _is_admin := public.has_role(auth.uid(), 'admin');
  SELECT EXISTS (
    SELECT 1 FROM public.university_cohorts c
    WHERE c.id = _cohort_id AND c.admin_user_id = auth.uid()
  ) INTO _is_cohort_admin;

  IF NOT (_is_admin OR _is_cohort_admin) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  WITH members AS (
    SELECT user_id, status
      FROM public.university_cohort_members
     WHERE cohort_id = _cohort_id
  ),
  uids AS (SELECT user_id FROM members WHERE user_id IS NOT NULL)
  SELECT
    (SELECT COUNT(*)::int FROM members),
    (SELECT COUNT(*)::int FROM members WHERE status = 'active'),
    (SELECT COUNT(*)::int FROM members WHERE status = 'graduated'),
    (SELECT COUNT(*)::int FROM public.resumes r WHERE r.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.resume_analyses a WHERE a.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.resume_reviews rr WHERE rr.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.member_resume_drop d WHERE d.user_id IN (SELECT user_id FROM uids) AND d.opted_in = true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.university_cohort_engagement(uuid) TO authenticated;
