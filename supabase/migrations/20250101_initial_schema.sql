-- ====================================================================
-- DigiSeekho Blogging Platform - Complete Supabase PostgreSQL Schema
-- Includes RLS Policies, Indexes, and Initial Data
-- ====================================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'author')),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT DEFAULT 'Folder',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Category Translations Table (Bilingual: 'en' and 'hi')
CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(language, slug),
    UNIQUE(category_id, language)
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    featured_image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    reading_time_minutes INT NOT NULL DEFAULT 5,
    views_count INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Post Translations Table (Bilingual: 'en' and 'hi')
CREATE TABLE IF NOT EXISTS public.post_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(language, slug),
    UNIQUE(post_id, language)
);

-- 6. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL UNIQUE,
    name_hi TEXT NOT NULL,
    slug_en TEXT NOT NULL UNIQUE,
    slug_hi TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Post Tags Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, tag_id)
);

-- 8. Media Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT,
    mime_type TEXT,
    alt_text TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Navigation Items Table
CREATE TABLE IF NOT EXISTS public.navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(20) NOT NULL CHECK (location IN ('header', 'footer')),
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    url_en TEXT NOT NULL,
    url_hi TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ====================================================================
-- Performance Indexes for High-Traffic SEO Operations
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON public.post_translations(slug);
CREATE INDEX IF NOT EXISTS idx_post_translations_lang ON public.post_translations(language);
CREATE INDEX IF NOT EXISTS idx_category_translations_slug ON public.category_translations(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON public.comments(post_id, status);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- 1) Public Read Policies for Published Articles & Public Assets
CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Public can view published post translations" ON public.post_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_translations.post_id
            AND posts.status = 'published'
            AND posts.published_at <= NOW()
        )
    );

CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view category translations" ON public.category_translations
    FOR SELECT USING (true);

CREATE POLICY "Public can view tags" ON public.tags
    FOR SELECT USING (true);

CREATE POLICY "Public can view post_tags" ON public.post_tags
    FOR SELECT USING (true);

CREATE POLICY "Public can view media" ON public.media
    FOR SELECT USING (true);

CREATE POLICY "Public can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can submit comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Public can view navigation items" ON public.navigation_items
    FOR SELECT USING (is_active = true);

-- 2) Authenticated Admins / Editors Full Access Policies
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to category translations" ON public.category_translations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to posts" ON public.posts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to post translations" ON public.post_translations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to tags" ON public.tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to post_tags" ON public.post_tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to media" ON public.media
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to comments" ON public.comments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to newsletter" ON public.newsletter_subscribers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to site settings" ON public.site_settings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to navigation items" ON public.navigation_items
    FOR ALL USING (auth.role() = 'authenticated');

-- ====================================================================
-- 3) Storage Buckets & Policies for Permanent Media Assets
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Public Read Access for Article Images" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('article-images', 'banners'));

CREATE POLICY "Admin Insert Access for Article Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id IN ('article-images', 'banners'));

CREATE POLICY "Admin Update Access for Article Images" 
ON storage.objects FOR UPDATE 
USING (bucket_id IN ('article-images', 'banners'));

CREATE POLICY "Admin Delete Access for Article Images" 
ON storage.objects FOR DELETE 
USING (bucket_id IN ('article-images', 'banners'));
