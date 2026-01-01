-- Final comprehensive fix for tenant_requests RLS
-- This addresses the persistent 401 error by ensuring all permissions are granted

-- Step 1: Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tenant_requests' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.tenant_requests';
    END LOOP;
END $$;

-- Step 2: Grant table-level permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.tenant_requests TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 3: Create the most permissive INSERT policies possible
CREATE POLICY "enable_insert_for_anon"
  ON public.tenant_requests
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "enable_insert_for_authenticated"  
  ON public.tenant_requests
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 4: Verify RLS is enabled (should already be, but double-check)
ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Output current INSERT policies for verification
DO $$
BEGIN
    RAISE NOTICE 'Current INSERT policies on tenant_requests:';
END $$;

SELECT policyname, roles, cmd, permissive
FROM pg_policies 
WHERE tablename = 'tenant_requests' AND cmd = 'INSERT';
