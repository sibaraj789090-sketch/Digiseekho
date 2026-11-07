import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Save, 
  ShieldCheck, 
  BarChart3, 
  FileCode 
} from 'lucide-react';

export const AdminSEO: React.FC = () => {
  const { showToast } = useApp();
  const settings = dataService.getSettings();

  const [ga4Id, setGa4Id] = useState(settings.ga4_id || '');
  const [gtmId, setGtmId] = useState(settings.gtm_id || '');
  const [gscToken, setGscToken] = useState(settings.gsc_verification || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings({
      ga4_id: ga4Id.trim(),
      gtm_id: gtmId.trim(),
      gsc_verification: gscToken.trim()
    });
    showToast('SEO & Analytics credentials saved!', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          SEO & Analytics Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure search console ownership verification, Core Web Vitals, and tracking
        </p>
      </div>

      {/* Crawl Directives & Feeds Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">XML Sitemap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">Google Indexing Protocol compliant</p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Inspect /sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Robots.txt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">Googlebot & Bingbot allowed</p>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Inspect /robots.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Bilingual RSS 2.0</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">EN & HI RSS Feeds active</p>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Inspect /rss.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Google Search Console Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Enter your verification token from Google Search Console (HTML tag method)
          </p>
          <input
            type="text"
            value={gscToken}
            onChange={e => setGscToken(e.target.value)}
            placeholder="e.g. google-site-verification=abc123xyz"
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Google Analytics 4 (GA4)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Measurement ID for privacy-compliant pageview tracking
          </p>
          <input
            type="text"
            value={ga4Id}
            onChange={e => setGa4Id(e.target.value)}
            placeholder="e.g. G-XXXXXXXXXX"
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Google Tag Manager (GTM)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Container ID for advanced conversion tracking
          </p>
          <input
            type="text"
            value={gtmId}
            onChange={e => setGtmId(e.target.value)}
            placeholder="e.g. GTM-XXXXXXX"
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save SEO Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
