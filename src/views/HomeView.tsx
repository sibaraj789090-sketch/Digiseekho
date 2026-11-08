import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { ArticleCard } from '../components/ArticleCard';
import { SocialFollowSection } from '../components/SocialFollowSection';
import { CategoryNavSection } from '../components/CategoryNavSection';
import { AdBanner } from '../components/AdBanner';
import { normalizeImageUrl } from '../lib/imageUtils';
import { TrendingUp, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { language, showToast } = useApp();
  const isHindi = language === 'hi';

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);
  const [banner, setBanner] = useState(() => dataService.getBanner());

  useEffect(() => {
    const handleBannerUpdate = () => {
      setBanner(dataService.getBanner());
    };
    window.addEventListener('digiseekho_settings_changed', handleBannerUpdate);
    window.addEventListener('digiseekho_banner_changed', handleBannerUpdate);
    window.addEventListener('storage', handleBannerUpdate);
    return () => {
      window.removeEventListener('digiseekho_settings_changed', handleBannerUpdate);
      window.removeEventListener('digiseekho_banner_changed', handleBannerUpdate);
      window.removeEventListener('storage', handleBannerUpdate);
    };
  }, []);

  const posts = dataService.getPosts({ status: 'published' });
  const categories = dataService.getCategories();

  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  const secondaryPosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 2);
  const latestPosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 6);
  const trendingPosts = posts.filter(p => p.is_trending).slice(0, 4);

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
    <div className="space-y-10 sm:space-y-16 pb-20">
      
      {/* 2. DigiSeekho Custom Hero Banner Section */}
      {banner.enabled && banner.desktop_image_url && (
        <section className="relative pt-2 sm:pt-4 pb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="group relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl shadow-indigo-950/10 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 transition-all duration-300">
              {banner.link_url ? (
                <a
                  href={banner.link_url}
                  target={banner.open_in_new_tab ? '_blank' : undefined}
                  rel={banner.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  className="block w-full focus:outline-none focus:ring-4 focus:ring-indigo-500/30 rounded-2xl md:rounded-3xl cursor-pointer"
                  aria-label={banner.alt_text || 'DigiSeekho Banner'}
                >
                  <picture className="block w-full">
                    {banner.mobile_image_url && (
                      <source media="(max-width: 640px)" srcSet={normalizeImageUrl(banner.mobile_image_url)} />
                    )}
                    <img
                      src={normalizeImageUrl(banner.desktop_image_url, '/assets/images/digiseekho_official_banner.png')}
                      alt={banner.alt_text || 'DigiSeekho – Learn Technology. Discover AI. Grow Digitally.'}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/digiseekho_official_banner.png';
                      }}
                      className="w-full h-auto object-contain block select-none transform transition-transform duration-500 group-hover:scale-[1.003]"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </picture>
                </a>
              ) : (
                <picture className="block w-full">
                  {banner.mobile_image_url && (
                    <source media="(max-width: 640px)" srcSet={normalizeImageUrl(banner.mobile_image_url)} />
                  )}
                  <img
                    src={normalizeImageUrl(banner.desktop_image_url, '/assets/images/digiseekho_official_banner.png')}
                    alt={banner.alt_text || 'DigiSeekho – Learn Technology. Discover AI. Grow Digitally.'}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/digiseekho_official_banner.png';
                    }}
                    className="w-full h-auto object-contain block select-none"
                    loading="eager"
                    fetchPriority="high"
                  />
                </picture>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Placement: Below Homepage Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placementId="home_banner_below" onNavigate={onNavigate} />
      </div>

      {/* 4. Category Navigation Shortcuts (AI Tools, Technology, Mobile Apps, How-To Guides, Blogging & SEO) */}
      <CategoryNavSection onNavigate={onNavigate} />

      {/* 5. Placement: Below Category Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placementId="home_category_nav_below" onNavigate={onNavigate} />
      </div>

      {/* 6. Featured Lead Article & Secondary Features */}
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

      {/* 7. Placement: Between Featured Editorial and Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placementId="home_featured_between" onNavigate={onNavigate} />
      </div>

      {/* 8. Trending Articles Section */}
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

      {/* 9. Latest Articles Grid with "Between Article Cards" Placement */}
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
          {latestPosts.slice(0, 3).map(post => (
            <ArticleCard
              key={post.id}
              post={post}
              language={language}
              onNavigate={onNavigate}
            />
          ))}

          {/* Placement: Between Article Cards */}
          <div className="col-span-full py-2">
            <AdBanner placementId="home_cards_between" onNavigate={onNavigate} />
          </div>

          {latestPosts.slice(3, 6).map(post => (
            <ArticleCard
              key={post.id}
              post={post}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* 10. Browse by Category Section */}
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

      {/* 11. Follow DigiSeekho - Social Media Section */}
      <SocialFollowSection />

      {/* 12. Placement: Above Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placementId="home_newsletter_above" onNavigate={onNavigate} />
      </section>

      {/* 13. Preserved Newsletter Subscription Section */}
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

      {/* 14. Placement: Footer Advertisement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placementId="home_footer" onNavigate={onNavigate} />
      </section>

    </div>
  );
};
