import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useRouter } from './lib/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { FloatingSkyscraper } from './components/FloatingSkyscraper';
import { HomeView } from './views/HomeView';
import { ArticleView } from './views/ArticleView';
import { CategoryView } from './views/CategoryView';
import { SearchView } from './views/SearchView';
import { StaticPageView } from './views/StaticPageView';
import { SEOToolsView } from './views/SEOToolsView';
import { analyticsService } from './lib/analyticsService';

// Admin Views
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminVisitors } from './views/admin/AdminVisitors';
import { AdminPosts } from './views/admin/AdminPosts';
import { AdminPostEditor } from './views/admin/AdminPostEditor';
import { AdminCategories } from './views/admin/AdminCategories';
import { AdminMedia } from './views/admin/AdminMedia';
import { AdminComments } from './views/admin/AdminComments';
import { AdminSubscribers } from './views/admin/AdminSubscribers';
import { AdminSEO } from './views/admin/AdminSEO';
import { AdminSettings } from './views/admin/AdminSettings';
import { AdminAdsManager } from './views/admin/AdminAdsManager';
import { AdminNavigation } from './views/admin/AdminNavigation';
import { AdminSupabase } from './views/admin/AdminSupabase';

const MainApp: React.FC = () => {
  const { route, navigate } = useRouter();
  const { language, isAdminAuthenticated } = useApp();

  // Track real visitor pageviews on public content routes (exclude admin & SEO endpoints)
  useEffect(() => {
    if (
      route.view !== 'admin' &&
      route.view !== 'sitemap' &&
      route.view !== 'robots' &&
      route.view !== 'rss'
    ) {
      const timer = setTimeout(() => {
        analyticsService.trackPageView(
          route.rawPath || '/',
          document.title || 'DigiSeekho',
          route.language || 'en'
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [route.rawPath, route.view, route.language]);

  // Special SEO Directives Endpoints
  if (route.view === 'sitemap') {
    return <SEOToolsView type="sitemap" language={language} onNavigate={navigate} />;
  }
  if (route.view === 'robots') {
    return <SEOToolsView type="robots" language={language} onNavigate={navigate} />;
  }
  if (route.view === 'rss') {
    return <SEOToolsView type="rss" language={route.language} onNavigate={navigate} />;
  }

  // Admin Area
  if (route.view === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => navigate('/admin/dashboard')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    const currentSection = route.adminSection || 'dashboard';

    return (
      <AdminLayout
        currentSection={currentSection}
        onSelectSection={(sec: string, param?: string) => {
          if (sec === 'edit-post' && param) {
            navigate(`/admin/edit-post/${param}`);
          } else {
            navigate(`/admin/${sec}`);
          }
        }}
        onNavigateHome={() => navigate('/')}
      >
        {currentSection === 'dashboard' && (
          <AdminDashboard
            onSelectSection={(sec, param) => {
              if (sec === 'edit-post' && param) {
                navigate(`/admin/edit-post/${param}`);
              } else {
                navigate(`/admin/${sec}`);
              }
            }}
            onNavigateHome={() => navigate('/')}
          />
        )}
        {currentSection === 'visitors' && (
          <AdminVisitors onNavigateHome={() => navigate('/')} />
        )}
        {currentSection === 'posts' && (
          <AdminPosts
            onSelectSection={(sec, param) => {
              if (sec === 'edit-post' && param) {
                navigate(`/admin/edit-post/${param}`);
              } else {
                navigate(`/admin/${sec}`);
              }
            }}
            onNavigateHome={() => navigate('/')}
          />
        )}
        {currentSection === 'new-post' && (
          <AdminPostEditor onSelectSection={sec => navigate(`/admin/${sec}`)} />
        )}
        {currentSection === 'edit-post' && (
          <AdminPostEditor
            postId={route.adminParam}
            onSelectSection={sec => navigate(`/admin/${sec}`)}
          />
        )}
        {currentSection === 'categories' && <AdminCategories />}
        {currentSection === 'tags' && <AdminCategories />}
        {currentSection === 'media' && <AdminMedia />}
        {currentSection === 'comments' && <AdminComments />}
        {currentSection === 'subscribers' && <AdminSubscribers />}
        {currentSection === 'seo' && <AdminSEO />}
        {currentSection === 'settings' && <AdminSettings initialTab="banner" onNavigateHome={() => navigate('/')} />}
        {currentSection === 'banner' && <AdminSettings initialTab="banner" onNavigateHome={() => navigate('/')} />}
        {currentSection === 'social' && <AdminSettings initialTab="social" onNavigateHome={() => navigate('/')} />}
        {currentSection === 'ads' && <AdminAdsManager onNavigateHome={() => navigate('/')} />}
        {currentSection === 'navigation' && <AdminNavigation />}
        {currentSection === 'supabase' && <AdminSupabase />}
        {currentSection === 'profile' && <AdminSettings initialTab="general" onNavigateHome={() => navigate('/')} />}
      </AdminLayout>
    );
  }

  // Public Website Shell
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-colors">
      <Header onNavigate={navigate} currentPath={route.rawPath} />

      <main className="flex-1">
        {route.view === 'home' && <HomeView onNavigate={navigate} />}

        {route.view === 'article' && route.slug && (
          <ArticleView
            slug={route.slug}
            language={route.language}
            onNavigate={navigate}
          />
        )}

        {route.view === 'category' && route.slug && (
          <CategoryView
            slug={route.slug}
            language={route.language}
            onNavigate={navigate}
          />
        )}

        {route.view === 'search' && (
          <SearchView
            initialQuery={route.searchQuery || ''}
            language={route.language}
            onNavigate={navigate}
          />
        )}

        {route.view === 'static' && route.staticPage && (
          <StaticPageView
            page={route.staticPage}
            language={route.language}
            onNavigate={navigate}
          />
        )}

        {route.view === 'not-found' && (
          <div className="max-w-2xl mx-auto px-4 py-32 text-center">
            <h1 className="text-6xl font-extrabold text-indigo-600 mb-4 font-mono">404</h1>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {route.language === 'hi' ? 'पृष्ठ नहीं मिला' : 'Page Not Found'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
              {route.language === 'hi'
                ? 'जिस पेज को आप खोज रहे हैं वह स्थानांतरित या हटा दिया गया है।'
                : 'The page you requested could not be found or has been moved.'}
            </p>
            <button
              onClick={() => navigate(route.language === 'hi' ? '/hi' : '/')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              {route.language === 'hi' ? 'होमपेज पर वापस जाएं' : 'Return to Homepage'}
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />
      <SearchModal onNavigate={navigate} />
      <FloatingSkyscraper onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
