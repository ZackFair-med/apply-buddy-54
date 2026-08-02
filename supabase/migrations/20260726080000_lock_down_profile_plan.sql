-- `plan` is billing state, not user-editable profile data. The "own profile
-- update" RLS policy is row-scoped only, so any signed-in user could flip their
-- own row to plan='paid' straight through PostgREST and unlock paid limits.

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;

GRANT INSERT (
  id,
  email,
  display_name,
  first_name,
  last_name,
  target_title,
  target_date,
  target_salary_min,
  target_salary_max,
  target_salary_currency,
  weekly_goal
) ON public.profiles TO authenticated;

GRANT UPDATE (
  email,
  display_name,
  first_name,
  last_name,
  target_title,
  target_date,
  target_salary_min,
  target_salary_max,
  target_salary_currency,
  weekly_goal
) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_profile_plan_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan AND current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'plan can only be changed by a privileged role';
  END IF;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.enforce_profile_plan_immutable() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_plan_immutable ON public.profiles;
CREATE TRIGGER profiles_plan_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_plan_immutable();
