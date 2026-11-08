import React, { useState } from 'react';
import { Search, Moon, Sun, Menu, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPath }) => {
  const { language, setLanguage, theme, toggleTheme, setSearchOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHindi = language === 'hi';

  const navLinks = [
    {
      name: isHindi ? 'होम' : 'Home',
      path: isHindi ? '/hi' : '/'
    },
    {
      name: isHindi ? 'एआई टूल्स' : 'AI Tools',
      path: isHindi ? '/hi/category/ai-tools' : '/category/ai-tools'
    },
    {
      name: isHindi ? 'प्रौद्योगिकी' : 'Technology',
      path: isHindi ? '/hi/category/technology' : '/category/technology'
    },
    {
      name: isHindi ? 'ब्लॉगिंग और एसईओ' : 'Blogging & SEO',
      path: isHindi ? '/hi/category/blogging-seo' : '/category/blogging-seo'
    },
    {
      name: isHindi ? 'डिजिटल गाइड्स' : 'Digital Guides',
      path: isHindi ? '/hi/category/digital-skills' : '/category/digital-skills'
    }
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    if (newLang === 'hi') {
      const hiPath = currentPath === '/' ? '/hi' : `/hi${currentPath}`;
      onNavigate(hiPath);
    } else {
      const enPath = currentPath.replace(/^\/hi/, '') || '/';
      onNavigate(enPath);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Premium AI / Tech Brand Wordmark */}
        <button
          onClick={() => handleLinkClick(isHindi ? '/hi' : '/')}
          className="group relative inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg py-1 px-1 -ml-1 transition-all"
          aria-label="DigiSeekho Home"
        >
          {/* Subtle Ambient Blue Glow Behind Logo */}
          <span
            className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-blue-600/15 via-cyan-500/20 to-blue-500/10 rounded-2xl blur-lg pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />

          <span className="relative flex items-center font-black tracking-[-0.035em] text-2xl sm:text-[26px] md:text-3xl leading-none select-none drop-shadow-[0_2px_12px_rgba(30,144,255,0.22)] dark:drop-shadow-[0_2px_18px_rgba(56,189,248,0.35)]">
            {/* "Digi": White-to-Blue Gradient */}
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 dark:from-white dark:via-slate-100 dark:to-sky-300 bg-clip-text text-transparent font-extrabold transition-all group-hover:brightness-110">
              Digi
            </span>

            {/* "Seekho": Bright Cyan-to-Blue Gradient */}
            <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 dark:from-cyan-300 dark:via-sky-400 dark:to-blue-500 bg-clip-text text-transparent font-black transition-all group-hover:brightness-110">
              Seekho
            </span>

            {/* Small Stylish Glowing Blue Dot */}
            <span className="relative flex items-center ml-1 self-baseline -translate-y-0.5">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-60 group-hover:opacity-90 duration-1000" />
              <span className="relative inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500 shadow-[0_0_10px_#00e5ff,0_0_20px_#0284c7] ring-1 ring-cyan-200/50" />
            </span>
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map(link => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search articles"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bilingual Language Switcher (Segmented Control) */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-md transition-all font-sans ${
                language === 'hi'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="हिंदी में पढ़ें"
            >
              हिन्दी
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Admin Dashboard Entry */}
          <button
            onClick={() => handleLinkClick('/admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Admin</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 pt-2 pb-5 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleLinkClick(link.path)}
              className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Admin Portal</span>
            <button
              onClick={() => handleLinkClick('/admin')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
