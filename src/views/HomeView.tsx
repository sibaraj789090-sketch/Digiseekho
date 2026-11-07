import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { ArticleCard } from '../components/ArticleCard';
import { Search, Sparkles, TrendingUp, BookOpen, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { language, setSearchOpen, showToast } = useApp();
  const isHindi = language === 'hi';

  const [heroSearch, setHeroSearch] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const posts = dataService.getPosts({ status: 'published' });
  const categories = dataService.getCategories();
  const settings = dataService.getSettings();

  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  const secondaryPosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 2);
  const latestPosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 6);
  const trendingPosts = posts.filter(p => p.is_trending).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    const path = isHindi 
      ? `/hi/search?q=${encodeURIComponent(heroSearch.trim())}` 
      : `/search?q=${encodeURIComponent(heroSearch.trim())}`;
    onNavigate(path);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dataService.subscribe(newsletterEmail, language);
    if (res.success) {
      setSubscribedSuccess(true);
      showToast(isHindi ? 'सफलतापूर्वक सदस्यता ले ली गई है!' : 'Subscribed successfully to DigiSeekho!', 'success');
      setNewsletterEmail('');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-18 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Editorial Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
              <span>{isHindi ? 'भारत का अग्रणी तकनीकी प्रकाशन' : 'India\'s Premier Bilingual Tech Journal'}</span>
              <span aria-hidden="true">·</span>
              <span>2026 Edition</span>
            </div>

            {/* Dominant Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6 [text-wrap:balance]">
              {isHindi ? (
                <>
                  सीखें तकनीक. <span className="text-indigo-600 dark:text-indigo-400">खोजें AI.</span> बढ़ें डिजिटली.
                </>
              ) : (
                <>
                  Learn Technology. <span className="text-indigo-600 dark:text-indigo-400">Discover AI.</span> Grow Digitally.
                </>
              )}
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl">
              {isHindi
                ? 'आर्टिफिशियल इंटेलिजेंस, गूगल एसईओ, डिजिटल कौशल और आधुनिक ऑनलाइन सुरक्षा पर गहन, व्यावहारिक और निष्पक्ष विश्लेषण।'
                : 'Actionable deep dives, prompt engineering guides, organic SEO tactics, and digital literacy tailored for builders and creators.'}
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-xl mb-6">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder={isHindi ? 'विषय खोजें: "ChatGPT", "SEO", "AI Tools"...' : 'Search topics: "ChatGPT", "SEO", "AI Tools"...'}
                className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {isHindi ? 'खोजें' : 'Search'}
              </button>
            </form>

            {/* Fast Category Filter Chips (Functional interactive buttons) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">{isHindi ? 'लोकप्रिय:' : 'Trending:'}</span>
              {categories.slice(0, 4).map(cat => {
                const trans = cat.translations[language];
                const catPath = isHindi ? `/hi/category/${trans.slug}` : `/category/${trans.slug}`;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onNavigate(catPath)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors"
                  >
                    {trans.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Lead Article & Secondary Features (3-Tier Salience) */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isHindi ? 'प्रमुख संपादकीय लेख' : 'Featured Editorial'}
            </h2>
          </div>
          
          <ArticleCard
            post={featuredPost}
            language={language}
            onNavigate={onNavigate}
            featured={true}
          />

          {/* Secondary Features Grid */}
          {secondaryPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {secondaryPosts.map(post => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  language={language}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Trending Articles Section (Numbered Editorial Salience) */}
      <section className="bg-slate-100/60 dark:bg-[#070b16] py-14 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>{isHindi ? 'सर्वाधिक पढ़े जा रहे लेख' : 'Most Read This Week'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
            {isHindi ? 'ट्रेंडिंग गाइड्स और विश्लेषण' : 'Trending Guides & Analysis'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingPosts.map((post, index) => {
              const t = post.translations[language];
              const path = isHindi ? `/hi/blog/${t.slug}` : `/blog/${t.slug}`;
              return (
                <div
                  key={post.id}
                  onClick={() => onNavigate(path)}
                  className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Editorial Number */}
                    <span className="font-mono text-2xl font-bold text-slate-300 dark:text-slate-700 block mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      0{index + 1}.
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-3 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors [text-wrap:balance]">
                      {t.title}
                    </h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{post.reading_time_minutes} {isHindi ? 'मिनट' : 'min'}</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      {isHindi ? 'पढ़ें →' : 'Read →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Latest Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isHindi ? 'नवीनतम प्रकाशित लेख' : 'Latest Articles'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi ? 'नियमित रूप से अपडेट की जाने वाली तकनीक और एआई गाइड्स' : 'Fresh technology analysis, tested workflows, and digital tutorials'}
            </p>
          </div>
          <button
            onClick={() => onNavigate(isHindi ? '/hi/search' : '/search')}
            className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{isHindi ? 'सभी लेख देखें' : 'View All Posts'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map(post => (
            <ArticleCard
              key={post.id}
              post={post}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* 5. Browse by Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isHindi ? 'श्रेणियों के अनुसार ब्राउज़ करें' : 'Explore by Category'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi ? 'अपनी पसंद के विषय में विशेषज्ञता हासिल करें' : 'Deepen your knowledge in specialized domains'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const trans = cat.translations[language];
            const path = isHindi ? `/hi/category/${trans.slug}` : `/category/${trans.slug}`;
            const count = posts.filter(p => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate(path)}
                className="p-5 text-left bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 hover:shadow-xs transition-all group"
              >
                <div className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                  {trans.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {count} {isHindi ? 'लेख' : (count === 1 ? 'article' : 'articles')}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 mb-6 backdrop-blur">
              <Mail className="w-3.5 h-3.5" />
              <span>{isHindi ? 'मुफ़्त साप्ताहिक न्यूज़लेटर' : 'Free Weekly Tech Dispatch'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 [text-wrap:balance]">
              {isHindi
                ? 'तकनीक और AI में आगे रहने के लिए जुड़ें'
                : 'Stay Ahead in Technology & AI. No Noise, Just Signal.'}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              {isHindi
                ? 'हर हफ्ते चुनिंदा AI टूल्स, Google SEO इनसाइट्स और डिजिटल स्किल्स के नए ट्यूटोरियल सीधे अपने इनबॉक्स में पाएं।'
                : 'Join our readers across India and worldwide. Get actionable prompt frameworks, search growth tactics, and digital guides delivered every week.'}
            </p>

            {subscribedSuccess ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-900/50 border border-emerald-600/50 rounded-xl text-emerald-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">
                  {isHindi
                    ? 'धन्यवाद! आपकी सदस्यता DigiSeekho के लिए सक्रिय हो गई है।'
                    : 'Thank you for subscribing! Your DigiSeekho weekly dispatch is confirmed.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder={isHindi ? 'अपना ईमेल पता दर्ज करें...' : 'Enter your email address...'}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-colors shrink-0 shadow"
                >
                  {isHindi ? 'सब्सक्राइब करें' : 'Subscribe Free'}
                </button>
              </form>
            )}

            <p className="text-xs text-slate-400 mt-4">
              {isHindi
                ? 'हम आपकी गोपनीयता का सम्मान करते हैं। कभी भी एक क्लिक में अनसब्सक्राइब करें।'
                : 'Zero spam. Unsubscribe anytime with a single click. Your data is never sold.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
