import React, { useState } from 'react';
import { 
  isSupabaseConfigured, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials,
  getSupabaseClient 
} from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  KeyRound, 
  Server,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const AdminSupabase: React.FC = () => {
  const { showToast } = useApp();
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isConnected = isSupabaseConfigured();

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('digiseekho_supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('digiseekho_supabase_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  });

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('Please provide both Supabase URL and Anon API Key.', 'error');
      return;
    }

    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    showToast('Supabase credentials saved! Initializing client...', 'success');
    handleTestConnection();
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
    showToast('Supabase custom credentials cleared. Local store active.', 'info');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const client = getSupabaseClient();
    if (!client) {
      setTestResult({
        success: false,
        message: 'Could not initialize client. Please verify the Project URL format (https://xxx.supabase.co).'
      });
      setTesting(false);
      return;
    }

    try {
      // Test querying posts or categories table
      const { data, error } = await client.from('categories').select('id').limit(1);
      if (error) {
        setTestResult({
          success: false,
          message: `Supabase ping connected, but encountered query response: ${error.message}. Ensure you have executed the initial SQL migration below in Supabase SQL Editor.`
        });
      } else {
        setTestResult({
          success: true,
          message: 'Connection verified! Your Supabase PostgreSQL database is active and responding to queries.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error or invalid credentials: ${err.message || 'Check project URL and key'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const sqlSchemaSnippet = `-- DigiSeekho Supabase Complete Schema & RLS Policies
-- Execute this once in your Supabase SQL Editor
-- Step 1: Enable Necessary Crypto Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Profiles Table
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

-- Step 3: Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT DEFAULT 'Folder',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Category Translations Table
CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_trans_lang_slug ON public.category_translations(language, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_trans_cat_lang ON public.category_translations(category_id, language);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_category_translations_cat') THEN
        ALTER TABLE public.category_translations ADD CONSTRAINT fk_category_translations_cat FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Master Posts Table
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

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_category') THEN
        ALTER TABLE public.posts ADD CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_author') THEN
        ALTER TABLE public.posts ADD CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 6: Post Translations Table (Bilingual: en and hi)
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_trans_lang_slug ON public.post_translations(language, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_trans_post_lang ON public.post_translations(post_id, language);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_translations_post') THEN
        ALTER TABLE public.post_translations ADD CONSTRAINT fk_post_translations_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 7: Ancillary Tables (Site Settings, Page Visits, Ad Events, Comments)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    placement_id TEXT NOT NULL,
    network_id TEXT NOT NULL,
    device TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON public.post_translations(slug);
CREATE INDEX IF NOT EXISTS idx_post_translations_lang ON public.post_translations(language);

-- Step 9: Enable Row Level Security (RLS) safely on existing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Step 10: RLS Policies for Universal App Access
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

    CREATE POLICY "Allow select for all posts" ON public.posts FOR SELECT USING (true);
    CREATE POLICY "Allow insert for all posts" ON public.posts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update for all posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete for all posts" ON public.posts FOR DELETE USING (true);

    DROP POLICY IF EXISTS "Allow select for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow insert for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow update for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Allow delete for all post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin select post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin insert post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin update post translations" ON public.post_translations;
    DROP POLICY IF EXISTS "Public and Admin delete post translations" ON public.post_translations;

    CREATE POLICY "Allow select for all post translations" ON public.post_translations FOR SELECT USING (true);
    CREATE POLICY "Allow insert for all post translations" ON public.post_translations FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update for all post translations" ON public.post_translations FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete for all post translations" ON public.post_translations FOR DELETE USING (true);

    DROP POLICY IF EXISTS "Allow all for categories" ON public.categories;
    CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for category translations" ON public.category_translations;
    CREATE POLICY "Allow all for category translations" ON public.category_translations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for site settings" ON public.site_settings;
    CREATE POLICY "Allow all for site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
    CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for page visits" ON public.page_visits;
    CREATE POLICY "Allow all for page visits" ON public.page_visits FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for ad events" ON public.ad_events;
    CREATE POLICY "Allow all for ad events" ON public.ad_events FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for comments" ON public.comments;
    CREATE POLICY "Allow all for comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Step 11: Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 12: Seed Admin & Categories if empty
INSERT INTO public.profiles (id, email, full_name, role, bio)
VALUES ('00000000-0000-0000-0000-000000000001', 'rajsiba2005@gmail.com', 'Siba Prasad', 'admin', 'Founder & Lead Tech Editor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, icon, order_index)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Cpu', 1),
    ('22222222-2222-2222-2222-222222222222', 'Laptop', 2),
    ('33333333-3333-3333-3333-333333333333', 'Smartphone', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.category_translations (id, category_id, language, name, slug, description)
VALUES 
    ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'en', 'AI Tools', 'ai-tools', 'Artificial Intelligence & Generative AI'),
    ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'hi', 'एआई टूल्स', 'ai-tools-hi', 'आर्टिफिशियल इंटेलिजेंस और आधुनिक टूल्स'),
    ('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'en', 'Technology', 'technology', 'Latest technology, software & computing'),
    ('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'hi', 'तकनीक', 'technology-hi', 'नवीनतम तकनीकी रुझान और सॉफ्टवेयर'),
    ('33333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'en', 'Mobile Apps', 'mobile-apps', 'Top mobile apps and smartphones'),
    ('33333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'hi', 'मोबाइल ऐप्स', 'mobile-apps-hi', 'सर्वश्रेष्ठ मोबाइल ऐप्स और स्मार्टफोन')
ON CONFLICT DO NOTHING;`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSQL(true);
    showToast('Schema SQL copied to clipboard!', 'info');
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Supabase Database & Infrastructure
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          PostgreSQL schema, Row Level Security (RLS), and live cloud synchronization
        </p>
      </div>

      {/* Live Status Card */}
      <div className="p-6 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isConnected ? 'Supabase Cloud PostgreSQL' : 'Local Persistent Engine (Active)'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isConnected
                ? 'Your applet has valid Supabase credentials configured and queries are dispatched to cloud PostgreSQL.'
                : 'DigiSeekho is currently using high-performance local storage synchronization with complete bilingual seed data. Enter your Supabase credentials below to attach a cloud database.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
          testResult.success
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        }`}>
          {testResult.message}
        </div>
      )}

      {/* Supabase Credentials Form */}
      <form onSubmit={handleSaveCredentials} className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Supabase Project Credentials
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Supabase Project URL (VITE_SUPABASE_URL)
          </label>
          <input
            type="text"
            required
            value={supabaseUrl}
            onChange={e => setSupabaseUrl(e.target.value)}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
          </label>
          <input
            type="password"
            required
            value={supabaseKey}
            onChange={e => setSupabaseKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isConnected && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:underline"
            >
              Reset to Local Store
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </form>

      {/* SQL Migration & Schema Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PostgreSQL Migration SQL
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Run this in your Supabase project's SQL Editor to bootstrap all 12 tables and RLS security rules
            </p>
          </div>
          <button
            onClick={handleCopySQL}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSQL ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>

        <div className="bg-[#0b1329] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-64 border border-slate-800 select-all">
          <pre>{sqlSchemaSnippet}</pre>
        </div>
        <p className="text-[11px] text-slate-400">
          File location: <code className="font-mono text-indigo-500">supabase/migrations/20250101_initial_schema.sql</code>
        </p>
      </div>

      {/* Vercel Deployment Checklist */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Vercel Deployment Checklist
        </h3>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <li>Create a free account at <strong>supabase.com</strong> and copy your Project URL & Anon Key.</li>
          <li>Paste the SQL migration above into Supabase SQL Editor and click <strong>Run</strong>.</li>
          <li>Deploy this repository to <strong>Vercel</strong> by connecting GitHub.</li>
          <li>In Vercel Project Settings &gt; Environment Variables, add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li>
          <li>Add custom domain <code>digiseekho.com</code> in Vercel Domains tab with CNAME records.</li>
        </ol>
      </div>

    </div>
  );
};
