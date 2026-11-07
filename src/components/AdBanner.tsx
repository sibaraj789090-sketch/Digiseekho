import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { adService } from '../lib/adService';
import { AdPlacement, AdSystemSettings } from '../types';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  placementId?: string;
  slotId?: string; // backward compatibility
  className?: string;
  onNavigate?: (path: string) => void;
  forceShowForPreview?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placementId,
  slotId,
  className = '',
  onNavigate,
  forceShowForPreview = false
}) => {
  const effectiveId = placementId || slotId || '';
  const { language } = useApp();
  const isHindi = language === 'hi';
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const impressionRecorded = useRef(false);

  const [settings, setSettings] = useState<AdSystemSettings>(() => adService.getSettings());
  const [placement, setPlacement] = useState<AdPlacement | undefined>(() =>
    adService.getPlacementById(effectiveId)
  );

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(adService.getSettings());
      setPlacement(adService.getPlacementById(effectiveId));
    };

    window.addEventListener('digiseekho_ad_system_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('digiseekho_ad_system_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [effectiveId]);

  // Code embed injection effect
  useEffect(() => {
    if (placement && placement.ad_type === 'code' && placement.code && codeContainerRef.current) {
      codeContainerRef.current.innerHTML = '';
      try {
        const range = document.createRange();
        const documentFragment = range.createContextualFragment(placement.code);
        codeContainerRef.current.appendChild(documentFragment);
      } catch (err) {
        console.warn('Ad code rendering notice:', err);
      }
    }
  }, [placement?.code, placement?.ad_type]);

  // Record real impression once when mounted and visible
  useEffect(() => {
    if (!forceShowForPreview && placement && placement.enabled && settings.global_enabled && !impressionRecorded.current) {
      impressionRecorded.current = true;
      adService.recordEvent(effectiveId, 'impression', isMobile ? 'mobile' : 'desktop');
    }
  }, [forceShowForPreview, placement, settings.global_enabled, effectiveId, isMobile]);

  // Guard: Admin safety check - Never render on admin routes
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && !forceShowForPreview) {
    return null;
  }

  if (!placement) {
    return null;
  }

  // Master Global Switch check
  if (!forceShowForPreview) {
    if (!settings.global_enabled) return null;
    if (!placement.enabled) return null;

    // Device toggles
    if (isMobile && !settings.enable_mobile) return null;
    if (!isMobile && !settings.enable_desktop) return null;

    // Placement device visibility
    if (placement.device_visibility === 'mobile_only' && !isMobile) return null;
    if (placement.device_visibility === 'desktop_only' && isMobile) return null;

    // Network master toggle
    if (settings.network_toggles && settings.network_toggles[placement.network_id] === false) {
      return null;
    }
  }

  const badgeText = isHindi
    ? (settings.ad_label_hi || 'विज्ञापन')
    : (settings.ad_label_en || 'Advertisement');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    adService.recordEvent(effectiveId, 'click', isMobile ? 'mobile' : 'desktop');
    if (!placement.link_url) return;
    const url = placement.link_url.trim();
    if (url.startsWith('/') && onNavigate && !placement.open_in_new_tab) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  const imageUrl = isMobile && placement.mobile_image_url
    ? placement.mobile_image_url
    : placement.desktop_image_url;

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={effectiveId}
      className={`relative w-full overflow-hidden rounded-xl md:rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0c1427] shadow-xs transition-all duration-300 ${className}`}
    >
      {/* FTC / Google AdSense Compliant Micro-Label Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider select-none">
        <span className="uppercase font-semibold tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          {badgeText}
        </span>
        <span className="text-[9px] opacity-75 hidden sm:inline">
          {placement.dimensions_label || placement.name}
        </span>
      </div>

      {/* Creative Body */}
      <div className="relative w-full flex items-center justify-center p-2 sm:p-3 overflow-hidden bg-slate-900/5 dark:bg-slate-950/40">
        {placement.ad_type === 'custom_banner' ? (
          imageUrl ? (
            <a
              href={placement.link_url || '#'}
              target={placement.open_in_new_tab ? '_blank' : '_self'}
              rel={placement.open_in_new_tab ? 'noopener noreferrer sponsored' : 'sponsored'}
              onClick={handleClick}
              className="group relative block w-full overflow-hidden rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label={placement.alt_text || placement.name}
            >
              <img
                src={imageUrl}
                alt={placement.alt_text || 'DigiSeekho Sponsored Promotion'}
                loading="lazy"
                className="w-full h-auto max-h-[280px] object-cover sm:object-contain mx-auto rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-[1.008]"
              />

              {placement.link_url && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1 pointer-events-none">
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </a>
          ) : (
            <div className="w-full py-8 px-4 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">
                {isHindi
                  ? 'यह ऐड स्लॉट सक्रिय है (एडमिन पैनल से रचनात्मक बैनर जोड़ें)'
                  : 'Ad slot is active (Configure creative in Admin Panel)'}
              </p>
            </div>
          )
        ) : (
          /* Network code / Google AdSense embed */
          <div
            ref={codeContainerRef}
            className="w-full min-h-[90px] flex items-center justify-center text-center overflow-x-auto"
          />
        )}
      </div>
    </aside>
  );
};
