
-- resumes
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  original_filename text,
  content_type text,
  extracted_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own resumes"
  ON public.resumes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own resumes"
  ON public.resumes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own resumes"
  ON public.resumes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own resumes"
  ON public.resumes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);

CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- resume_analyses
CREATE TABLE public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  target_field text,
  experience_level text,
  overall_score integer CHECK (overall_score IS NULL OR (overall_score BETWEEN 0 AND 100)),
  ats_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  keyword_gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  wording_suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  formatting_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own analyses"
  ON public.resume_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own analyses"
  ON public.resume_analyses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.resumes r
      WHERE r.id = resume_id AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users update own analyses"
  ON public.resume_analyses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own analyses"
  ON public.resume_analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX idx_resume_analyses_resume_id ON public.resume_analyses(resume_id);

CREATE TRIGGER update_resume_analyses_updated_at
BEFORE UPDATE ON public.resume_analyses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();