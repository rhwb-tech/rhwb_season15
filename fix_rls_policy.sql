-- First, let's drop any existing INSERT policies to start fresh
DROP POLICY IF EXISTS "Allow inserts for all users" ON "public"."returning_users";

-- Re-enable RLS (in case it was disabled)
ALTER TABLE "public"."returning_users" ENABLE ROW LEVEL SECURITY;

-- Create a new INSERT policy that allows anonymous users to insert
-- This policy allows anyone (including unauthenticated users) to insert rows
CREATE POLICY "Allow inserts for all users"
ON "public"."returning_users"
FOR INSERT
TO public
WITH CHECK (true);

-- Verify the policy was created
SELECT 
    policyname,
    cmd as operation,
    roles,
    with_check
FROM pg_policies
WHERE tablename = 'returning_users' AND cmd = 'INSERT';

