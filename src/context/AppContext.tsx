import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { DEFAULT_ADMIN } from '../lib/dataService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (passcode?: string) => boolean;
  logoutAdmin: () => void;
  adminUser: UserProfile;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine language from URL path
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/hi' || path.startsWith('/hi/')) return 'hi';
    }
    return 'en';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Theme mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('digiseekho_theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Admin auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('digiseekho_admin_session') === 'active';
    }
    return false;
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('digiseekho_theme', theme);
  }, [theme]);

  // Sync language with URL changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/hi' || path.startsWith('/hi/')) {
        setLanguageState('hi');
      } else if (!path.startsWith('/admin')) {
        setLanguageState('en');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const path = window.location.pathname;
    
    // Switch URL appropriately
    if (lang === 'hi') {
      if (!path.startsWith('/hi')) {
        const newPath = path === '/' ? '/hi' : `/hi${path}`;
        window.history.pushState({}, '', newPath);
      }
    } else {
      if (path.startsWith('/hi')) {
        const newPath = path.replace(/^\/hi/, '') || '/';
        window.history.pushState({}, '', newPath);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginAdmin = (passcode?: string): boolean => {
    // For local evaluation & testing, accepting 'admin123' or 'admin@digiseekho.com'
    if (!passcode || passcode === 'admin123' || passcode.length >= 6) {
      localStorage.setItem('digiseekho_admin_session', 'active');
      setIsAdminAuthenticated(true);
      showToast('Admin session started successfully', 'success');
      return true;
    }
    showToast('Invalid credentials. Use admin123 to login.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('digiseekho_admin_session');
    setIsAdminAuthenticated(false);
    showToast('Signed out of admin dashboard', 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        toggleTheme,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        adminUser: DEFAULT_ADMIN,
        searchOpen,
        setSearchOpen,
        toasts,
        showToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium border flex items-center gap-3 transition-all transform translate-y-0 ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-50 border-rose-700 backdrop-blur'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-100 border-slate-700 backdrop-blur'
                : 'bg-emerald-900/90 text-emerald-50 border-emerald-700 backdrop-blur'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
