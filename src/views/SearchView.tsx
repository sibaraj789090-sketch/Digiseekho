import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { ArticleCard } from '../components/ArticleCard';
import { Language, Post } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { updatePageSEO, BASE_SITE_URL } from '../lib/seo';

interface SearchViewProps {
  initialQuery?: string;
  language: Language;
  onNavigate: (path: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '', language, onNavigate }) => {
  const isHindi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = dataService.getCategories();
  const allPosts = dataService.getPosts({ status: 'published' });

  useEffect(() => {
    updatePageSEO({
      title: isHindi ? `सर्च: ${searchTerm || 'सभी लेख'} – DigiSeekho` : `Search: ${searchTerm || 'All Guides'} – DigiSeekho`,
      description: isHindi ? 'DigiSeekho पर तकनीक, AI टूल्स और SEO से जुड़े लेख सर्च करें।' : 'Search technology, AI, and SEO articles across DigiSeekho.',
      canonicalUrl: `${BASE_SITE_URL}/${isHindi ? 'hi/' : ''}search`,
      hreflangEn: `${BASE_SITE_URL}/search`,
      hreflangHi: `${BASE_SITE_URL}/hi/search`
    });
  }, [searchTerm, isHindi]);

  // Filter posts based on search term and category
  const filteredPosts = allPosts.filter(post => {
    const t = post.translations[language];
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch = !term || (
      t.title.toLowerCase().includes(term) ||
      t.excerpt.toLowerCase().includes(term) ||
      (t.focus_keyword && t.focus_keyword.toLowerCase().includes(term)) ||
      (post.tags && post.tags.some(tag => (isHindi ? tag.name_hi : tag.name_en).toLowerCase().includes(term)))
    );

    const matchesCategory = selectedCategory === 'all' || post.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      
      {/* Search Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {isHindi ? 'लेख और संसाधन खोजें' : 'Search Articles & Guides'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
          {isHindi
            ? 'अपनी पसंद के विषय, टूल्स और ट्यूटोरियल खोजें।'
            : 'Find deep dives, prompt engineering guides, and technical tutorials.'}
        </p>

        {/* Input Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isHindi ? 'सर्च करें: "ChatGPT", "SEO", "Prompt"...' : 'Search: "ChatGPT", "SEO", "Prompt"...'}
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="all">{isHindi ? 'सभी श्रेणियां' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.translations[language].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count & Scope */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div>
          {searchTerm ? (
            <span>
              {isHindi ? `"${searchTerm}" के लिए ` : 'Showing results for '}
              <strong className="text-slate-900 dark:text-white">"{searchTerm}"</strong>
              {' '}({filteredPosts.length} {isHindi ? 'परिणाम' : 'results'})
            </span>
          ) : (
            <span>{isHindi ? `कुल लेख: ${filteredPosts.length}` : `All articles (${filteredPosts.length})`}</span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <ArticleCard
              key={post.id}
              post={post}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
          <p className="text-base text-slate-700 dark:text-slate-300 font-semibold mb-2">
            {isHindi ? 'कोई मेल खाने वाला लेख नहीं मिला' : 'No matching articles found'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {isHindi
              ? 'कृपया वर्तनी जांचें या कोई अन्य सामान्य कीवर्ड खोजें।'
              : 'Try checking your spelling or search using a more general keyword.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['ChatGPT', 'SEO', 'Artificial Intelligence', 'Cyber Security', 'Online Safety'].map(topic => (
              <button
                key={topic}
                onClick={() => setSearchTerm(topic)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
