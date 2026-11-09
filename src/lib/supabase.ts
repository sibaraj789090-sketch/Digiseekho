import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read runtime environment variables across Vite, Next.js, and Vercel environments
const getEnvVar = (names: string[]): string => {
  for (const name of names) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[name]) {
        return String((import.meta as any).env[name]).trim();
      }
    } catch {}
    try {
      if (typeof process !== 'undefined' && (process as any).env?.[name]) {
        return String((process as any).env[name]).trim();
      }
    } catch {}
  }
  return '';
};

const envUrl = getEnvVar([
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL'
]);

const envKey = getEnvVar([
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_KEY'
]);

// Allow local browser configuration override stored in localStorage if user enters keys in Admin UI
export const getStoredConfig = () => {
  try {
    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('digiseekho_supabase_url') : null;
    const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem('digiseekho_supabase_key') : null;
    const rawUrl = (customUrl || envUrl || '').trim().replace(/\/+$/, '');
    const rawKey = (customKey || envKey || '').trim();
    return {
      url: rawUrl,
      key: rawKey,
    };
  } catch {
    return { 
      url: (envUrl || '').trim().replace(/\/+$/, ''), 
      key: (envKey || '').trim() 
    };
  }
};

export const isSupabaseConfigured = (): boolean => {
  const current = getStoredConfig();
  return Boolean(
    current.url &&
    current.key &&
    (current.url.startsWith('https://') || current.url.startsWith('http://')) &&
    current.key.length > 20
  );
};

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredConfig();
  if (isSupabaseConfigured()) {
    const currentKey = `${url}:${key}`;
    if (cachedClient && lastClientKey === currentKey) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      lastClientKey = currentKey;
      return cachedClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  cachedClient = null;
  lastClientKey = '';
  return null;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('digiseekho_supabase_url', url.trim().replace(/\/+$/, ''));
    localStorage.setItem('digiseekho_supabase_key', key.trim());
  }
  cachedClient = null;
  lastClientKey = '';
};

export const clearSupabaseCredentials = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('digiseekho_supabase_url');
    localStorage.removeItem('digiseekho_supabase_key');
  }
  cachedClient = null;
  lastClientKey = '';
};

export const supabase = getSupabaseClient();
