ALTER TABLE public.resume_reviews
  ADD COLUMN IF NOT EXISTS visible_to_employers boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visible_to_coaches boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS resume_reviews_visible_to_employers_idx
  ON public.resume_reviews (visible_to_employers) WHERE visible_to_employers = true;
CREATE INDEX IF NOT EXISTS resume_reviews_visible_to_coaches_idx
  ON public.resume_reviews (visible_to_coaches) WHERE visible_to_coaches = true;