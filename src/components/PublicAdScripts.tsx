import React, { useEffect } from 'react';
import { adService } from '../lib/adService';

export const PublicAdScripts: React.FC = () => {
  useEffect(() => {
    // Strict Guard: Never inject site-wide scripts if currently in admin area
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.includes('/admin')) {
      return;
    }

    // Immediately purge any top banner scripts or elements that overlay the header
    const topBannerScript = document.getElementById('script-hilltop-banner');
    if (topBannerScript) topBannerScript.remove();
    document.querySelectorAll('script[src*="buXdVZs"]').forEach(el => el.remove());

    const settings = adService.getSettings();
    if (!settings.global_enabled) return;

    // 1. HilltopAds MultiTag Ad Code (Site-wide in-page monetization)
    if (!document.getElementById('script-hilltop-multitag')) {
      const s2 = document.createElement('script');
      s2.id = 'script-hilltop-multitag';
      s2.async = true;
      s2.referrerPolicy = 'no-referrer-when-downgrade';
      s2.src = '//shameful-farm.com/b.XYVys/dSGTlQ0-Y/WNc_/yebmY9GunZgUal/kZPtTgcP2HMyD/EL4pNRj/EEtbNbzFY/wYM/TCgQ2/NxQ_';
      document.head.appendChild(s2);
    }

    // 2. Popunder Ad Tag (Site-wide abscloud.org)
    if (!document.getElementById('script-popunder-abscloud')) {
      const s3 = document.createElement('script');
      s3.id = 'script-popunder-abscloud';
      s3.setAttribute('data-cfasync', 'false');
      s3.src = 'https://abscloud.org/1/0f311620061c320582c5f48edb2b8ab7';
      document.head.appendChild(s3);
    }

    // 3. Native Container Ad Script (bauval.org/21)
    if (!document.getElementById('script-native-bauval')) {
      const s4 = document.createElement('script');
      s4.id = 'script-native-bauval';
      s4.async = true;
      s4.setAttribute('data-cfasync', 'false');
      s4.src = 'https://bauval.org/21/ae6aed7d96190fde7b38946cb1caf448';
      document.head.appendChild(s4);
    }

    // 4. Social Bar Ad Tag (bauval.org/14)
    if (!document.getElementById('script-socialbar-bauval')) {
      const s5 = document.createElement('script');
      s5.id = 'script-socialbar-bauval';
      s5.setAttribute('data-cfasync', 'false');
      s5.src = 'https://bauval.org/14/38962adaf86e4b9a1a55372f26cec354';
      document.head.appendChild(s5);
    }

    return () => {
      // If navigating away or unmounting, keep DOM clean
      const scriptIds = [
        'script-hilltop-banner',
        'script-hilltop-multitag',
        'script-popunder-abscloud',
        'script-native-bauval',
        'script-socialbar-bauval'
      ];
      if (window.location.pathname.startsWith('/admin')) {
        scriptIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
      }
    };
  }, []);

  return null;
};
