
-- resumes bucket: users own a folder named after their user id
CREATE POLICY "Users read own resume files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own resume files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own resume files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins read all resume files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- coach-resumes bucket: open uploads, admin-only reads
CREATE POLICY "Anyone can upload coach resume" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'coach-resumes');
CREATE POLICY "Admins read coach resumes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'coach-resumes' AND public.has_role(auth.uid(), 'admin'));