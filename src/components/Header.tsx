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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element wordmark */}
        <button
          onClick={() => handleLinkClick(isHindi ? '/hi' : '/')}
          className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          aria-label="DigiSeekho Home"
        >
          <span>DigiSeekho</span>
          <span className="text-indigo-600 dark:text-indigo-400">.</span>
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
