import React from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { Rss, FileText, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, setLanguage } = useApp();
  const isHindi = language === 'hi';
  const categories = dataService.getCategories();
  const settings = dataService.getSettings();

  return (
    <footer className="bg-slate-50 dark:bg-[#070b16] border-t border-slate-200 dark:border-slate-800/80 transition-colors pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
          
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate(isHindi ? '/hi' : '/')}
              className="group relative inline-flex items-center gap-1.5 focus:outline-none rounded-lg py-1 transition-all"
              aria-label="DigiSeekho Home"
            >
              <span className="relative flex items-center font-black tracking-[-0.035em] text-2xl sm:text-3xl leading-none select-none drop-shadow-[0_2px_12px_rgba(30,144,255,0.22)] dark:drop-shadow-[0_2px_18px_rgba(56,189,248,0.35)]">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 dark:from-white dark:via-slate-100 dark:to-sky-300 bg-clip-text text-transparent font-extrabold">
                  Digi
                </span>
                <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 dark:from-cyan-300 dark:via-sky-400 dark:to-blue-500 bg-clip-text text-transparent font-black">
                  Seekho
                </span>
                <span className="relative flex items-center ml-1 self-baseline -translate-y-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500 shadow-[0_0_10px_#00e5ff,0_0_20px_#0284c7]" />
                </span>
              </span>
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {isHindi ? settings.tagline_hi : settings.tagline_en}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed max-w-sm">
              {isHindi
                ? 'DigiSeekho भारत का प्रमुख द्विभाषी तकनीकी प्रकाशन है, जो पाठकों को आर्टिफिशियल इंटेलिजेंस, डिजिटल स्किल्स और एसईओ में निपुण बनाता है।'
                : 'India\'s premier bilingual publication empowering learners with modern AI capabilities, digital mastery, SEO strategies, and online safety.'}
            </p>

            {/* Language Switch Prompt */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{isHindi ? 'भाषा बदलें:' : 'Switch Edition:'}</span>
              <button
                onClick={() => {
                  setLanguage('en');
                  onNavigate('/');
                }}
                className={`font-semibold ${!isHindi ? 'text-indigo-600 dark:text-indigo-400 underline' : 'hover:text-slate-800 dark:hover:text-white'}`}
              >
                English
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setLanguage('hi');
                  onNavigate('/hi');
                }}
                className={`font-semibold ${isHindi ? 'text-indigo-600 dark:text-indigo-400 underline' : 'hover:text-slate-800 dark:hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {isHindi ? 'श्रेणियां' : 'Categories'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 5).map(cat => {
                const trans = cat.translations[language];
                const path = isHindi ? `/hi/category/${trans.slug}` : `/category/${trans.slug}`;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => onNavigate(path)}
                      className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                    >
                      {trans.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {isHindi ? 'महत्वपूर्ण लिंक्स' : 'Important Links'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate(isHindi ? '/hi/about' : '/about')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'हमारे बारे में' : 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate(isHindi ? '/hi/contact' : '/contact')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'संपर्क करें' : 'Contact Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'व्यवस्थापक पैनल' : 'Admin Portal'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/sitemap.xml')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sitemap</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate(isHindi ? '/hi/rss.xml' : '/rss.xml')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-500" />
                  <span>RSS Feed</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {isHindi ? 'कानूनी और नीतियां' : 'Legal & Policies'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'नियम और शर्तें' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/disclaimer')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isHindi ? 'अस्वीकरण' : 'Disclaimer'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/robots.txt')}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  robots.txt
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Domain */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>
            {isHindi ? settings.footer_text_hi : settings.footer_text_en}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono">digiseekho.com</span>
            <span>·</span>
            <span>New Delhi, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
