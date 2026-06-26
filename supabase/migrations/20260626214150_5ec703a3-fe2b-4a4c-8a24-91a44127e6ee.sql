-- Employer credit balances (per employer user)
CREATE TABLE public.employer_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  granted_total integer NOT NULL DEFAULT 0 CHECK (granted_total >= 0),
  spent_total integer NOT NULL DEFAULT 0 CHECK (spent_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.employer_credits TO authenticated;
GRANT ALL ON public.employer_credits TO service_role;

ALTER TABLE public.employer_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own credit balance"
  ON public.employer_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_employer_credits_updated_at
  BEFORE UPDATE ON public.employer_credits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit ledger
CREATE TABLE public.employer_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('purchase', 'unlock', 'admin_grant', 'admin_revoke', 'refund')),
  stripe_session_id text,
  resume_id uuid,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_emp_credit_ledger_user ON public.employer_credit_ledger(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_emp_credit_ledger_session ON public.employer_credit_ledger(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

GRANT SELECT ON public.employer_credit_ledger TO authenticated;
GRANT ALL ON public.employer_credit_ledger TO service_role;

ALTER TABLE public.employer_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own ledger"
  ON public.employer_credit_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Atomic spend: deduct one credit + write ledger row. Returns the new balance,
-- or NULL if the employer has no balance.
CREATE OR REPLACE FUNCTION public.employer_spend_credit(
  _user_id uuid,
  _resume_id uuid,
  _env text DEFAULT 'live'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance integer;
BEGIN
  UPDATE public.employer_credits
     SET balance = balance - 1,
         spent_total = spent_total + 1,
         updated_at = now()
   WHERE user_id = _user_id
     AND balance > 0
   RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.employer_credit_ledger
    (user_id, delta, reason, resume_id, environment)
  VALUES (_user_id, -1, 'unlock', _resume_id, _env);

  RETURN _new_balance;
END;
$$;

-- Grant credits from a verified Stripe purchase (idempotent on session id)
CREATE OR REPLACE FUNCTION public.employer_grant_purchase(
  _user_id uuid,
  _credits integer,
  _stripe_session_id text,
  _env text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance integer;
  _existing uuid;
BEGIN
  IF _credits IS NULL OR _credits <= 0 THEN RETURN NULL; END IF;

  -- Idempotency: bail if we already processed this session
  SELECT id INTO _existing FROM public.employer_credit_ledger
   WHERE stripe_session_id = _stripe_session_id LIMIT 1;
  IF _existing IS NOT NULL THEN
    SELECT balance INTO _new_balance FROM public.employer_credits WHERE user_id = _user_id;
    RETURN _new_balance;
  END IF;

  INSERT INTO public.employer_credits (user_id, balance, granted_total)
    VALUES (_user_id, _credits, _credits)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.employer_credits.balance + EXCLUDED.balance,
          granted_total = public.employer_credits.granted_total + EXCLUDED.granted_total,
          updated_at = now()
    RETURNING balance INTO _new_balance;

  INSERT INTO public.employer_credit_ledger
    (user_id, delta, reason, stripe_session_id, environment)
  VALUES (_user_id, _credits, 'purchase', _stripe_session_id, _env);

  RETURN _new_balance;
END;
$$;