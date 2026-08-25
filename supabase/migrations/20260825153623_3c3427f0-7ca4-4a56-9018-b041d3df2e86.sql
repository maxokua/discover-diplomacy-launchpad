CREATE OR REPLACE FUNCTION public.university_cohort_engagement(_cohort_id uuid)
RETURNS TABLE (
  total_members integer,
  active_members integer,
  graduated_members integer,
  resumes_uploaded integer,
  resume_analyses integer,
  resume_reviews integer,
  resume_drop_optins integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _is_cohort_admin boolean;
BEGIN
  _is_admin := public.has_role(auth.uid(), 'admin');
  SELECT EXISTS (
    SELECT 1 FROM public.university_cohorts c
    WHERE c.id = _cohort_id AND c.admin_user_id = auth.uid()
  ) INTO _is_cohort_admin;

  IF NOT (_is_admin OR _is_cohort_admin) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  WITH members AS (
    SELECT user_id, status
      FROM public.university_cohort_members
     WHERE cohort_id = _cohort_id
  ),
  uids AS (SELECT user_id FROM members WHERE user_id IS NOT NULL)
  SELECT
    (SELECT COUNT(*)::int FROM members),
    (SELECT COUNT(*)::int FROM members WHERE status = 'active'),
    (SELECT COUNT(*)::int FROM members WHERE status = 'graduated'),
    (SELECT COUNT(*)::int FROM public.resumes r WHERE r.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.resume_analyses a WHERE a.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.resume_reviews rr WHERE rr.user_id IN (SELECT user_id FROM uids)),
    (SELECT COUNT(*)::int FROM public.member_resume_drop d WHERE d.user_id IN (SELECT user_id FROM uids) AND d.opted_in = true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.university_cohort_engagement(uuid) TO authenticated;