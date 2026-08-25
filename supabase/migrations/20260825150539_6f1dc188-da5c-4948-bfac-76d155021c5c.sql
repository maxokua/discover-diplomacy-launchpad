
CREATE TABLE public.employer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  organization_website TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  hq_country TEXT NOT NULL,
  contact_full_name TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_work_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_linkedin TEXT NOT NULL,
  hiring_roles TEXT NOT NULL,
  target_hires INTEGER,
  hiring_timeline TEXT,
  why_us TEXT NOT NULL,
  references_text TEXT,
  acknowledged_terms BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employer_applications_org_name_len CHECK (char_length(organization_name) BETWEEN 2 AND 200),
  CONSTRAINT employer_applications_website_len CHECK (char_length(organization_website) BETWEEN 4 AND 300),
  CONSTRAINT employer_applications_email_format CHECK (contact_work_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT employer_applications_email_len CHECK (char_length(contact_work_email) BETWEEN 5 AND 254),
  CONSTRAINT employer_applications_linkedin_len CHECK (char_length(contact_linkedin) BETWEEN 10 AND 300),
  CONSTRAINT employer_applications_roles_len CHECK (char_length(hiring_roles) BETWEEN 10 AND 5000),
  CONSTRAINT employer_applications_why_len CHECK (char_length(why_us) BETWEEN 10 AND 5000),
  CONSTRAINT employer_applications_refs_len CHECK (references_text IS NULL OR char_length(references_text) <= 3000),
  CONSTRAINT employer_applications_notes_len CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 5000),
  CONSTRAINT employer_applications_status_check CHECK (status IN ('submitted','under_review','approved','rejected'))
);

GRANT INSERT ON public.employer_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON public.employer_applications TO authenticated;
GRANT ALL ON public.employer_applications TO service_role;

ALTER TABLE public.employer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_submit_employer_application"
  ON public.employer_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'submitted'
    AND acknowledged_terms = true
  );

CREATE POLICY "admins_can_read_employer_applications"
  ON public.employer_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_can_update_employer_applications"
  ON public.employer_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER employer_applications_set_updated_at
  BEFORE UPDATE ON public.employer_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update tier mapping to recognize the new $20 Compass price alongside the legacy one
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
      WHEN price_id = 'envoy_monthly' THEN 1
      WHEN price_id IN ('compass_monthly', 'compass_monthly_20') THEN 2
      ELSE 3
    END,
    created_at DESC
  LIMIT 1;

  IF _price = 'envoy_monthly' THEN
    _tier := 'envoy';
  ELSIF _price IN ('compass_monthly', 'compass_monthly_20') THEN
    _tier := 'compass';
  END IF;

  UPDATE public.profiles SET service_tier = _tier WHERE id = _user_id;
END;
$function$;