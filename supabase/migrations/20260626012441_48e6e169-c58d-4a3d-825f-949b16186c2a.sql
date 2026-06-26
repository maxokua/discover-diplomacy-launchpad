ALTER TABLE public.coach_applications
  ADD COLUMN IF NOT EXISTS responses jsonb,
  ADD COLUMN IF NOT EXISTS video1_url text,
  ADD COLUMN IF NOT EXISTS video2_url text,
  ADD COLUMN IF NOT EXISTS references_text text;