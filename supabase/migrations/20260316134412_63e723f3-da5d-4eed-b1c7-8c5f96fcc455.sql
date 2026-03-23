
-- Create a security definer function to check user role without recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Drop the recursive RLS policies on profiles
DROP POLICY IF EXISTS "Recruiters can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Placement cells can view all profiles" ON public.profiles;

-- Recreate them using the security definer function
CREATE POLICY "Recruiters can view student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'recruiter');

CREATE POLICY "Placement cells can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'placement');
