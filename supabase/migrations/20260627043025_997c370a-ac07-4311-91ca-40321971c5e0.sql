
-- 1) Candidate privacy flags
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS share_email_on_unlock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_email_on_unlock boolean NOT NULL DEFAULT true;

-- 2) Intro: accept/decline lifecycle + reason
ALTER TABLE public.employer_intros
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

ALTER TABLE public.employer_intros
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.employer_intros
  DROP CONSTRAINT IF EXISTS employer_intros_status_chk;
ALTER TABLE public.employer_intros
  ADD CONSTRAINT employer_intros_status_chk CHECK (
    status = ANY (ARRAY['pending','accepted','declined','connected','closed','sent','read','responded'])
  );

ALTER TABLE public.employer_intros
  DROP CONSTRAINT IF EXISTS employer_intros_reason_chk;
ALTER TABLE public.employer_intros
  ADD CONSTRAINT employer_intros_reason_chk CHECK (
    reason IS NULL OR reason = ANY (ARRAY[
      'open_role_exploratory','open_role_active','pipeline','specific_project'
    ])
  );

-- 3) Allow employers to insert intros only if they've already unlocked the member.
DROP POLICY IF EXISTS "Employers can request intros for unlocked candidates" ON public.employer_intros;
CREATE POLICY "Employers can request intros for unlocked candidates"
  ON public.employer_intros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_user_id
    AND EXISTS (
      SELECT 1 FROM public.resume_unlocks u
      WHERE u.employer_user_id = auth.uid()
        AND u.member_id = employer_intros.member_id
    )
  );

-- Candidates accept/decline intros sent to them
DROP POLICY IF EXISTS "Members can respond to their intros" ON public.employer_intros;
CREATE POLICY "Members can respond to their intros"
  ON public.employer_intros
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- Employers can mark their own intros closed/connected
DROP POLICY IF EXISTS "Employers can update their intros" ON public.employer_intros;
CREATE POLICY "Employers can update their intros"
  ON public.employer_intros
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_user_id)
  WITH CHECK (auth.uid() = employer_user_id);

-- 4) Atomic, idempotent unlock RPC
CREATE OR REPLACE FUNCTION public.unlock_candidate(
  _employer_id uuid,
  _candidate_id uuid,
  _env text DEFAULT 'live'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_unlock uuid;
  _new_balance integer;
  _new_unlock_id uuid;
BEGIN
  IF _employer_id IS NULL OR _candidate_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_input');
  END IF;

  -- Idempotent: existing unlock => no charge
  SELECT id INTO _existing_unlock
    FROM public.resume_unlocks
   WHERE employer_user_id = _employer_id
     AND member_id = _candidate_id
   ORDER BY unlocked_at DESC
   LIMIT 1;

  IF _existing_unlock IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _employer_id;
    RETURN jsonb_build_object(
      'ok', true,
      'already_unlocked', true,
      'unlock_id', _existing_unlock,
      'balance', COALESCE(_new_balance, 0)
    );
  END IF;

  -- Atomic decrement
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
    'ok', true,
    'already_unlocked', false,
    'unlock_id', _new_unlock_id,
    'balance', _new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_candidate(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_candidate(uuid, uuid, text) TO authenticated, service_role;
