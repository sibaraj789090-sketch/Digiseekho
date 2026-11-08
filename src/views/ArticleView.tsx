import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../lib/dataService';
import { updatePageSEO, BASE_SITE_URL } from '../lib/seo';
import { Post, Language } from '../types';
import { 
  Clock, 
  Calendar, 
  Share2, 
  Printer, 
  ArrowLeft, 
  Languages, 
  Check, 
  Copy, 
  Send, 
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { FloatingSocialShare } from '../components/FloatingSocialShare';
import { AdBanner } from '../components/AdBanner';
import { normalizeImageUrl, handleImageError, DEFAULT_AUTHOR_AVATAR } from '../lib/imageUtils';

interface ArticleViewProps {
  slug: string;
  language: Language;
  onNavigate: (path: string) => void;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ slug, language, onNavigate }) => {
  const { showToast } = useApp();
  const isHindi = language === 'hi';

  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Retrieve post
  const postData = dataService.getPostBySlug(slug, language);

  useEffect(() => {
    if (!postData) return;
    const { post, translation } = postData;

    // Increment page views
    dataService.incrementViews(post.id);

    // Dynamic SEO update
    const enSlug = post.translations.en.slug;
    const hiSlug = post.translations.hi.slug;
    const canonicalUrl = `${BASE_SITE_URL}/${isHindi ? 'hi/' : ''}blog/${translation.slug}`;
    const hreflangEn = `${BASE_SITE_URL}/blog/${enSlug}`;
    const hreflangHi = `${BASE_SITE_URL}/hi/blog/${hiSlug}`;

    updatePageSEO({
      title: `${translation.seo_title || translation.title} – DigiSeekho`,
      description: translation.meta_description || translation.excerpt,
      canonicalUrl,
      hreflangEn,
      hreflangHi,
      ogImage: normalizeImageUrl(post.featured_image),
      focusKeyword: translation.focus_keyword,
      author: post.author?.full_name || 'DigiSeekho Editorial Team',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      type: 'article',
      category: post.category?.translations[language]?.name
    });
  }, [postData, slug, language, isHindi]);

  // Scroll Reading Progress Bar listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, scrollPercent)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!postData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {isHindi ? 'लेख नहीं मिला' : 'Article Not Found'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {isHindi
            ? 'क्षमा करें, जिस लेख को आप ढूंढ रहे हैं वह मौजूद नहीं है या उसका पता बदल गया है।'
            : 'The article you are looking for does not exist or may have been relocated.'}
        </p>
        <button
          onClick={() => onNavigate(isHindi ? '/hi' : '/')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {isHindi ? 'होमपेज पर लौटें' : 'Return to Homepage'}
        </button>
      </div>
    );
  }

  const { post, translation } = postData;
  const otherLang: Language = language === 'en' ? 'hi' : 'en';
  const otherTranslation = post.translations[otherLang];
  const otherPath = otherLang === 'hi' ? `/hi/blog/${otherTranslation.slug}` : `/blog/${otherTranslation.slug}`;

  // Extract Table of Contents from HTML content (supports attributes & alignments)
  const toc: TOCItem[] = useMemo(() => {
    const headingRegex = /<h([23])\b([^>]*)>(.*?)<\/h\1>/gi;
    const items: TOCItem[] = [];
    let match;
    let idx = 0;
    while ((match = headingRegex.exec(translation.content)) !== null) {
      idx++;
      const level = parseInt(match[1], 10);
      const rawText = match[3].replace(/<[^>]*>/g, '').trim();
      const id = `heading-${idx}`;
      items.push({ id, text: rawText, level });
    }
    return items;
  }, [translation.content]);

  // Insert IDs into HTML content for smooth jumping
  const processedContent = useMemo(() => {
    let idx = 0;
    return translation.content.replace(/<h([23])\b([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
      idx++;
      return `<h${level} id="heading-${idx}" class="scroll-mt-24" ${attrs}>${text}</h${level}>`;
    });
  }, [translation.content]);

  // Split content by </p> or newlines for dynamic in-article ad injection on all posts
  const contentParagraphs = useMemo(() => {
    const raw = processedContent.trim();
    if (!raw) return [];

    // If content does not have explicit </p> tags, split by double newlines
    if (!raw.toLowerCase().includes('</p>')) {
      return raw
        .split(/\n\s*\n/)
        .map(seg => seg.trim())
        .filter(Boolean)
        .map(seg => `<p>${seg}</p>`);
    }

    const parts = raw.split(/(<\/p>)/i);
    const paragraphs: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const fullP = (parts[i] || '') + (parts[i + 1] || '');
      if (fullP.trim()) {
        paragraphs.push(fullP);
      }
    }
    return paragraphs;
  }, [processedContent]);

  // Related posts
  const relatedPosts = dataService.getPosts({ status: 'published' })
    .filter(p => p.id !== post.id && p.category_id === post.category_id)
    .slice(0, 3);

  // Comments
  const comments = dataService.getComments(post.id).filter(c => c.status === 'approved');

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast(isHindi ? 'लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'Article URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${translation.title}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(translation.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&via=digiseekho`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentEmail.trim() || !commentText.trim()) return;

    dataService.addComment({
      postId: post.id,
      authorName: commentName.trim(),
      authorEmail: commentEmail.trim(),
      content: commentText.trim()
    });

    setCommentSuccess(true);
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
    showToast(isHindi ? 'आपकी टिप्पणी प्रकाशित हो गई है!' : 'Your comment has been submitted!', 'success');
  };

  const formattedDate = new Date(post.published_at).toLocaleDateString(
    isHindi ? 'hi-IN' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  return (
    <article className="pb-24 relative">
      {/* 1. Reading Progress Bar at viewport top */}
      <div 
        className="reading-bar fixed top-0 left-0 z-50 h-1 bg-indigo-600 transition-all duration-75"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Floating Social Sharing Rail (Desktop vertical + Mobile bottom dock) */}
      <FloatingSocialShare
        title={translation.title}
        isHindi={isHindi}
      />

      {/* 2. Article Header with Breadcrumbs & Meta */}
      <div className="bg-white dark:bg-[#0b1329] border-b border-slate-200 dark:border-slate-800/80 pt-8 pb-12 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <button
              onClick={() => onNavigate(isHindi ? '/hi' : '/')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {isHindi ? 'होम' : 'Home'}
            </button>
            <span>/</span>
            {post.category && (
              <>
                <button
                  onClick={() => onNavigate(isHindi ? `/hi/category/${post.category?.translations[language].slug}` : `/category/${post.category?.translations.en.slug}`)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {post.category.translations[language]?.name}
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{translation.title}</span>
          </nav>

          {/* Bilingual Translation Switch Banner */}
          <div className="mb-6 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
              <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                {isHindi
                  ? 'यह लेख अंग्रेजी संस्करण में भी उपलब्ध है:'
                  : 'This article is also available in Hindi:'}
              </span>
            </div>
            <button
              onClick={() => onNavigate(otherPath)}
              className="px-3 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
            >
              {isHindi ? 'Read in English →' : 'हिन्दी में पढ़ें →'}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.18] mb-6 [text-wrap:balance]">
            {translation.title}
          </h1>

          {/* Deck / Excerpt */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6 max-w-3xl">
            {translation.excerpt}
          </p>

          {/* Placement: Below Article Title */}
          <div className="mb-6">
            <AdBanner placementId="article_title_below" onNavigate={onNavigate} />
          </div>

          {/* Author & Publication Details - Unboxed inline text */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <img
                src={normalizeImageUrl(post.author?.avatar_url, DEFAULT_AUTHOR_AVATAR)}
                alt={post.author?.full_name || 'Author'}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                }}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {post.author?.full_name || 'Aditya Sharma'}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {isHindi ? 'वरिष्ठ तकनीकी संपादक' : 'Senior Technology Editor'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{post.reading_time_minutes} {isHindi ? 'मिनट पढ़ने का समय' : 'min read'}</span>
              <span aria-hidden="true">·</span>
              <span>{post.views_count.toLocaleString()} {isHindi ? 'व्यूज़' : 'views'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Article Top Banner Ad */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AdBanner slotId="article_top" onNavigate={onNavigate} />
      </div>

      {/* 3. Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md">
          <img
            src={normalizeImageUrl(post.featured_image)}
            alt={post.image_alt || translation.title}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>
        {post.image_alt && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2.5 italic">
            {post.image_alt}
          </p>
        )}

        {/* Placement: Below Featured Image */}
        <div className="mt-4">
          <AdBanner placementId="article_image_below" onNavigate={onNavigate} />
        </div>
      </div>

      {/* 4. Reading Canvas & Sidebar Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Content Column (70%) */}
          <div className="lg:col-span-8">
            
            {/* Inline TOC on Mobile */}
            {toc.length > 0 && (
              <div className="lg:hidden p-5 bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 mb-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  {isHindi ? 'विषय सूची' : 'Table of Contents'}
                </div>
                <ul className="space-y-2 text-sm">
                  {toc.map(item => (
                    <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
                      <a
                        href={`#${item.id}`}
                        className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rich Article Prose Body with Dynamic In-Article Ad Injections */}
            <div 
              className="prose dark:prose-invert max-w-none prose-slate text-base sm:text-lg leading-relaxed
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:mb-5 prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-5 prose-li:mb-2
                prose-blockquote:border-l-0 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-[#0f172a] prose-blockquote:border prose-blockquote:border-slate-200 dark:prose-blockquote:border-slate-800 prose-blockquote:rounded-xl prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:italic
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              "
            >
              {contentParagraphs.length > 0 ? (
                contentParagraphs.map((paraHtml, pIdx) => {
                  const total = contentParagraphs.length;
                  const isFirstPara = pIdx === 0;
                  const isThirdPara = pIdx === 2 && total > 3;
                  const isMidPara = pIdx === Math.floor(total / 2) && pIdx !== 0 && pIdx !== total - 1;
                  const isBeforeConclusion = pIdx === total - 2 && pIdx > 1;

                  return (
                    <React.Fragment key={pIdx}>
                      <div dangerouslySetInnerHTML={{ __html: paraHtml }} />

                      {/* After First Paragraph Ad (Always shows on every blog post) */}
                      {isFirstPara && (
                        <div className="my-6 not-prose">
                          <AdBanner placementId="article_para_1" onNavigate={onNavigate} />
                        </div>
                      )}

                      {/* Middle of Article Content Ad */}
                      {isMidPara && (
                        <div className="my-6 not-prose">
                          <AdBanner placementId="article_mid_content" onNavigate={onNavigate} />
                        </div>
                      )}

                      {/* After Third Paragraph Ad */}
                      {isThirdPara && !isMidPara && (
                        <div className="my-6 not-prose">
                          <AdBanner placementId="article_para_3" onNavigate={onNavigate} />
                        </div>
                      )}

                      {/* Before Conclusion Ad */}
                      {isBeforeConclusion && !isMidPara && (
                        <div className="my-6 not-prose">
                          <AdBanner placementId="article_before_conclusion" onNavigate={onNavigate} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <>
                  <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                  <div className="my-6 not-prose">
                    <AdBanner placementId="article_mid_content" onNavigate={onNavigate} />
                  </div>
                </>
              )}
            </div>

            {/* After Article Content Ad */}
            <div className="my-8">
              <AdBanner placementId="article_after_content" onNavigate={onNavigate} />
            </div>

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 mt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {isHindi ? 'संबंधित टैग्स' : 'Related Tags'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span 
                      key={tag.id}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      onClick={() => onNavigate(isHindi ? `/hi/search?q=${tag.slug_hi}` : `/search?q=${tag.slug_en}`)}
                    >
                      #{isHindi ? tag.name_hi : tag.name_en}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Comments Section */}
            <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{isHindi ? `पाठकों की टिप्पणियां (${comments.length})` : `Reader Discussion (${comments.length})`}</span>
                </h3>
              </div>

              {/* Existing Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4 mb-10">
                  {comments.map(c => (
                    <div key={c.id} className="p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {c.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">
                  {isHindi
                    ? 'अभी तक कोई टिप्पणी नहीं है। पहले टिप्पणीकार बनें!'
                    : 'No comments yet. Start the conversation below!'}
                </p>
              )}

              {/* Leave a Comment Form */}
              <div className="bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  {isHindi ? 'अपनी राय साझा करें' : 'Leave a Comment'}
                </h4>
                {commentSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs">
                    {isHindi ? 'धन्यवाद! आपकी टिप्पणी सफलतापूर्वक जोड़ दी गई है।' : 'Thank you! Your comment has been posted.'}
                  </div>
                )}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {isHindi ? 'आपका नाम' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={commentName}
                        onChange={e => setCommentName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {isHindi ? 'ईमेल पता (गोपनीय रहेगा)' : 'Email Address (Private)'}
                      </label>
                      <input
                        type="email"
                        required
                        value={commentEmail}
                        onChange={e => setCommentEmail(e.target.value)}
                        placeholder="rajesh@example.com"
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'टिप्पणी' : 'Comment'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder={isHindi ? 'इस विषय पर अपने विचार साझा करें...' : 'Share your perspective or ask a question...'}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'टिप्पणी भेजें' : 'Post Comment'}</span>
                  </button>
                </form>
              </div>
            </section>

          </div>

          {/* Right Sticky Sidebar (30%) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Desktop Table of Contents */}
            {toc.length > 0 && (
              <div className="hidden lg:block bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{isHindi ? 'विषय सूची' : 'Table of Contents'}</span>
                </div>
                <nav className="space-y-2 text-xs">
                  {toc.map(item => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                        item.level === 3 ? 'pl-3' : 'font-medium'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Social Share & Action Bar */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isHindi ? 'शेयर करें' : 'Share Article'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-center"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="px-3 py-2 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors text-center"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-center"
                >
                  LinkedIn
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="w-full mt-3 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रिंट करें / PDF सेव करें' : 'Print / Save PDF'}</span>
              </button>
            </div>

            {/* Author Card */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                {isHindi ? 'लेखक के बारे में' : 'About the Author'}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={normalizeImageUrl(post.author?.avatar_url, DEFAULT_AUTHOR_AVATAR)}
                  alt={post.author?.full_name || 'Author'}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                  }}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {post.author?.full_name || 'Aditya Sharma'}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    {isHindi ? 'AI व SEO विशेषज्ञ' : 'AI & SEO Specialist'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {post.author?.bio || 'Covering enterprise AI architectures, search algorithms, and digital tools for technology practitioners.'}
              </p>
            </div>

            {/* Sticky Sidebar Rectangle Ad */}
            <div className="mt-6">
              <AdBanner slotId="article_sidebar" onNavigate={onNavigate} />
            </div>

          </aside>

        </div>
      </div>

      {/* 6. Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          {/* Related Articles Section Ad Placement */}
          <div className="mb-8">
            <AdBanner placementId="article_related_section" onNavigate={onNavigate} />
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
            {isHindi ? 'संबंधित लेख' : 'Related Articles'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(p => (
              <ArticleCard
                key={p.id}
                post={p}
                language={language}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

    </article>
  );
};
