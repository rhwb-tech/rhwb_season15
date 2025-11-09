-- Check all RLS policies on returning_users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'returning_users';

-- Check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'returning_users';

-- Check the actual policy definition in pg_policy
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polpermissive as permissive,
    pol.polroles::regrole[] as roles,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'returning_users' AND pn.nspname = 'public';

