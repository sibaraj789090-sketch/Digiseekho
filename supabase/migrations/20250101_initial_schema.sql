-- ====================================================================
-- DigiSeekho Complete Supabase PostgreSQL Schema Migration
-- Execution Order: Extensions -> Tables -> Indexes -> RLS -> Policies -> Storage -> Seed
-- Fully Idempotent: Safe to run multiple times without data loss
-- ====================================================================

-- Step 1: Enable Necessary Crypto Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- Step 2: Core Entity Tables (Strict Dependency Order)
-- ====================================================================

-- 1. Profiles (Authors & Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Admin',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'author')),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT DEFAULT 'Folder',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Category Translations (Bilingual: English 'en' and Hindi 'hi')
CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category Translation Unique Constraints (Index-based for safe reruns)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_trans_lang_slug ON public.category_translations(language, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_trans_cat_lang ON public.category_translations(category_id, language);

-- Safe Foreign Key for category_translations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_category_translations_cat'
    ) THEN
        ALTER TABLE public.category_translations 
        ADD CONSTRAINT fk_category_translations_cat 
        FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Posts (Master Blog Post Table)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    featured_image TEXT NOT NULL DEFAULT '',
    image_alt TEXT NOT NULL DEFAULT '',
    category_id UUID,
    author_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled')),
    reading_time_minutes INT NOT NULL DEFAULT 5,
    views_count INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe Foreign Keys for posts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_category'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT fk_posts_category 
        FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_author'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT fk_posts_author 
        FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Post Translations (Bilingual Content: English 'en' and Hindi 'hi')
CREATE TABLE IF NOT EXISTS public.post_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    title TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    seo_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post Translation Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_trans_lang_slug ON public.post_translations(language, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_trans_post_lang ON public.post_translations(post_id, language);

-- Safe Foreign Key for post_translations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_translations_post'
    ) THEN
        ALTER TABLE public.post_translations 
        ADD CONSTRAINT fk_post_translations_post 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL UNIQUE,
    name_hi TEXT NOT NULL,
    slug_en TEXT NOT NULL UNIQUE,
    slug_hi TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY(post_id, tag_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_tags_post'
    ) THEN
        ALTER TABLE public.post_tags 
        ADD CONSTRAINT fk_post_tags_post 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_tags_tag'
    ) THEN
        ALTER TABLE public.post_tags 
        ADD CONSTRAINT fk_post_tags_tag 
        FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 8. Media Library
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

-- 9. Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Site Settings (Key-Value Store for Ad Placements, Social Links, Global Meta)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Page Visits (Live Traffic & Visitor Analytics)
CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT,
    session_id TEXT,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    referrer_type TEXT,
    device TEXT,
    browser TEXT,
    os TEXT,
    language TEXT,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Ad Events (Impressions, Clicks, and Network Performance)
CREATE TABLE IF NOT EXISTS public.ad_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    placement_id TEXT NOT NULL,
    network_id TEXT NOT NULL,
    device TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Step 3: Performance Indexes for SEO and Instant Query Speed
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON public.post_translations(slug);
CREATE INDEX IF NOT EXISTS idx_post_translations_lang ON public.post_translations(language);
CREATE INDEX IF NOT EXISTS idx_category_translations_slug ON public.category_translations(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON public.comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON public.page_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON public.ad_events(created_at DESC);

-- ====================================================================
-- Step 4: Row Level Security (RLS) Enablement
-- Applied only AFTER all tables exist
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
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Step 5: Clean Row Level Security Policies (Universal Safe Access)
-- ====================================================================

-- 1) Posts Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow select for all posts" ON public.posts;
    DROP POLICY IF EXISTS "Allow insert for all posts" ON public.posts;
    DROP POLICY IF EXISTS "Allow update for all posts" ON public.posts;
    DROP POLICY IF EXISTS "Allow delete for all posts" ON public.posts;
    DROP POLICY IF EXISTS "Public and Admin select posts" ON public.posts;
    DROP POLICY IF EXISTS "Public and Admin insert posts" ON public.posts;
    DROP POLICY IF EXISTS "Public and Admin update posts" ON public.posts;
    DROP POLICY IF EXISTS "Public and Admin delete posts" ON public.posts;
    DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
    DROP POLICY IF EXISTS "Admins have full access to posts" ON public.posts;

    CREATE POLICY "Allow select for all posts" ON public.posts FOR SELECT USING (true);
    CREATE POLICY "Allow insert for all posts" ON public.posts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update for all posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete for all posts" ON public.posts FOR DELETE USING (true);
