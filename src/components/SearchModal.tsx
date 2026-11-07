import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { Post } from '../types';

interface SearchModalProps {
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onNavigate }) => {
  const { searchOpen, setSearchOpen, language } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHindi = language === 'hi';

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const posts = dataService.getPosts({ search: query, status: 'published' });
    setResults(posts.slice(0, 5));
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const handleSelectPost = (post: Post) => {
    const translation = post.translations[language];
    const path = language === 'hi' ? `/hi/blog/${translation.slug}` : `/blog/${translation.slug}`;
    setSearchOpen(false);
    onNavigate(path);
  };

  const handleViewAllResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const path = language === 'hi' ? `/hi/search?q=${encodeURIComponent(query)}` : `/search?q=${encodeURIComponent(query)}`;
    setSearchOpen(false);
    onNavigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleViewAllResults} className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isHindi ? 'तकनीक, AI टूल्स या SEO सर्च करें...' : 'Search technology, AI tools, guides...'}
            className="w-full bg-transparent border-0 px-3.5 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="ml-2 text-xs font-semibold px-2 py-1 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
          >
            ESC
          </button>
        </form>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>{isHindi ? 'कोई परिणाम नहीं मिला।' : 'No articles found matching your query.'}</p>
              <p className="mt-1 text-xs text-slate-400">
                {isHindi ? 'अन्य कीवर्ड्स जैसे "AI", "ChatGPT" या "SEO" आज़माएं।' : 'Try different terms like "AI", "ChatGPT", or "SEO".'}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {isHindi ? 'लेख के परिणाम' : 'Article Results'}
              </div>
              {results.map(post => {
                const t = post.translations[language];
                return (
                  <button
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3.5 group"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {t.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {t.excerpt}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}

              <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                <button
                  onClick={handleViewAllResults}
                  className="w-full py-2 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isHindi ? `सभी परिणाम देखें (${results.length}+)` : `View all matching results (${results.length}+) →`}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400">
              <div className="font-medium text-slate-500 dark:text-slate-400 mb-2">
                {isHindi ? 'लोकप्रिय विषय' : 'Popular Search Topics'}
              </div>
              <div className="flex flex-wrap gap-2">
                {['ChatGPT', 'SEO', 'Artificial Intelligence', 'Cyber Security', 'Digital Skills'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
