import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { adService } from '../lib/adService';
import { X } from 'lucide-react';

interface FloatingSkyscraperProps {
  onNavigate?: (path: string) => void;
}

export const FloatingSkyscraper: React.FC<FloatingSkyscraperProps> = ({ onNavigate }) => {
  const { language } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const isHindi = language === 'hi';

  const settings = adService.getSettings();
  if (!settings.global_enabled || !settings.enable_desktop || dismissed) {
    return null;
  }

  // Guard: Never render on admin routes
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null;
  }

  const skyscraperCode = `<script>
  atOptions = {
    'key' : '0f4ff4bcb4fc84c6c62fa7b4b248e378',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/0f4ff4bcb4fc84c6c62fa7b4b248e378"></script>`;

  return (
    <aside
      aria-label="Desktop Skyscraper Advertisement"
      className="fixed right-3 top-24 z-30 hidden 2xl:flex flex-col items-center bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl overflow-hidden transition-all duration-300"
      style={{ width: '166px', minHeight: '630px' }}
    >
      {/* Micro-Header with Close button */}
      <div className="w-full flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
        <span className="uppercase font-semibold tracking-wider text-[9px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {isHindi ? 'विज्ञापन' : 'Ad 160x600'}
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title={isHindi ? 'विज्ञापन बंद करें' : 'Close ad'}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* 160x600 Iframe Body */}
      <div className="flex-1 w-full flex items-center justify-center p-0.5 overflow-hidden bg-slate-900/5 dark:bg-slate-950/40">
        <iframe
          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>html,body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;overflow:hidden;width:100%;height:100%;}</style></head><body>${skyscraperCode}</body></html>`}
          title="Wide Skyscraper Advertisement"
          width="160"
          height="600"
          className="border-0 overflow-hidden mx-auto"
          scrolling="no"
        />
      </div>
    </aside>
  );
};
