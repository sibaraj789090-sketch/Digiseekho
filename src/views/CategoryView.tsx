import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { updatePageSEO, BASE_SITE_URL } from '../lib/seo';
import { ArticleCard } from '../components/ArticleCard';
import { AdBanner } from '../components/AdBanner';
import { Language } from '../types';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';

interface CategoryViewProps {
  slug: string;
  language: Language;
  onNavigate: (path: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ slug, language, onNavigate }) => {
  const isHindi = language === 'hi';
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const category = dataService.getCategoryBySlug(slug);
  const posts = dataService.getPosts({ categorySlug: slug, status: 'published' });

  useEffect(() => {
    if (!category) return;
    const trans = category.translations[language];
    const canonicalUrl = `${BASE_SITE_URL}/${isHindi ? 'hi/' : ''}category/${trans.slug}`;
    const hreflangEn = `${BASE_SITE_URL}/category/${category.translations.en.slug}`;
    const hreflangHi = `${BASE_SITE_URL}/hi/category/${category.translations.hi.slug}`;

    updatePageSEO({
      title: `${trans.name} Guides & Articles – DigiSeekho`,
      description: trans.description || `Read the latest articles on ${trans.name} in ${isHindi ? 'Hindi' : 'English'} at DigiSeekho.`,
      canonicalUrl,
      hreflangEn,
      hreflangHi,
      category: trans.name
    });
  }, [category, slug, language, isHindi]);

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {isHindi ? 'श्रेणी नहीं मिली' : 'Category Not Found'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {isHindi ? 'यह श्रेणी मौजूद नहीं है।' : 'The requested category does not exist.'}
        </p>
        <button
          onClick={() => onNavigate(isHindi ? '/hi' : '/')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {isHindi ? 'होमपेज पर लौटें' : 'Return Home'}
        </button>
      </div>
    );
  }

  const trans = category.translations[language];

  // Sorting
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views_count || 0) - (a.views_count || 0);
    }
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <button
          onClick={() => onNavigate(isHindi ? '/hi' : '/')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {isHindi ? 'होम' : 'Home'}
        </button>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{trans.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 mb-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            {isHindi ? 'श्रेणी संग्रह' : 'Topic Hub'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {trans.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
            {trans.description}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              {posts.length} {isHindi ? 'प्रकाशित लेख' : (posts.length === 1 ? 'Published Article' : 'Published Articles')}
            </span>

            {/* Sort Controls (Segmented interactive buttons) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  sortBy === 'latest'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isHindi ? 'नवीनतम' : 'Latest'}
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isHindi ? 'लोकप्रिय' : 'Most Read'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Top Leaderboard Ad Banner */}
      <div className="mb-10">
        <AdBanner slotId="category_top" onNavigate={onNavigate} />
      </div>

      {/* Articles Grid */}
      {sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.map(post => (
            <ArticleCard
              key={post.id}
              post={post}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400 text-base mb-4">
            {isHindi ? 'इस श्रेणी में अभी कोई लेख उपलब्ध नहीं है।' : 'No articles published in this category yet.'}
          </p>
          <button
            onClick={() => onNavigate(isHindi ? '/hi' : '/')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isHindi ? 'सभी लेख ब्राउज़ करें →' : 'Browse All Articles →'}
          </button>
        </div>
      )}
    </div>
  );
};
