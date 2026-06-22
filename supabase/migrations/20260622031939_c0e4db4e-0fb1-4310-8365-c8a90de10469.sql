-- Add service_tier column to profiles to track active subscription plan
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_tier text;

-- Helper function for webhook to set or clear a user's service tier based on
-- their current subscriptions in the live environment.
CREATE OR REPLACE FUNCTION public.sync_user_service_tier(_user_id uuid, _env text DEFAULT 'live')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier text := NULL;
  _price text;
BEGIN
  SELECT price_id INTO _price
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND environment = _env
    AND (
      status IN ('active', 'trialing', 'past_due')
      OR (status = 'canceled' AND current_period_end > now())
    )
  ORDER BY
    CASE
      WHEN price_id = 'envoy_monthly' THEN 1
      WHEN price_id = 'compass_monthly' THEN 2
      ELSE 3
    END,
    created_at DESC
  LIMIT 1;

  IF _price = 'envoy_monthly' THEN
    _tier := 'envoy';
  ELSIF _price = 'compass_monthly' THEN
    _tier := 'compass';
  END IF;

  UPDATE public.profiles SET service_tier = _tier WHERE id = _user_id;
END;
$$;