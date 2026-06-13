
DROP POLICY IF EXISTS "Users upload own resume files" ON storage.objects;
CREATE POLICY "Users upload own resume files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('pdf','doc','docx')
);

DROP POLICY IF EXISTS "Users update own resume files" ON storage.objects;
CREATE POLICY "Users update own resume files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('pdf','doc','docx')
);
