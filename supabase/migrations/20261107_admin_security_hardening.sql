-- ====================================================================
-- DigiSeekho Blogging Platform - Server-Side Admin Security Hardening
-- Migration: 20261107_admin_security_hardening.sql
-- Enforces strict server-side authorization for: rajsiba2005@gmail.com
-- ====================================================================

-- 1. Helper function: Checks if the currently authenticated user is the authorized admin
CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_email TEXT;
BEGIN
    -- Extract email from JWT payload
    current_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));

    -- Check against authorized admin email
    IF current_email = 'rajsiba2005@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- Also verify against public.profiles table
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND LOWER(email) = 'rajsiba2005@gmail.com'
        AND role = 'admin'
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Guard Trigger: Prevent public admin signup and prohibit any other account from acquiring admin role
CREATE OR REPLACE FUNCTION public.guard_admin_role_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role = 'admin') AND (LOWER(NEW.email) <> 'rajsiba2005@gmail.com') THEN
        RAISE EXCEPTION 'Access Denied: Only rajsiba2005@gmail.com is authorized to hold the admin role.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_guard_admin_role ON public.profiles;
CREATE TRIGGER trigger_guard_admin_role
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_admin_role_creation();

-- 3. Update Profiles Table: Ensure authorized admin profile exists
INSERT INTO public.profiles (
    id, email, full_name, role, bio
)
SELECT
    COALESCE(auth.uid(), gen_random_uuid()),
    'rajsiba2005@gmail.com',
    'Raj Siba',
    'admin',
    'DigiSeekho Super Administrator & Editorial Lead'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(email) = 'rajsiba2005@gmail.com'
);

-- ====================================================================
-- 4. Hardened Row Level Security (RLS) Policies on Core Tables
-- ====================================================================

-- Posts Table
DROP POLICY IF EXISTS "Admins have full access to posts" ON public.posts;
CREATE POLICY "Authorized Admin full access to posts" ON public.posts
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Post Translations Table
DROP POLICY IF EXISTS "Admins have full access to post translations" ON public.post_translations;
CREATE POLICY "Authorized Admin full access to post translations" ON public.post_translations
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Categories Table
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
CREATE POLICY "Authorized Admin full access to categories" ON public.categories
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Category Translations Table
DROP POLICY IF EXISTS "Admins have full access to category translations" ON public.category_translations;
CREATE POLICY "Authorized Admin full access to category translations" ON public.category_translations
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Media Table
DROP POLICY IF EXISTS "Admins have full access to media" ON public.media;
CREATE POLICY "Authorized Admin full access to media" ON public.media
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Site Settings Table
DROP POLICY IF EXISTS "Admins have full access to site settings" ON public.site_settings;
CREATE POLICY "Authorized Admin full access to site settings" ON public.site_settings
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Navigation Items Table
DROP POLICY IF EXISTS "Admins have full access to navigation items" ON public.navigation_items;
CREATE POLICY "Authorized Admin full access to navigation items" ON public.navigation_items
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Newsletter Subscribers Table (Admin View / Delete)
DROP POLICY IF EXISTS "Admins have full access to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Authorized Admin view newsletter subscribers" ON public.newsletter_subscribers
    FOR SELECT TO authenticated
    USING (public.is_authorized_admin());

CREATE POLICY "Authorized Admin manage newsletter subscribers" ON public.newsletter_subscribers
    FOR DELETE TO authenticated
    USING (public.is_authorized_admin());

-- Comments Moderation
DROP POLICY IF EXISTS "Admins have full access to comments" ON public.comments;
CREATE POLICY "Authorized Admin moderate comments" ON public.comments
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Profiles Table
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Authorized Admin full access to profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- ====================================================================
-- 5. Hardened Row Level Security (RLS) on Advertising System Tables
-- ====================================================================

-- Ad Networks
DROP POLICY IF EXISTS "Admins have full access to ad_networks" ON public.ad_networks;
CREATE POLICY "Authorized Admin full access to ad_networks" ON public.ad_networks
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Ad Placements
DROP POLICY IF EXISTS "Admins have full access to ad_placements" ON public.ad_placements;
CREATE POLICY "Authorized Admin full access to ad_placements" ON public.ad_placements
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Ad Units
DROP POLICY IF EXISTS "Admins have full access to ad_units" ON public.ad_units;
CREATE POLICY "Authorized Admin full access to ad_units" ON public.ad_units
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());

-- Ad Settings
DROP POLICY IF EXISTS "Admins have full access to ad_settings" ON public.ad_settings;
CREATE POLICY "Authorized Admin full access to ad_settings" ON public.ad_settings
    FOR ALL TO authenticated
    USING (public.is_authorized_admin())
    WITH CHECK (public.is_authorized_admin());