END $$;

-- 2) Post Translations Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow select for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow insert for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow update for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow delete for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin select post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin insert post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin update post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin delete post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public can view published post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Admins have full access to post translations" ON public.post_translations;

    CREATE POLICY "Allow select for all post translations" ON public.post_translations FOR SELECT USING (true);
    CREATE POLICY "Allow insert for all post translations" ON public.post_translations FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update for all post translations" ON public.post_translations FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete for all post translations" ON public.post_translations FOR DELETE USING (true);
END $$;

-- 3) Categories Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for categories" ON public.categories;
    DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
    CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 4) Category Translations Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for category translations" ON public.category_translations;
    DROP POLICY IF EXISTS "Public can view category translations" ON public.category_translations;
    CREATE POLICY "Allow all for category translations" ON public.category_translations FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 5) Profiles Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
    CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 6) Site Settings Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for site settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
    CREATE POLICY "Allow all for site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 7) Page Visits & Ad Events (Analytics)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for page visits" ON public.page_visits;
    CREATE POLICY "Allow all for page visits" ON public.page_visits FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for ad events" ON public.ad_events;
    CREATE POLICY "Allow all for ad events" ON public.ad_events FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 8) Tags & Media
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for tags" ON public.tags;
    CREATE POLICY "Allow all for tags" ON public.tags FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for post_tags" ON public.post_tags;
    CREATE POLICY "Allow all for post_tags" ON public.post_tags FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for media" ON public.media;
    CREATE POLICY "Allow all for media" ON public.media FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 9) Comments & Newsletter
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for comments" ON public.comments;
    CREATE POLICY "Allow all for comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for newsletter" ON public.newsletter_subscribers;
    CREATE POLICY "Allow all for newsletter" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ====================================================================
-- Step 6: Supabase Storage Buckets for Media & Banners
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Access for Storage" ON storage.objects;
    DROP POLICY IF EXISTS "Public Insert Access for Storage" ON storage.objects;
    DROP POLICY IF EXISTS "Public Update Access for Storage" ON storage.objects;
    DROP POLICY IF EXISTS "Public Delete Access for Storage" ON storage.objects;

    CREATE POLICY "Public Read Access for Storage" 
    ON storage.objects FOR SELECT 
    USING (bucket_id IN ('article-images', 'banners'));

    CREATE POLICY "Public Insert Access for Storage" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id IN ('article-images', 'banners'));

    CREATE POLICY "Public Update Access for Storage" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id IN ('article-images', 'banners'));

    CREATE POLICY "Public Delete Access for Storage" 
    ON storage.objects FOR DELETE 
    USING (bucket_id IN ('article-images', 'banners'));
END $$;

-- ====================================================================
-- Step 7: Seed Initial Admin Profile & Categories (Safe Idempotent)
-- ====================================================================

