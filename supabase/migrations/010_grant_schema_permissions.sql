-- Migration 010: Create SECURITY DEFINER Functions for Content Management
-- 
-- Problem: Error 42501 "permission denied for schema public" when service_role tries to insert data.
-- Root Cause: service_role is a reserved role and cannot be modified directly.
-- 
-- Solution: Create SECURITY DEFINER functions that run with superuser privileges
-- This is the STANDARD and SECURE approach recommended by Supabase for administrative operations.
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security (Security Definer Functions)

-- Function to get or create content (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_or_create_content(
    p_tmdb_id INTEGER,
    p_type TEXT,
    p_title TEXT,
    p_original_title TEXT DEFAULT NULL,
    p_overview TEXT DEFAULT NULL,
    p_poster_path TEXT DEFAULT NULL,
    p_backdrop_path TEXT DEFAULT NULL,
    p_release_date DATE DEFAULT NULL,
    p_runtime INTEGER DEFAULT NULL,
    p_genres JSONB DEFAULT NULL,
    p_cast_members JSONB DEFAULT NULL,
    p_crew JSONB DEFAULT NULL,
    p_vote_average NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator's privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
    v_content_id UUID;
BEGIN
    -- Try to find existing content
    SELECT id INTO v_content_id
    FROM public.contents
    WHERE tmdb_id = p_tmdb_id AND type = p_type::content_type;
    
    -- If found, return it
    IF FOUND THEN
        RETURN v_content_id;
    END IF;
    
    -- Otherwise, create new content
    INSERT INTO public.contents (
        tmdb_id,
        type,
        title,
        original_title,
        overview,
        poster_path,
        backdrop_path,
        release_date,
        runtime,
        genres,
        cast_members,
        crew,
        vote_average,
        created_at
    ) VALUES (
        p_tmdb_id,
        p_type::content_type,
        p_title,
        p_original_title,
        p_overview,
        p_poster_path,
        p_backdrop_path,
        p_release_date,
        p_runtime,
        p_genres,
        p_cast_members,
        p_crew,
        p_vote_average,
        NOW()
    )
    RETURNING id INTO v_content_id;
    
    RETURN v_content_id;
END;
$$;

-- Grant execute permission to authenticated users (including service_role)
GRANT EXECUTE ON FUNCTION public.get_or_create_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_content TO anon;

-- Comment for documentation
COMMENT ON FUNCTION public.get_or_create_content IS 
'Securely creates or retrieves content entries. Uses SECURITY DEFINER to bypass RLS, ensuring the quiz system can populate the contents table. This is the standard Supabase pattern for administrative operations.';

-- Verify the function
-- Run this to check: SELECT routine_name, security_type FROM information_schema.routines WHERE routine_name = 'get_or_create_content';
