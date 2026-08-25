ALTER FUNCTION public.enqueue_email(TEXT, JSONB) SET search_path = '';
ALTER FUNCTION public.read_email_batch(TEXT, INT, INT) SET search_path = '';
ALTER FUNCTION public.delete_email(TEXT, BIGINT) SET search_path = '';
ALTER FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM anon, authenticated;