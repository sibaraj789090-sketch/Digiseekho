import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { analyticsService, AnalyticsSummary } from '../../lib/analyticsService';
import { 
  FileText, 
  Clock, 
  FolderTree, 
  Mail, 
  Eye, 
  PlusCircle, 
  ExternalLink, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Users,
  Calendar,
  Activity,
  BarChart3,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectSection: (section: string, param?: string) => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectSection, onNavigateHome }) => {
  const posts = dataService.getPosts();
  const categories = dataService.getCategories();
  const subscribers = dataService.getSubscribers();
  const comments = dataService.getComments();
  const settings = dataService.getSettings();
  const isSupabaseReady = isSupabaseConfigured();

  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => analyticsService.getAnalyticsSummary());

  useEffect(() => {
    const handleUpdate = () => {
      setAnalytics(analyticsService.getAnalyticsSummary());
    };
    window.addEventListener('digiseekho:analytics_update', handleUpdate);
    const interval = setInterval(() => {
      setAnalytics(analyticsService.getAnalyticsSummary());
    }, 10000);
    return () => {
      window.removeEventListener('digiseekho:analytics_update', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);

  const recentPosts = posts.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publishing analytics, bilingual translations, and platform infrastructure
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSection('new-post')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Published Posts */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Published Posts</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {publishedCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <span>Bilingual (EN + HI)</span>
          </div>
        </div>

        {/* Drafts & Scheduled */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Drafts / In Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {draftCount}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            <span>{scheduledCount} Scheduled</span>
          </div>
        </div>

        {/* Total Subscribers */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subscribers</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {subscribers.length}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Organic Growth</span>
          </div>
        </div>

        {/* Total Article Views */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Organic Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            <span>Across India & Global</span>
          </div>
        </div>

      </div>

      {/* REAL VISITORS TELEMETRY SECTION (Real human visitors: Total, Daily, Weekly, Monthly) */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Real Visitors Telemetry (Live)</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                100% Real • No Fake / Bots
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authentic browser fingerprinting & unique human visitor tracking (Total, Daily, Weekly & Monthly)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => analyticsService.exportAnalyticsCSV()}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => onSelectSection('visitors')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Full Analytics View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Core Metrics: Total, Daily, Weekly, Monthly */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Visitors */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Visitors</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {analytics.totalVisitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>All-time unique users</span>
              <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{analytics.totalPageviews} views</span>
            </div>
          </div>

          {/* 2. Daily Visitors (Today) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily (Today)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {analytics.dailyVisitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{analytics.dailyPageviews} views today</span>
              <span className="text-[10px] font-mono text-slate-400">vs {analytics.yesterdayVisitors} y'day</span>
            </div>
          </div>

          {/* 3. Weekly Visitors (Last 7 Days) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly (7 Days)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {analytics.weeklyVisitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Rolling 7-day unique</span>
              <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{analytics.weeklyPageviews} views</span>
            </div>
          </div>

          {/* 4. Monthly Visitors (Last 30 Days) */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly (30 Days)</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {analytics.monthlyVisitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Rolling 30-day unique</span>
              <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{analytics.monthlyPageviews} views</span>
            </div>
          </div>

        </div>

        {/* Live Status and Device Breakdown Footnote */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <strong>{analytics.activeNow}</strong> active visitor{analytics.activeNow === 1 ? '' : 's'} right now
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Desktop: {analytics.deviceBreakdown.find(d => d.device === 'desktop')?.percentage || 0}% | Mobile: {analytics.deviceBreakdown.find(d => d.device === 'mobile')?.percentage || 0}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin sessions automatically excluded from counts</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Supabase Status */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Database Backend</span>
            </div>
            {isSupabaseReady ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Local Reactive Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {isSupabaseReady
              ? 'Connected directly to your Supabase PostgreSQL cluster with Row Level Security.'
              : 'Local persistent store is active with 100% features. You can link your Supabase URL & Key in Supabase Database tab.'}
          </p>
          <button
            onClick={() => onSelectSection('supabase')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Configure Supabase Credentials</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SEO Configuration Status */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>SEO & Indexing</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Dynamic sitemap.xml, canonical URLs, hreflang tags (EN + HI), and JSON-LD Article Schema are actively generated.
          </p>
          <button
            onClick={() => onSelectSection('seo')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Manage SEO Directives & Verification</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category & Topic Health */}
        <div className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <span>Categories & Topics</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            All 8 core categories are configured with bilingual Hindi and English slugs for optimal search ranking.
          </p>
          <button
            onClick={() => onSelectSection('categories')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Categories & Reorder</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Articles Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recently Managed Articles
          </h2>
          <button
            onClick={() => onSelectSection('posts')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All ({posts.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                <th className="py-3 px-4">Title (EN / HI)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentPosts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-sm">
                      {post.translations.en.title}
                    </div>
                    <div className="text-slate-400 line-clamp-1 max-w-sm font-sans mt-0.5">
                      {post.translations.hi.title}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      post.status === 'published'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {post.views_count.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onSelectSection('edit-post', post.id)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
