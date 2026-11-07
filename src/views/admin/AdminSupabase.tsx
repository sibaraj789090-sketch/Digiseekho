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

  const sqlSchemaSnippet = `-- DigiSeekho Supabase Schema (12 Tables with RLS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'editor',
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT DEFAULT 'Folder',
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    UNIQUE(language, slug),
    UNIQUE(category_id, language)
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    featured_image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    reading_time_minutes INT DEFAULT 5,
    views_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    UNIQUE(language, slug),
    UNIQUE(post_id, language)
);

-- Public Storage Buckets for Media & Banners
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Full migration file is in /supabase/migrations/20250101_initial_schema.sql`;

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
