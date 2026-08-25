REVOKE EXECUTE ON FUNCTION public.university_cohort_engagement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.university_cohort_engagement(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.unlock_candidate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, text) TO authenticated;