import React, { useState } from 'react';
import { dataService } from '../lib/dataService';
import { generateSitemapXML, generateRobotsTxt, generateRSSXML } from '../lib/seo';
import { Language } from '../types';
import { Copy, Check, Download, ArrowLeft, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SEOToolsViewProps {
  type: 'sitemap' | 'robots' | 'rss';
  language: Language;
  onNavigate: (path: string) => void;
}

export const SEOToolsView: React.FC<SEOToolsViewProps> = ({ type, language, onNavigate }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const posts = dataService.getPosts({ status: 'published' });
  const categories = dataService.getCategories();

  let content = '';
  let filename = '';
  let title = '';
  let mimeType = 'text/plain';

  if (type === 'sitemap') {
    content = generateSitemapXML(posts, categories);
    filename = 'sitemap.xml';
    title = 'XML Sitemap (Google Search Console Compatible)';
    mimeType = 'application/xml';
  } else if (type === 'robots') {
    content = generateRobotsTxt();
    filename = 'robots.txt';
    title = 'Robots.txt Crawler Directives';
    mimeType = 'text/plain';
  } else if (type === 'rss') {
    content = generateRSSXML(posts, language);
    filename = `${language === 'hi' ? 'hi-' : ''}rss.xml`;
    title = `RSS 2.0 Feed (${language.toUpperCase()})`;
    mimeType = 'application/rss+xml';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast(`Copied ${filename} to clipboard!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DigiSeekho</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Raw'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {filename}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Code className="w-4 h-4" />
          <span>SEO & Crawler Infrastructure</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Serving path: <code className="font-mono text-indigo-600 dark:text-indigo-400">/{filename}</code>. Dynamically reflects all currently published bilingual articles and categories.
        </p>
      </div>

      {/* Code Container */}
      <div className="bg-[#0b1329] text-slate-200 rounded-xl p-5 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-all">
        <pre>{content}</pre>
      </div>
    </div>
  );
};
