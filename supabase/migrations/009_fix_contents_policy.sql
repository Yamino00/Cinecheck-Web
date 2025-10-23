-- Migration 009: Fix Contents Table RLS Policy
-- 
-- Problem: The quiz system cannot create contents because the policy requires admin role.
-- Solution: Allow authenticated users to insert contents (needed for quiz generation).
-- 
-- The quiz system needs to automatically create content entries when generating quizzes
-- for movies/series that don't exist yet in the database.

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Only admins can insert contents" ON contents;

-- Create new policy: Authenticated users can insert contents
CREATE POLICY "Authenticated users can insert contents" ON contents
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Comment for documentation
COMMENT ON POLICY "Authenticated users can insert contents" ON contents IS 
'Allows any authenticated user to create content entries. This is necessary for the quiz system to automatically populate the contents table when generating quizzes for new movies/series.';

-- Keep the existing update policy for admins only
-- (already exists from migration 002, no changes needed)
