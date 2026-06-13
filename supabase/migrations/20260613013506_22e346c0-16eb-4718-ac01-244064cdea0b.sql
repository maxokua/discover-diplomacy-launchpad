
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN PERFORM pgmq.create(dlq_name); EXCEPTION WHEN OTHERS THEN NULL; END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN PERFORM pgmq.delete(source_queue, message_id); EXCEPTION WHEN undefined_table THEN NULL; END;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(text,integer,integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text,bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text,text,bigint,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text,bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text,text,bigint,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text,jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.lock_resume_review_sensitive_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
     OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.environment IS DISTINCT FROM OLD.environment THEN
    RAISE EXCEPTION 'Cannot modify payment-sensitive fields';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.lock_resume_review_sensitive_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS lock_resume_review_sensitive_fields ON public.resume_reviews;
CREATE TRIGGER lock_resume_review_sensitive_fields
BEFORE UPDATE ON public.resume_reviews
FOR EACH ROW EXECUTE FUNCTION public.lock_resume_review_sensitive_fields();

DROP POLICY IF EXISTS "Anyone can submit contact inquiries" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact inquiries"
ON public.contact_submissions FOR INSERT
WITH CHECK (
  char_length(coalesce(first_name, '')) BETWEEN 1 AND 200
  AND char_length(coalesce(last_name, '')) BETWEEN 1 AND 200
  AND char_length(coalesce(email, '')) BETWEEN 3 AND 320
  AND char_length(coalesce(message, '')) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Anyone can upload coach resume" ON storage.objects;
CREATE POLICY "Anyone can upload coach resume"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coach-resumes'
  AND name LIKE 'applications/%'
  AND lower(storage.extension(name)) IN ('pdf','doc','docx')
);

CREATE POLICY "Admins delete coach resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'coach-resumes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete resume files"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
