import React from 'react';
import { Post, Language } from '../types';
import { Clock, Calendar } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  language: Language;
  onNavigate: (path: string) => void;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  language,
  onNavigate,
  featured = false
}) => {
  const translation = post.translations[language] || post.translations.en;
  const isHindi = language === 'hi';

  const categoryName = post.category 
    ? post.category.translations[language]?.name || post.category.translations.en.name 
    : (isHindi ? 'तकनीक' : 'Technology');

  const articlePath = isHindi ? `/hi/blog/${translation.slug}` : `/blog/${translation.slug}`;
  const categoryPath = post.category
    ? (isHindi ? `/hi/category/${post.category.translations[language].slug}` : `/category/${post.category.translations.en.slug}`)
    : '#';

  const formattedDate = new Date(post.published_at).toLocaleDateString(
    isHindi ? 'hi-IN' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  if (featured) {
    return (
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 md:p-8 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
        {/* Left Column: Image with Subtle Scrim & Zoom */}
        <div 
          onClick={() => onNavigate(articlePath)}
          className="lg:col-span-7 aspect-16/10 rounded-xl overflow-hidden cursor-pointer relative bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={post.featured_image}
            alt={post.image_alt || translation.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        </div>

        {/* Right Column: Text & Editorial Metadata */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
          <div>
            {/* Clean unboxed category kicker with typographic separator */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(categoryPath);
                }}
                className="hover:underline"
              >
                {categoryName}
              </button>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal normal-case">
                {isHindi ? 'संपादक की पसंद' : 'Featured Editorial'}
              </span>
            </div>

            {/* Dominant Headline */}
            <h2 
              onClick={() => onNavigate(articlePath)}
              className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-3 mb-4 [text-wrap:balance]"
            >
              {translation.title}
            </h2>

            {/* Deck / Excerpt */}
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
              {translation.excerpt}
            </p>
          </div>

          {/* Author & Reading Metadata - Unboxed inline text */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <img
                src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                alt={post.author?.full_name || 'Author'}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {post.author?.full_name || 'Editorial Team'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{post.reading_time_minutes} {isHindi ? 'मिनट' : 'min read'}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      {/* Thumbnail */}
      <div 
        onClick={() => onNavigate(articlePath)}
        className="aspect-16/10 overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 relative"
      >
        <img
          src={post.featured_image}
          alt={post.image_alt || translation.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Unboxed category and date metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(categoryPath);
              }}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {categoryName}
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{post.reading_time_minutes} {isHindi ? 'मिनट' : 'min'}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onNavigate(articlePath)}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 mb-2.5 [text-wrap:balance]"
          >
            {translation.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {translation.excerpt}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formattedDate}</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {post.author?.full_name?.split(' ')[0] || 'Team'}
          </span>
        </div>
      </div>
    </article>
  );
};
