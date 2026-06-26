
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
