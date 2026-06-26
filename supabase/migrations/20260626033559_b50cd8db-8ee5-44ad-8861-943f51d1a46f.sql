
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.org_category AS ENUM ('government','ngo','think_tank','multilateral','company','foundation','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.org_verification_status AS ENUM ('pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.resume_drop_status AS ENUM ('opted_in','opted_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.resume_drop_visibility AS ENUM ('all','selected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ ORGANIZATIONS ============
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category public.org_category NOT NULL DEFAULT 'other',
  logo_url text,
  website text,
  verification_status public.org_verification_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_name_len CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT organizations_slug_len CHECK (char_length(slug) BETWEEN 1 AND 200)
);
CREATE INDEX IF NOT EXISTS organizations_verified_idx ON public.organizations(verification_status) WHERE verification_status='verified';
CREATE INDEX IF NOT EXISTS organizations_category_idx ON public.organizations(category);

GRANT SELECT ON public.organizations TO anon, authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified organizations"
  ON public.organizations FOR SELECT TO anon, authenticated
  USING (verification_status = 'verified');

CREATE POLICY "Admins can view all organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert organizations"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update organizations"
  ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete organizations"
  ON public.organizations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MEMBER RESUME DROP ============
CREATE TABLE IF NOT EXISTS public.member_resume_drop (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.resume_drop_status NOT NULL DEFAULT 'opted_out',
  visibility public.resume_drop_visibility NOT NULL DEFAULT 'all',
  seen_intro_at timestamptz,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_resume_drop TO authenticated;
GRANT ALL ON public.member_resume_drop TO service_role;
ALTER TABLE public.member_resume_drop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own resume drop row"
  ON public.member_resume_drop FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all resume drop rows"
  ON public.member_resume_drop FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER member_resume_drop_updated_at BEFORE UPDATE ON public.member_resume_drop
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MEMBER RESUME DROP ORGS ============
CREATE TABLE IF NOT EXISTS public.member_resume_drop_orgs (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);
CREATE INDEX IF NOT EXISTS member_resume_drop_orgs_user_idx ON public.member_resume_drop_orgs(user_id);

GRANT SELECT, INSERT, DELETE ON public.member_resume_drop_orgs TO authenticated;
GRANT ALL ON public.member_resume_drop_orgs TO service_role;
ALTER TABLE public.member_resume_drop_orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own org selections"
  ON public.member_resume_drop_orgs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============ RESUME UNLOCKS ============
CREATE TABLE IF NOT EXISTS public.resume_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  credits_used integer NOT NULL DEFAULT 1,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resume_unlocks_member_idx ON public.resume_unlocks(member_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS resume_unlocks_employer_idx ON public.resume_unlocks(employer_user_id, unlocked_at DESC);

GRANT SELECT ON public.resume_unlocks TO authenticated;
GRANT ALL ON public.resume_unlocks TO service_role;
ALTER TABLE public.resume_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see their unlocks"
  ON public.resume_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "Employers can see unlocks they performed"
  ON public.resume_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = employer_user_id);

CREATE POLICY "Admins can see all unlocks"
  ON public.resume_unlocks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ EMPLOYER INTROS ============
CREATE TABLE IF NOT EXISTS public.employer_intros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unlock_id uuid REFERENCES public.resume_unlocks(id) ON DELETE SET NULL,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employer_intros_status_chk CHECK (status IN ('sent','read','responded','closed')),
  CONSTRAINT employer_intros_message_len CHECK (message IS NULL OR char_length(message) <= 5000)
);
CREATE INDEX IF NOT EXISTS employer_intros_member_idx ON public.employer_intros(member_id, created_at DESC);

GRANT SELECT ON public.employer_intros TO authenticated;
GRANT ALL ON public.employer_intros TO service_role;
ALTER TABLE public.employer_intros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read intros sent to them"
  ON public.employer_intros FOR SELECT TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "Employers can read intros they sent"
  ON public.employer_intros FOR SELECT TO authenticated
  USING (auth.uid() = employer_user_id);

CREATE POLICY "Admins can read all intros"
  ON public.employer_intros FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_kind_len CHECK (char_length(kind) BETWEEN 1 AND 64),
  CONSTRAINT notifications_title_len CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT notifications_body_len CHECK (body IS NULL OR char_length(body) <= 2000),
  CONSTRAINT notifications_link_len CHECK (link IS NULL OR char_length(link) <= 500)
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============ PLACEMENT FEE CONFIG (single row) ============
CREATE TABLE IF NOT EXISTS public.placement_fee_config (
  id boolean PRIMARY KEY DEFAULT true,
  alacarte_fee_cents integer NOT NULL DEFAULT 120000,
  alacarte_credits_back integer NOT NULL DEFAULT 3,
  starter_fee_cents integer NOT NULL DEFAULT 70000,
  starter_credits_back integer NOT NULL DEFAULT 4,
  professional_fee_cents integer NOT NULL DEFAULT 50000,
  professional_credits_back integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT placement_fee_singleton CHECK (id = true)
);

GRANT SELECT ON public.placement_fee_config TO anon, authenticated;
GRANT ALL ON public.placement_fee_config TO service_role;
ALTER TABLE public.placement_fee_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view placement fees"
  ON public.placement_fee_config FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert placement fees"
  ON public.placement_fee_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update placement fees"
  ON public.placement_fee_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER placement_fee_config_updated_at BEFORE UPDATE ON public.placement_fee_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.placement_fee_config (id) VALUES (true) ON CONFLICT DO NOTHING;

-- ============ EMPLOYER APPLICATIONS: source column ============
ALTER TABLE public.employer_applications
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'employer_apply';
