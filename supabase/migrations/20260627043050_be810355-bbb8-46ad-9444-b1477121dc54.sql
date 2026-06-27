
DROP FUNCTION IF EXISTS public.unlock_candidate(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.unlock_candidate(
  _candidate_id uuid,
  _env text DEFAULT 'live'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _employer_id uuid := auth.uid();
  _existing_unlock uuid;
  _new_balance integer;
  _new_unlock_id uuid;
BEGIN
  IF _employer_id IS NULL OR _candidate_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT id INTO _existing_unlock
    FROM public.resume_unlocks
   WHERE employer_user_id = _employer_id
     AND member_id = _candidate_id
   ORDER BY unlocked_at DESC
   LIMIT 1;

  IF _existing_unlock IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _employer_id;
    RETURN jsonb_build_object(
      'ok', true, 'already_unlocked', true,
      'unlock_id', _existing_unlock, 'balance', COALESCE(_new_balance, 0)
    );
  END IF;

  UPDATE public.employer_credits
     SET balance = balance - 1,
         spent_total = spent_total + 1,
         updated_at = now()
   WHERE user_id = _employer_id
     AND balance > 0
   RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_credits');
  END IF;

  INSERT INTO public.resume_unlocks (employer_user_id, member_id, credits_used)
    VALUES (_employer_id, _candidate_id, 1)
    RETURNING id INTO _new_unlock_id;

  INSERT INTO public.employer_credit_ledger (user_id, delta, reason, resume_id, environment)
    VALUES (_employer_id, -1, 'unlock', _new_unlock_id, _env);

  RETURN jsonb_build_object(
    'ok', true, 'already_unlocked', false,
    'unlock_id', _new_unlock_id, 'balance', _new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_candidate(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, text) TO authenticated, service_role;
