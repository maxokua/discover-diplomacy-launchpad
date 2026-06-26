
CREATE OR REPLACE FUNCTION public.sync_user_service_tier(_user_id uuid, _env text DEFAULT 'live'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      WHEN price_id IN ('envoy_monthly', 'envoy_annual') THEN 1
      WHEN price_id IN ('compass_monthly', 'compass_monthly_20', 'compass_annual') THEN 2
      ELSE 3
    END,
    created_at DESC
  LIMIT 1;

  IF _price IN ('envoy_monthly', 'envoy_annual') THEN
    _tier := 'envoy';
  ELSIF _price IN ('compass_monthly', 'compass_monthly_20', 'compass_annual') THEN
    _tier := 'compass';
  END IF;

  UPDATE public.profiles SET service_tier = _tier WHERE id = _user_id;
END;
$function$;
