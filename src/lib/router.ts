import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';

export interface RouteState {
  rawPath: string;
  language: Language;
  view: 'home' | 'article' | 'category' | 'search' | 'static' | 'admin' | 'sitemap' | 'robots' | 'rss' | 'not-found';
  slug?: string;
  staticPage?: 'about' | 'contact' | 'privacy-policy' | 'terms' | 'disclaimer';
  adminSection?: string;
  adminParam?: string;
  searchQuery?: string;
}

export function parseRoute(pathname: string, search: string): RouteState {
  // Clean trailing slashes
  let path = pathname.replace(/\/+$/, '') || '/';
  
  // Check for search query param
  const searchParams = new URLSearchParams(search);
  const q = searchParams.get('q') || '';

  // Check special SEO endpoints
  if (path === '/sitemap.xml') {
    return { rawPath: path, language: 'en', view: 'sitemap' };
  }
  if (path === '/robots.txt') {
    return { rawPath: path, language: 'en', view: 'robots' };
  }
  if (path === '/rss.xml' || path === '/hi/rss.xml') {
    return { rawPath: path, language: path.startsWith('/hi') ? 'hi' : 'en', view: 'rss' };
  }

  // Admin routes
  if (path === '/admin' || path.startsWith('/admin/')) {
    const parts = path.split('/').filter(Boolean); // ['admin', section?, param?]
    const section = parts[1] || 'dashboard';
    const param = parts[2] || undefined;
    return {
      rawPath: path,
      language: 'en',
      view: 'admin',
      adminSection: section,
      adminParam: param
    };
  }

  // Check Language prefix
  let language: Language = 'en';
  let cleanPath = path;
  if (path === '/hi' || path.startsWith('/hi/')) {
    language = 'hi';
    cleanPath = path.substring(3) || '/';
  }

  // Route matches
  if (cleanPath === '/') {
    return { rawPath: path, language, view: 'home' };
  }

  if (cleanPath === '/search') {
    return { rawPath: path, language, view: 'search', searchQuery: q };
  }

  if (cleanPath.startsWith('/blog/')) {
    const slug = cleanPath.replace('/blog/', '').split('/')[0];
    return { rawPath: path, language, view: 'article', slug };
  }

  if (cleanPath.startsWith('/category/')) {
    const slug = cleanPath.replace('/category/', '').split('/')[0];
    return { rawPath: path, language, view: 'category', slug };
  }

  if (['/about', '/contact', '/privacy-policy', '/terms', '/disclaimer'].includes(cleanPath)) {
    const staticPage = cleanPath.substring(1) as any;
    return { rawPath: path, language, view: 'static', staticPage };
  }

  return { rawPath: path, language, view: 'not-found' };
}

export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() =>
    parseRoute(window.location.pathname, window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname, window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setRoute(parseRoute(window.location.pathname, window.location.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}

// URL generator helper
export function getLocalizedUrl(path: string, lang: Language): string {
  if (lang === 'hi') {
    return path === '/' ? '/hi' : `/hi${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
}
