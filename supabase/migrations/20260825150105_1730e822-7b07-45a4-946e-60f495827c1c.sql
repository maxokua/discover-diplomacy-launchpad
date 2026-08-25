
-- 1. Extend role enum with 'member'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member';

-- Commit enum addition so it's usable below
COMMIT;
BEGIN;

-- 2. Auto-assign 'member' to every new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill 'member' for existing users with no role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'member'::public.app_role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Lock down RLS: only admins can read or change roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
-- "Admins can manage all roles" policy is already in place (FOR ALL using has_role admin)

-- 4. Admin-only listing function (returns all users + their highest role)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  role public.app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    COALESCE(
      (SELECT ur.role FROM public.user_roles ur
        WHERE ur.user_id = p.id
        ORDER BY CASE ur.role
          WHEN 'admin' THEN 1
          WHEN 'moderator' THEN 2
          WHEN 'coach' THEN 3
          WHEN 'employer' THEN 4
          WHEN 'member' THEN 5
          WHEN 'user' THEN 6
        END
        LIMIT 1),
      'member'::public.app_role
    ) AS role
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 5. Admin-only role setter: replaces caller-target user's role atomically
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _role NOT IN ('member','coach','employer','admin') THEN
    RAISE EXCEPTION 'Invalid role: %', _role;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;