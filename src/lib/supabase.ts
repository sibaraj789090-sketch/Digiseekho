import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read runtime environment variables
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Allow local browser configuration override stored in localStorage if user enters keys in Admin UI
const getStoredConfig = () => {
  try {
    const customUrl = localStorage.getItem('digiseekho_supabase_url');
    const customKey = localStorage.getItem('digiseekho_supabase_key');
    return {
      url: customUrl || envUrl,
      key: customKey || envKey,
    };
  } catch {
    return { url: envUrl, key: envKey };
  }
};

const config = getStoredConfig();

export const isSupabaseConfigured = (): boolean => {
  const current = getStoredConfig();
  return Boolean(
    current.url &&
    current.key &&
    current.url.startsWith('https://') &&
    current.url.includes('.supabase.co') &&
    current.key.length > 20
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredConfig();
  if (isSupabaseConfigured()) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('digiseekho_supabase_url', url.trim());
  localStorage.setItem('digiseekho_supabase_key', key.trim());
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('digiseekho_supabase_url');
  localStorage.removeItem('digiseekho_supabase_key');
};

export const supabase = getSupabaseClient();
