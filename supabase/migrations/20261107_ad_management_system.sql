-- ====================================================================
-- DigiSeekho Blogging Platform - Advertising Management System Migration
-- Tables: ad_networks, ad_units, ad_placements, ad_events, ad_settings
-- Features: Foreign Keys, Indexes, Row Level Security (RLS), and Seed Data
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ad Networks Table (Google AdSense, Adsterra, Infolinks, HilltopAds, Monetag, Custom)
CREATE TABLE IF NOT EXISTS public.ad_networks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    publisher_id TEXT,
    header_code TEXT,
    default_ad_code TEXT,
    website_url TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ad Units Table (Reusable Snippets & Formats)
CREATE TABLE IF NOT EXISTS public.ad_units (
    id TEXT PRIMARY KEY DEFAULT ('unit-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    network_id TEXT NOT NULL REFERENCES public.ad_networks(id) ON DELETE CASCADE,
    format TEXT NOT NULL DEFAULT 'responsive' CHECK (
        format IN (
            'leaderboard',
            'banner',
            'rectangle',
            'large_rectangle',
            'half_page',
            'in_article',
            'native',
            'responsive'
        )
    ),
    code TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ad Placements Table (Homepage, Article, Sidebar, Mobile, Desktop)
CREATE TABLE IF NOT EXISTS public.ad_placements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_name TEXT NOT NULL CHECK (
        group_name IN ('homepage', 'article', 'sidebar', 'general', 'custom')
    ),
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    network_id TEXT REFERENCES public.ad_networks(id) ON DELETE SET NULL,
    ad_unit_id TEXT REFERENCES public.ad_units(id) ON DELETE SET NULL,
    ad_type TEXT NOT NULL DEFAULT 'custom_banner' CHECK (
        ad_type IN ('custom_banner', 'network_unit', 'raw_code', 'adsense_auto')
    ),
    code TEXT,
    desktop_image_url TEXT,
    mobile_image_url TEXT,
    link_url TEXT,
    alt_text TEXT,
    open_in_new_tab BOOLEAN NOT NULL DEFAULT true,
    device_visibility TEXT NOT NULL DEFAULT 'all' CHECK (
        device_visibility IN ('all', 'desktop_only', 'mobile_only')
    ),
    display_order INT NOT NULL DEFAULT 0,
    dimensions_label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ad Analytics Events Table (Impressions & Verified Clicks)
CREATE TABLE IF NOT EXISTS public.ad_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id TEXT NOT NULL REFERENCES public.ad_placements(id) ON DELETE CASCADE,
    network_id TEXT REFERENCES public.ad_networks(id) ON DELETE SET NULL,
    ad_unit_id TEXT REFERENCES public.ad_units(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
    device TEXT NOT NULL CHECK (device IN ('desktop', 'mobile', 'tablet')),
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Ad System Global Settings Table
CREATE TABLE IF NOT EXISTS public.ad_settings (
    key TEXT PRIMARY KEY DEFAULT 'global_config',
    global_enabled BOOLEAN NOT NULL DEFAULT true,
    enable_desktop BOOLEAN NOT NULL DEFAULT true,
    enable_mobile BOOLEAN NOT NULL DEFAULT true,
    adsense_publisher_id TEXT,
    auto_ads_enabled BOOLEAN NOT NULL DEFAULT false,
    ad_label_en TEXT NOT NULL DEFAULT 'Advertisement',
    ad_label_hi TEXT NOT NULL DEFAULT 'विज्ञापन',
    network_toggles JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_ad_networks_enabled ON public.ad_networks(enabled);
CREATE INDEX IF NOT EXISTS idx_ad_networks_slug ON public.ad_networks(slug);
CREATE INDEX IF NOT EXISTS idx_ad_units_network_id ON public.ad_units(network_id);
CREATE INDEX IF NOT EXISTS idx_ad_units_format ON public.ad_units(format);
CREATE INDEX IF NOT EXISTS idx_ad_placements_network_id ON public.ad_placements(network_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_ad_unit_id ON public.ad_placements(ad_unit_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_group ON public.ad_placements(group_name, display_order);
CREATE INDEX IF NOT EXISTS idx_ad_placements_enabled ON public.ad_placements(enabled, device_visibility);
CREATE INDEX IF NOT EXISTS idx_ad_events_placement ON public.ad_events(placement_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_network ON public.ad_events(network_id, event_type);
CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON public.ad_events(created_at DESC);

-- ====================================================================
-- Automated Timestamp Update Trigger
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ad_networks_updated_at ON public.ad_networks;
CREATE TRIGGER trigger_ad_networks_updated_at
    BEFORE UPDATE ON public.ad_networks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ad_units_updated_at ON public.ad_units;
CREATE TRIGGER trigger_ad_units_updated_at
    BEFORE UPDATE ON public.ad_units
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ad_placements_updated_at ON public.ad_placements;
CREATE TRIGGER trigger_ad_placements_updated_at
    BEFORE UPDATE ON public.ad_placements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ad_settings_updated_at ON public.ad_settings;
CREATE TRIGGER trigger_ad_settings_updated_at
    BEFORE UPDATE ON public.ad_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.ad_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- 1) Public Read Access for Serving Public Advertisements
CREATE POLICY "Public can view active ad networks" ON public.ad_networks
    FOR SELECT USING (true);

CREATE POLICY "Public can view active ad units" ON public.ad_units
    FOR SELECT USING (true);

CREATE POLICY "Public can view active ad placements" ON public.ad_placements
    FOR SELECT USING (true);

CREATE POLICY "Public can view ad settings" ON public.ad_settings
    FOR SELECT USING (true);

-- 2) Public Telemetry Write Access for Recording Impressions and Clicks
CREATE POLICY "Public can record ad impression and click events" ON public.ad_events
    FOR INSERT WITH CHECK (true);

-- 3) Authenticated Super Admins & Editors Full Access (CRUD)
CREATE POLICY "Admins have full access to ad_networks" ON public.ad_networks
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to ad_units" ON public.ad_units
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to ad_placements" ON public.ad_placements
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to ad_events" ON public.ad_events
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to ad_settings" ON public.ad_settings
    FOR ALL TO authenticated USING (true);

-- ====================================================================
-- Initial Seed Data: Supported Ad Networks
-- ====================================================================
INSERT INTO public.ad_networks (id, name, slug, publisher_id, header_code, default_ad_code, website_url, enabled, is_custom)
VALUES
    (
        'adsense',
        'Google AdSense',
        'google-adsense',
        'ca-pub-9842104820194820',
        '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842104820194820" crossorigin="anonymous"></script>',
        '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9842104820194820" data-ad-slot="1029384756" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
        'https://adsense.google.com',
        true,
        false
    ),
    (
        'adsterra',
        'Adsterra',
        'adsterra',
        'adt-849201',
        '<!-- Adsterra Header Tag -->',
        '<div id="adsterra-banner" class="adsterra-placement" data-zone="849201"></div>',
        'https://adsterra.com',
        true,
        false
    ),
    (
        'infolinks',
        'Infolinks',
        'infolinks',
        'infolinks-39201',
        '<script type="text/javascript"> var infolinks_pid = 39201; var infolinks_wsid = 0; </script>',
        '<div id="infolinks-inarticle" class="infolinks-ad-unit"></div>',
        'https://infolinks.com',
        false,
        false
    ),
    (
        'hilltopads',
        'HilltopAds',
        'hilltopads',
        'hta-77291',
        '<!-- HilltopAds Header Tag -->',
        '<div id="hta-display-banner" data-hta-id="77291"></div>',
        'https://hilltopads.com',
        false,
        false
    ),
    (
        'monetag',
        'Monetag',
        'monetag',
        'monetag-11928',
        '<!-- Monetag Header Tag -->',
        '<div id="monetag-inpage-unit" data-zone="11928"></div>',
        'https://monetag.com',
        false,
        false
    ),
    (
        'custom',
        'Custom Direct Advertisers & Affiliates',
        'custom-advertisers',
        'digiseekho-direct',
        '',
        '',
        'https://digiseekho.com',
        true,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    publisher_id = EXCLUDED.publisher_id,
    header_code = EXCLUDED.header_code,
    default_ad_code = EXCLUDED.default_ad_code,
    website_url = EXCLUDED.website_url,
    enabled = EXCLUDED.enabled;

-- ====================================================================
-- Initial Seed Data: Reusable Ad Units
-- ====================================================================
INSERT INTO public.ad_units (id, name, network_id, format, code, notes)
VALUES
    (
        'unit-adsense-leaderboard',
        'AdSense Responsive Leaderboard (728x90)',
        'adsense',
        'leaderboard',
        '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9842104820194820" data-ad-slot="1029384756" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
        'Default responsive leaderboard for header and in-feed positions'
    ),
    (
        'unit-adsense-rectangle',
        'AdSense Medium Rectangle (300x250)',
        'adsense',
        'rectangle',
        '<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-9842104820194820" data-ad-slot="2938475610"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
        'Sticky sidebar and desktop right column unit'
    ),
    (
        'unit-adsense-inarticle',
        'AdSense Fluid In-Article Native Unit',
        'adsense',
        'in_article',
        '<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-9842104820194820" data-ad-slot="3847561029"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
        'Automatically matches typography and styling of DigiSeekho articles'
    ),
    (
        'unit-adsterra-banner',
        'Adsterra 728x90 Display Banner',
        'adsterra',
        'leaderboard',
        '<div class="adsterra-unit" style="min-height:90px;display:flex;align-items:center;justify-content:center"><span style="font-size:11px;color:#888;">[Adsterra Network 728x90 Unit]</span></div>',
        'Secondary monetization network'
    )
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- Initial Seed Data: All Placements
-- ====================================================================
INSERT INTO public.ad_placements (
    id, name, group_name, description, enabled, network_id, ad_unit_id, ad_type,
    desktop_image_url, link_url, alt_text, open_in_new_tab, device_visibility, display_order, dimensions_label
)
VALUES
    (
        'home_header_below',
        'Homepage: Below Header',
        'homepage',
        'Prominent 728x90 Leaderboard directly below the top website header and navigation.',
        false,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=180&q=80',
        '/category/ai-tools',
        'DigiSeekho AI & Cloud Learning Hub',
        false,
        'desktop_only',
        1,
        '728x90 Leaderboard'
    ),
    (
        'home_banner_below',
        'Homepage: Below Banner',
        'homepage',
        'Appears directly beneath the DigiSeekho Hero Banner, above category shortcuts.',
        false,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=180&q=80',
        '/category/technology',
        'Software Dev Architecture & AI Masterclass',
        false,
        'all',
        2,
        '728x90 / 970x120 Banner'
    ),
    (
        'home_category_nav_below',
        'Homepage: Below Category Navigation',
        'homepage',
        'Directly below the 5 Category Navigation Shortcuts, above Featured Editorial.',
        false,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=200&q=80',
        '/category/blogging-seo',
        'Google SEO Strategies & Web Monetization',
        false,
        'all',
        3,
        '728x90 / Responsive'
    ),
    (
        'home_featured_between',
        'Homepage: Between Featured Editorial and Articles',
        'homepage',
        'Separates the hero featured editorial post from the Trending Guides section.',
        true,
        'custom',
        NULL,
        'custom_banner',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=220&q=80',
        '/category/ai-tools',
        'Discover Next-Gen Prompt Engineering Workflows',
        false,
        'all',
        4,
        '970x120 or 728x90 Responsive In-Feed'
    ),
    (
        'home_cards_between',
        'Homepage: Between Article Cards',
        'homepage',
        'Native responsive ad placed within the Latest Articles card grid.',
        true,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&h=200&q=80',
        '/category/digital-skills',
        'Learn High-Income Tech Skills in 2026',
        false,
        'all',
        5,
        '728x90 / Native Feed Card'
    ),
    (
        'home_newsletter_above',
        'Homepage: Above Newsletter Section',
        'homepage',
        'High CTR wide billboard directly preceding the newsletter / subscribe card.',
        true,
        'custom',
        NULL,
        'custom_banner',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=260&q=80',
        'https://digiseekho.com',
        'DigiSeekho Pro Technology Masterclass - Enroll Free',
        true,
        'all',
        6,
        '970x250 Billboard / Responsive'
    ),
    (
        'home_footer',
        'Homepage: Footer Advertisement',
        'homepage',
        'Final banner position directly before the footer copyright strip.',
        false,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&h=180&q=80',
        'https://digiseekho.com',
        'DigiSeekho Global Technology News',
        true,
        'desktop_only',
        7,
        '728x90 Footer Leaderboard'
    ),
    (
        'article_title_below',
        'Article: Below Article Title',
        'article',
        'Header ad right after the headline and metadata deck.',
        true,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&h=180&q=80',
        '/category/technology',
        'Enterprise Cloud & AI Architecture Tools',
        false,
        'all',
        8,
        '728x90 / Responsive Top Banner'
    ),
    (
        'article_image_below',
        'Article: Below Featured Image',
        'article',
        'Placed immediately below the post cover hero graphic.',
        false,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&h=180&q=80',
        '/category/ai-tools',
        'Curated Artificial Intelligence Tool Directory',
        false,
        'all',
        9,
        '728x90 Banner'
    ),
    (
        'article_para_1',
        'Article: After First Paragraph',
        'article',
        'Early in-reading hook. Captures initial visitor attention as they begin reading.',
        true,
        'adsense',
        'unit-adsense-inarticle',
        'custom_banner',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=260&q=80',
        '/category/blogging-seo',
        'Google Organic Ranking & SEO Guide',
        false,
        'all',
        10,
        '336x280 Large Rectangle / In-Article'
    ),
    (
        'article_para_3',
        'Article: After Third Paragraph',
        'article',
        'Inserted after the 3rd paragraph. Ideal spot for AdSense in-article responsive units.',
        false,
        'adsense',
        'unit-adsense-inarticle',
        'custom_banner',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=260&q=80',
        '/category/technology',
        'Tech Tools & Frameworks',
        false,
        'all',
        11,
        'In-Article Fluid / 300x250'
    ),
    (
        'article_mid_content',
        'Article: In the Middle of Content',
        'article',
        'Automatically placed at the halfway mark of the article text for highest time-on-page CTR.',
        true,
        'custom',
        NULL,
        'custom_banner',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=280&q=80',
        '/category/digital-skills',
        'Upgrade Digital & Coding Skills',
        false,
        'all',
        12,
        '336x280 / Responsive Content Ad'
    ),
    (
        'article_before_conclusion',
        'Article: Before Conclusion',
        'article',
        'Appears directly before the final takeaways or concluding heading.',
        false,
        'adsense',
        'unit-adsense-inarticle',
        'custom_banner',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&h=240&q=80',
        '/category/ai-tools',
        'Top Generative AI Applications',
        false,
        'all',
        13,
        '300x250 or 728x90'
    ),
    (
        'article_after_content',
        'Article: After Article Content',
        'article',
        'At the end of prose text, directly before author bio, tags, and comments.',
        true,
        'custom',
        NULL,
        'custom_banner',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&h=220&q=80',
        'https://digiseekho.com',
        'Stay Connected with DigiSeekho Insights',
        true,
        'all',
        14,
        '728x90 Responsive Banner'
    ),
    (
        'article_related_section',
        'Article: Related Articles Section',
        'article',
        'Directly above the 3-column Related Articles grid at the bottom of the page.',
        true,
        'adsense',
        'unit-adsense-leaderboard',
        'custom_banner',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&h=180&q=80',
        '/category/technology',
        'Recommended Technology Stacks & Tools',
        false,
        'all',
        15,
        '728x90 / Matched Content'
    ),
    (
        'article_sidebar',
        'Sidebar: Desktop Sticky Sidebar Unit',
        'sidebar',
        'Sticky 300x250 Medium Rectangle or 300x600 Half-Page banner in desktop right rail.',
        true,
        'custom',
        'unit-adsense-rectangle',
        'custom_banner',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&h=300&q=80',
        '/category/ai-tools',
        'DigiSeekho AI & Cloud Pro Certifications',
        false,
        'desktop_only',
        16,
        '300x250 Medium Rectangle'
    ),
    (
        'category_top',
        'Category & Search: Header Banner',
        'general',
        'Displayed at the top of category archives and search results.',
        true,
        'custom',
        NULL,
        'custom_banner',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&h=200&q=80',
        '/category/technology',
        'Top Rated Tools for Tech Creators & Bloggers',
        false,
        'all',
        17,
        '728x90 Leaderboard / Responsive'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    group_name = EXCLUDED.group_name,
    description = EXCLUDED.description,
    network_id = EXCLUDED.network_id,
    ad_unit_id = EXCLUDED.ad_unit_id,
    dimensions_label = EXCLUDED.dimensions_label;

-- ====================================================================
-- Initial Seed Data: Global Settings
-- ====================================================================
INSERT INTO public.ad_settings (
    key, global_enabled, enable_desktop, enable_mobile, adsense_publisher_id,
    auto_ads_enabled, ad_label_en, ad_label_hi, network_toggles
)
VALUES
    (
        'global_config',
        true,
        true,
        true,
        'ca-pub-9842104820194820',
        false,
        'Advertisement',
        'विज्ञापन',
        '{"adsense": true, "adsterra": true, "infolinks": false, "hilltopads": false, "monetag": false, "custom": true}'::jsonb
    )
ON CONFLICT (key) DO NOTHING;
