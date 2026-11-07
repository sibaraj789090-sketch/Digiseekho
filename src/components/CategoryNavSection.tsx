import React from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { ArrowUpRight } from 'lucide-react';

interface CategoryNavSectionProps {
  onNavigate: (path: string) => void;
}

export const CategoryNavSection: React.FC<CategoryNavSectionProps> = ({ onNavigate }) => {
  const { language } = useApp();
  const isHindi = language === 'hi';

  const categories = dataService.getCategories();

  // The 5 key categories featured in the DigiSeekho banner
  const shortcuts = [
    {
      id: 'ai-tools',
      slug: 'ai-tools',
      titleEn: 'AI Tools',
      titleHi: 'एआई टूल्स',
      descEn: 'Top Prompt & GenAI Tools',
      descHi: 'प्रॉम्प्ट और जेनरेटिव टूल्स',
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
          <path d="M2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2" />
        </svg>
      )
    },
    {
      id: 'technology',
      slug: 'technology',
      titleEn: 'Technology',
      titleHi: 'प्रौद्योगिकी',
      descEn: 'Software & Dev Ecosystem',
      descHi: 'सॉफ्टवेयर और तकनीक',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30 hover:border-blue-400',
      iconBg: 'bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
      badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 20h20" />
          <path d="M9 16v4M15 16v4" />
        </svg>
      )
    },
    {
      id: 'mobile-apps',
      slug: 'mobile-apps',
      titleEn: 'Mobile Apps',
      titleHi: 'मोबाइल ऐप्स',
      descEn: 'Android & iOS Productivity',
      descHi: 'एंड्रॉइड और आईओएस ऐप्स',
      color: 'from-sky-500/20 to-teal-500/10 text-sky-400 border-sky-500/30 hover:border-sky-400',
      iconBg: 'bg-sky-500/15 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M11 18h2" />
          <circle cx="12" cy="5" r="0.75" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'internet-guides',
      slug: 'internet-guides',
      titleEn: 'How-To Guides',
      titleHi: 'हाउ-टू गाइड्स',
      descEn: 'Step-by-Step Tech Tutorials',
      descHi: 'आसान तकनीक ट्यूटोरियल',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="11.5" cy="14.5" r="2.5" />
          <path d="M13.5 16.5L16 19" />
        </svg>
      )
    },
    {
      id: 'blogging-seo',
      slug: 'blogging-seo',
      titleEn: 'Blogging & SEO',
      titleHi: 'ब्लॉगिंग और एसईओ',
      descEn: 'Google Organic Traffic',
      descHi: 'गूगल ऑर्गेनिक सर्च ग्रोथ',
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 16v-4" />
          <path d="M11 16V9" />
          <path d="M15 16V5" />
          <path d="M19 16v-7" />
          <path d="M7 11l4-3 4-4 4 3" />
          <polyline points="16 4 19 4 19 7" />
        </svg>
      )
    }
  ];

  const handleCategoryClick = (slug: string) => {
    // Find matching category in database to ensure exact translation slug
    const matched = categories.find(c => {
      return (
        c.translations.en.slug === slug ||
        c.translations.hi.slug === slug ||
        c.id === slug
      );
    });

    const targetSlug = matched
      ? matched.translations[language].slug
      : slug;

    const path = isHindi
      ? `/hi/category/${targetSlug}`
      : `/category/${targetSlug}`;

    onNavigate(path);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900/95 dark:bg-[#0c1427]/95 border border-slate-800/90 shadow-xl shadow-indigo-950/20 backdrop-blur-md p-3.5 sm:p-5 transition-all duration-300">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

        {/* Section Header Strip */}
        <div className="flex items-center justify-between mb-3.5 px-1 sm:px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 flex items-center gap-1.5">
              <span>{isHindi ? 'त्वरित श्रेणी नेविगेशन' : 'Featured Learning Tracks'}</span>
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline-block font-mono">
            {isHindi ? 'प्रत्येक श्रेणी सीधे एक्सप्लोर करें' : 'Explore by Category Shortcuts'}
          </span>
        </div>

        {/* Categories Horizontal Grid / Scroll Container */}
        <div className="flex sm:grid sm:grid-cols-5 gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pb-0">
          {shortcuts.map(item => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const desc = isHindi ? item.descHi : item.descEn;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCategoryClick(item.slug)}
                className={`group relative flex-1 min-w-[145px] sm:min-w-0 p-3 sm:p-4 rounded-xl md:rounded-2xl bg-gradient-to-b ${item.color} border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40`}
              >
                {/* Top Icon & External Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${item.iconBg}`}>
                    {item.icon}
                  </div>

                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                {/* Category Title & Micro Description */}
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1">
                    {title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