-- 1. Default Admin Profile
INSERT INTO public.profiles (id, email, full_name, role, bio)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'rajsiba2005@gmail.com',
    'Siba Prasad',
    'admin',
    'Founder & Chief Editor at DigiSeekho. Passioned tech creator and educator.'
)
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- 2. Default Core Categories
INSERT INTO public.categories (id, icon, order_index)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Cpu', 1),
    ('22222222-2222-2222-2222-222222222222', 'Laptop', 2),
    ('33333333-3333-3333-3333-333333333333', 'Smartphone', 3),
    ('44444444-4444-4444-4444-444444444444', 'BookOpen', 4),
    ('55555555-5555-5555-5555-555555555555', 'TrendingUp', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Default Bilingual Category Translations
INSERT INTO public.category_translations (id, category_id, language, name, slug, description)
VALUES 
    ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'en', 'AI Tools', 'ai-tools', 'Explore state-of-the-art Artificial Intelligence and LLMs'),
    ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'hi', 'एआई टूल्स', 'ai-tools-hi', 'कृत्रिम बुद्धिमत्ता और आधुनिक एआई टूल्स की पूरी जानकारी'),
    ('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'en', 'Technology', 'technology', 'Latest tech trends, software innovations, and gadgets'),
    ('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'hi', 'तकनीक', 'technology-hi', 'नवीनतम तकनीकी रुझान, सॉफ्टवेयर और डिजिटल जानकारी'),
    ('33333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'en', 'Mobile Apps', 'mobile-apps', 'Top mobile applications for Android and iOS'),
    ('33333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'hi', 'मोबाइल ऐप्स', 'mobile-apps-hi', 'एंड्रॉइड और आईओएस के लिए सर्वश्रेष्ठ मोबाइल ऐप्स'),
    ('44444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'en', 'How-To Guides', 'how-to-guides', 'Step-by-step tutorials and tech how-to guides'),
    ('44444444-4444-4444-4444-444444444446', '44444444-4444-4444-4444-444444444444', 'hi', 'गाइड्स व ट्यूटोरियल', 'how-to-guides-hi', 'कदम-दर-कदम तकनीकी मार्गदर्शिकाएं और ट्यूटोरियल'),
    ('55555555-5555-5555-5555-555555555556', '55555555-5555-5555-5555-555555555555', 'en', 'Blogging & SEO', 'blogging-seo', 'Master modern SEO, organic growth, and content marketing'),
    ('55555555-5555-5555-5555-555555555557', '55555555-5555-5555-5555-555555555555', 'hi', 'ब्लॉगिंग व एसईओ', 'blogging-seo-hi', 'आधुनिक एसईओ और ब्लॉगिंग से ट्रैफिक बढ़ाने के तरीके')
ON CONFLICT DO NOTHING;

-- 4. Seed Initial Posts Only If Table Is Currently Empty (Preserves all existing user articles)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.posts LIMIT 1) THEN
        -- Post 1: Top 10 AI Tools
        INSERT INTO public.posts (
            id, 
            featured_image, 
            image_alt, 
            category_id, 
            author_id, 
            status, 
            reading_time_minutes, 
            views_count, 
            is_featured, 
            is_trending, 
            published_at
        ) VALUES (
            'a0000000-0000-0000-0000-000000000001',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            'Top 10 AI Tools That Will Transform Your Workflow in 2025',
            '11111111-1111-1111-1111-111111111111',
            '00000000-0000-0000-0000-000000000001',
            'published',
            6,
            1420,
            true,
            true,
            NOW() - INTERVAL '2 days'
        );

        INSERT INTO public.post_translations (
            id, 
            post_id, 
            language, 
            title, 
            slug, 
            excerpt, 
            content, 
            seo_title, 
            meta_description, 
            focus_keyword
        ) VALUES 
        (
            'b0000000-0000-0000-0000-000000000001',
            'a0000000-0000-0000-0000-000000000001',
            'en',
            'Top 10 AI Tools That Will Transform Your Workflow in 2025',
            'top-10-ai-tools-transform-workflow-2025',
            'Discover cutting-edge generative AI tools revolutionizing productivity, content automation, and engineering workflows in 2025.',
            '<h2>Introduction to the 2025 AI Revolution</h2><p>Artificial Intelligence has moved past simple chat prompts. In 2025, autonomous multi-agent pipelines and real-time multimodal interfaces are powering modern businesses.</p><h3>Key Breakthroughs</h3><ul><li>Autonomous coding agents with real-time test execution</li><li>Multimodal audio and video synthesis</li><li>Hyper-personalized semantic search algorithms</li></ul>',
            'Top 10 AI Tools Transforming Workflows (2025 Guide) - DigiSeekho',
            'Discover cutting-edge generative AI tools revolutionizing productivity, automation, and engineering workflows in 2025.',
            'best AI tools 2025'
        ),
        (
            'b0000000-0000-0000-0000-000000000002',
            'a0000000-0000-0000-0000-000000000001',
            'hi',
            '2025 में आपके काम को आसान बनाने वाले टॉप 10 AI टूल्स',
            'top-10-ai-tools-transform-workflow-2025-hi',
            '2025 में उत्पादकता, कंटेंट क्रिएशन और कोडिंग को पूरी तरह बदलने वाले सर्वश्रेष्ठ एआई टूल्स की पूरी जानकारी हिंदी में।',
            '<h2>2025 में एआई क्रांति का परिचय</h2><p>आर्टिफिशियल इंटेलिजेंस अब केवल चैट प्रॉम्प्ट तक सीमित नहीं है। 2025 में मल्टी-एजेंट सिस्टम और रियल-टाइम मल्टीमॉडल टूल्स डिजिटल वर्कफ्लो को तेजी से बदल रहे हैं।</p><h3>मुख्य विशेषताएं</h3><ul><li>ऑटोनॉमस कोडिंग एजेंट्स</li><li>मल्टीमॉडल ऑडियो व वीडियो जेनरेशन</li><li>सर्च और ऑटोमेशन टूल्स</li></ul>',
            '2025 के टॉप 10 एआई टूल्स - DigiSeekho हिंदी गाइड',
            '2025 में उत्पादकता और ऑटोमेशन बढ़ाने वाले सबसे बेहतरीन आर्टिफिशियल इंटेलिजेंस टूल्स की संपूर्ण मार्गदर्शिका।',
            'टॉप एआई टूल्स 2025'
        );

        -- Post 2: Complete SEO Strategy Guide
        INSERT INTO public.posts (
            id, 
            featured_image, 
            image_alt, 
            category_id, 
            author_id, 
            status, 
            reading_time_minutes, 
            views_count, 
            is_featured, 
            is_trending, 
            published_at
        ) VALUES (
            'a0000000-0000-0000-0000-000000000002',
            'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80',
            'The Complete SEO Strategy Guide for Modern Blogs in 2025',
            '55555555-5555-5555-5555-555555555555',
            '00000000-0000-0000-0000-000000000001',
            'published',
            8,
            2890,
            true,
            false,
            NOW() - INTERVAL '5 days'
        );

        INSERT INTO public.post_translations (
            id, 
            post_id, 
            language, 
            title, 
            slug, 
            excerpt, 
            content, 
            seo_title, 
            meta_description, 
            focus_keyword
        ) VALUES 
        (
            'b0000000-0000-0000-0000-000000000003',
            'a0000000-0000-0000-0000-000000000002',
            'en',
            'The Complete SEO Strategy Guide for Modern Blogs in 2025',
            'complete-seo-strategy-guide-modern-blogs-2025',
            'Master semantic search, EEAT signals, core web vitals, and topical authority to dominate Google organic rankings in 2025.',
            '<h2>The New Era of Organic Search</h2><p>Search algorithms today reward depth, original experience, and technical agility. Here is your actionable roadmap to build enduring topical authority.</p>',
            'Complete SEO Strategy Guide 2025 - DigiSeekho',
            'Master semantic search, EEAT signals, core web vitals, and topical authority to dominate Google organic rankings in 2025.',
            'blogging SEO guide 2025'
        ),
        (
            'b0000000-0000-0000-0000-000000000004',
            'a0000000-0000-0000-0000-000000000002',
            'hi',
            '2025 में ब्लॉगिंग के लिए संपूर्ण SEO स्ट्रेटेजी गाइड',
            'complete-seo-strategy-guide-modern-blogs-2025-hi',
            'गूगल सर्च रैंकिंग में टॉप पर आने के लिए सिमेंटिक एसईओ, EEAT सिग्नल्स और कोर वेब वाइटल्स की संपूर्ण हिंदी गाइड।',
            '<h2>ऑर्गेनिक सर्च का नया दौर</h2><p>सर्च इंजन अब केवल कीवर्ड्स नहीं बल्कि यूजर इंटेंट और ओरिजिनल अनुभव को प्राथमिकता देते हैं।</p>',
            'ब्लॉगिंग के लिए संपूर्ण SEO गाइड 2025 - DigiSeekho',
            'गूगल सर्च रैंकिंग में टॉप पर आने के लिए सिमेंटिक एसईओ, EEAT सिग्नल्स और कोर वेब वाइटल्स की संपूर्ण हिंदी गाइड।',
            'ब्लॉग एसईओ गाइड हिंदी'
        );
    END IF;
END $$;
