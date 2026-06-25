ALTER TABLE public.resume_analyses
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS priority_fixes jsonb NOT NULL DEFAULT '[]'::jsonb;