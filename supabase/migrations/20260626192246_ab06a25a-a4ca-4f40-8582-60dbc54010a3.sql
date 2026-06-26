
-- 1. university_leads: lock down status + add length limits
ALTER TABLE public.university_leads
  ADD CONSTRAINT university_leads_status_vals
  CHECK (status IN ('new','contacted','qualified','won','lost'));

ALTER TABLE public.university_leads
  ADD CONSTRAINT university_leads_contact_title_len CHECK (contact_title IS NULL OR length(contact_title) <= 200),
  ADD CONSTRAINT university_leads_start_date_pref_len CHECK (start_date_pref IS NULL OR length(start_date_pref) <= 200),
  ADD CONSTRAINT university_leads_budget_cycle_len CHECK (budget_cycle IS NULL OR length(budget_cycle) <= 200);

DROP POLICY IF EXISTS "Anyone can submit a university lead" ON public.university_leads;
CREATE POLICY "Anyone can submit a university lead"
  ON public.university_leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');

-- 2. employer_intros: explicit admin-only write policies (service role bypasses RLS)
CREATE POLICY "Admins can insert intros" ON public.employer_intros
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update intros" ON public.employer_intros
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete intros" ON public.employer_intros
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. resume_unlocks: explicit admin-only write policies (service role bypasses RLS)
CREATE POLICY "Admins can insert unlocks" ON public.resume_unlocks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update unlocks" ON public.resume_unlocks
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete unlocks" ON public.resume_unlocks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
