
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
