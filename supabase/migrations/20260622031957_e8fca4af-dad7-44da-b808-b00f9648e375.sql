REVOKE EXECUTE ON FUNCTION public.sync_user_service_tier(uuid, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_service_tier(uuid, text) TO service_role;