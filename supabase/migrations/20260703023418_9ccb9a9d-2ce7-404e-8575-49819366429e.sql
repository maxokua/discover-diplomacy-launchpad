
-- 1) Extend profiles
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

-- 2) Coaches directory
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

-- 3) 90-day plan checklist state
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

-- 4) Seed sample coaches (idempotent by slug)
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
