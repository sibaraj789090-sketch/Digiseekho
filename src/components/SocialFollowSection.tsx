import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { SocialMediaSettings } from '../types';

export const SocialFollowSection: React.FC = () => {
  const { language } = useApp();
  const isHindi = language === 'hi';

  const [social, setSocial] = useState<SocialMediaSettings>(() => dataService.getSocialMedia());

  useEffect(() => {
    const handleUpdate = () => {
      setSocial(dataService.getSocialMedia());
    };

    window.addEventListener('digiseekho_social_changed', handleUpdate);
    window.addEventListener('digiseekho_settings_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('digiseekho_social_changed', handleUpdate);
      window.removeEventListener('digiseekho_settings_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter only enabled and non-empty platforms
  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      config: social.youtube,
      color: '#FF0000',
      bgColor: 'bg-[#FF0000]',
      shadowColor: 'hover:shadow-red-600/40',
      borderColor: 'border-red-500/20',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      config: social.facebook,
      color: '#1877F2',
      bgColor: 'bg-[#1877F2]',
      shadowColor: 'hover:shadow-blue-600/40',
      borderColor: 'border-blue-500/20',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      config: social.instagram,
      color: '#E1306C',
      bgColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      shadowColor: 'hover:shadow-pink-600/40',
      borderColor: 'border-pink-500/20',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      config: social.telegram,
      color: '#24A1DE',
      bgColor: 'bg-[#24A1DE]',
      shadowColor: 'hover:shadow-sky-500/40',
      borderColor: 'border-sky-500/20',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current -translate-x-0.5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z" />
        </svg>
      )
    }
  ].filter(p => p.config && p.config.enabled && p.config.url && p.config.url.trim().length > 0);

  // If no platforms are enabled, hide gracefully
  if (platforms.length === 0) {
    return null;
  }

  const title = isHindi
    ? (social.section_title_hi || 'DigiSeekho को फॉलो करें')
    : (social.section_title_en || 'Follow DigiSeekho');

  const subtitle = isHindi
    ? (social.section_subtitle_hi || 'नवीनतम एआई, तकनीक और डिजिटल अपडेट के लिए हमसे जुड़े रहें।')
    : (social.section_subtitle_en || 'Stay connected with us for the latest AI, Technology and Digital Updates.');

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900/95 dark:bg-[#0c1427]/95 border border-slate-800/80 shadow-xl shadow-indigo-950/20 backdrop-blur-md p-5 sm:p-6 transition-all duration-300">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-72 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-72 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 text-center md:text-left">
          
          {/* Section Heading & Subtitle */}
          <div className="max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300/90 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* Social Icons Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {platforms.map(platform => (
              <a
                key={platform.id}
                href={platform.config.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow DigiSeekho on ${platform.name}`}
                className={`group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full text-white ${platform.bgColor} shadow-lg shadow-black/30 ${platform.shadowColor} transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/40`}
              >
                {/* Official Brand Icon */}
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {platform.icon}
                </div>

                {/* Floating tooltip label on hover (desktop) */}
                <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-[11px] font-semibold text-white bg-slate-950/90 px-2 py-0.5 rounded shadow border border-slate-700/60 whitespace-nowrap z-20">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
