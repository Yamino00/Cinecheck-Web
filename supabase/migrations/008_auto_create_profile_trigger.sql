-- Migration 008: Auto-create profile on user signup
-- 
-- This migration adds a trigger that automatically creates a profile
-- when a new user signs up via Supabase Auth.
-- 
-- This solves the 403 error when trying to create profiles from client-side code,
-- because the trigger runs with elevated privileges and bypasses RLS.

-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        reliability_score,
        total_reviews,
        verified_reviews,
        quiz_success_rate,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Trigger to call the function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile in public.profiles when a new user signs up via Supabase Auth. This function runs with SECURITY DEFINER to bypass RLS policies.';
