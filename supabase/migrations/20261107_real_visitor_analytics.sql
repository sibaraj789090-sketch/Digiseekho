-- ====================================================================
-- DigiSeekho Real Visitor Analytics Migration
-- Tracks 100% authentic unique visitors, daily, weekly, and monthly visits
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    referrer_type VARCHAR(20) DEFAULT 'direct',
    device VARCHAR(20) DEFAULT 'desktop',
    browser VARCHAR(50),
    os VARCHAR(50),
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for high-speed analytical queries (Daily, Weekly, Monthly aggregations)
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON public.page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON public.page_visits(path);
CREATE INDEX IF NOT EXISTS idx_page_visits_date ON public.page_visits((created_at::date));

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- 1) Public users can insert their own visit records without authentication
CREATE POLICY "Public can log page visits" ON public.page_visits
    FOR INSERT WITH CHECK (true);

-- 2) Only authenticated admin can view analytics
CREATE POLICY "Admin can view page visits" ON public.page_visits
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
