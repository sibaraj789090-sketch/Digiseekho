/**
 * DigiSeekho Admin Ad Sanitizer
 * Ensures NO advertisements, popunders, social bars, or third-party ad scripts
 * ever execute, render, or inject elements inside the Admin Panel.
 */

export function cleanAdminAdArtifacts(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Remove all third-party ad scripts from <head> and <body>
    const scriptSelectors = [
      'script[src*="shameful-farm.com"]',
      'script[src*="abscloud.org"]',
      'script[src*="bauval.org"]',
      'script[src*="googlesyndication.com"]',
      'script[src*="infolinks.com"]',
      'script[src*="adsterra.com"]',
      '#script-hilltop-banner',
      '#script-hilltop-multitag',
      '#script-popunder-abscloud',
      '#script-native-bauval',
      '#script-socialbar-bauval'
    ];

    scriptSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          el.remove();
        } catch {}
      });
    });

    // 2. Remove third-party ad iframes
    const iframeSelectors = [
      'iframe[src*="bauval.org"]',
      'iframe[src*="shameful-farm.com"]',
      'iframe[src*="abscloud.org"]',
      'iframe[title*="Advertisement"]',
      'iframe[title*="Wide Skyscraper"]'
    ];

    iframeSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          // If inside admin panel or outside public content container, remove
          if (window.location.pathname.startsWith('/admin')) {
            el.remove();
          }
        } catch {}
      });
    });

    // 3. Remove floating ad containers, social bars, and popunder overlays
    const adContainerSelectors = [
      'div[id^="container-ae6aed7d96190fde7b38946cb1caf448"]',
      'div[id*="adsterra"]',
      'div[class*="socialbar"]',
      'div[class*="social-bar"]',
      'div[id*="infolinks"]',
      'aside[data-ad-placement]'
    ];

    adContainerSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          if (window.location.pathname.startsWith('/admin')) {
            el.remove();
          }
        } catch {}
      });
    });

    // 4. Clean stray fixed/absolute overlay elements created by ad networks on document.body
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      if (child.id === 'root') return;
      try {
        const style = window.getComputedStyle(child);
        if (style.position === 'fixed' || style.position === 'absolute') {
          const text = (child.outerHTML || '').toLowerCase();
          if (
            text.includes('bauval') ||
            text.includes('shameful-farm') ||
            text.includes('abscloud') ||
            text.includes('atoptions') ||
            text.includes('container-ae6aed')
          ) {
            child.remove();
          }
        }
      } catch {}
    });
  } catch (err) {
    console.debug('Ad sanitizer notice:', err);
  }
}

/**
 * React hook or lifecycle caller to enforce ad-free admin panel
 */
export function useAdminAdFreeGuard(): void {
  if (typeof window === 'undefined') return;

  // Immediate purge
  cleanAdminAdArtifacts();

  // Guard against asynchronous third-party script callbacks
  const interval = setInterval(() => {
    if (window.location.pathname.startsWith('/admin')) {
      cleanAdminAdArtifacts();
    } else {
      clearInterval(interval);
    }
  }, 1000);

  setTimeout(() => clearInterval(interval), 10000);
}
