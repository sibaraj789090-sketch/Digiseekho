import React from 'react';

export const BASE_SITE_URL = 'https://digiseekho.com';

/**
 * Permanent, production-bundled default fallback images located in /public/assets/images
 */
export const DEFAULT_ARTICLE_IMAGE = '/assets/images/hero_tech_editorial_1794037937726.jpg';
export const DEFAULT_FALLBACK_SVG = '/assets/images/article_fallback.svg';
export const DEFAULT_AUTHOR_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

/**
 * Normalizes any image URL or file path so that it works seamlessly in both
 * local development, AI Studio preview, and production static hosting (e.g., Vercel).
 *
 * Root cause fixes:
 * 1. Vite does not bundle raw `/src/assets/...` strings at runtime during production builds.
 *    Images in `/public/assets/...` are copied verbatim to the `/assets/...` root on build.
 * 2. Rewrites legacy `/src/assets/` references to `/assets/`.
 * 3. Prevents transient `blob:` URLs from persisting and breaking across sessions.
 * 4. Strips preview localhost prefixes.
 */
export function normalizeImageUrl(url?: string | null, fallback = DEFAULT_ARTICLE_IMAGE): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  let cleaned = url.trim();

  // Strip temporary blob: URLs which are invalid in production
  if (cleaned.startsWith('blob:')) {
    return fallback;
  }

  // Strip localhost / preview origin prefix if accidentally embedded
  cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

  // Strip /public or public prefix
  if (cleaned.startsWith('/public/')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('public/')) {
    cleaned = '/' + cleaned.substring(7);
  }

  // Fix /src/assets/ and src/assets/ paths -> /assets/
  if (cleaned.startsWith('/src/assets/images/')) {
    cleaned = '/assets/images/' + cleaned.substring('/src/assets/images/'.length);
  } else if (cleaned.startsWith('src/assets/images/')) {
    cleaned = '/assets/images/' + cleaned.substring('src/assets/images/'.length);
  } else if (cleaned.startsWith('/src/assets/')) {
    cleaned = '/assets/' + cleaned.substring('/src/assets/'.length);
  } else if (cleaned.startsWith('src/assets/')) {
    cleaned = '/assets/' + cleaned.substring('src/assets/'.length);
  }

  // If path is local without leading slash, add it
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://') && !cleaned.startsWith('data:') && !cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }

  return cleaned;
}

/**
 * Generates an absolute HTTPS URL for OpenGraph, Twitter Cards, and Schema.org JSON-LD.
 */
export function toAbsoluteImageUrl(url?: string | null): string {
  const normalized = normalizeImageUrl(url);
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${BASE_SITE_URL}${cleanPath}`;
}

/**
 * Handles image onError gracefully.
 * Attempts the primary photo fallback first, and if that also fails, falls back to the SVG vector asset.
 * Guarantees no infinite loops.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  customFallback: string = DEFAULT_ARTICLE_IMAGE
) {
  const target = event.currentTarget;
  if (!target) return;

  const currentLevel = target.dataset.fallbackLevel || '0';

  if (currentLevel === '0') {
    target.dataset.fallbackLevel = '1';
    target.src = customFallback;
  } else if (currentLevel === '1') {
    target.dataset.fallbackLevel = '2';
    target.src = DEFAULT_FALLBACK_SVG;
  } else {
    // Both attempts failed, stop modifying src to prevent error loops
    target.style.opacity = '0.7';
  }
}
