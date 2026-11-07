import { SEOData, Post, Category, Language } from '../types';
import { toAbsoluteImageUrl, normalizeImageUrl } from './imageUtils';

export const BASE_SITE_URL = (import.meta as any).env?.VITE_SITE_URL || 'https://digiseekho.com';

export function updatePageSEO(seo: SEOData) {
  // Update document title
  document.title = seo.title;

  // Helper for meta tags
  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper for link tags (canonical, alternate)
  const setLink = (rel: string, href: string, hreflang?: string) => {
    const selector = hreflang 
      ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
      : `link[rel="${rel}"]:not([hreflang])`;
    let el = document.querySelector(selector) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      if (hreflang) el.setAttribute('hreflang', hreflang);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // Standard Meta
  setMeta('name', 'description', seo.description);
  if (seo.focusKeyword) {
    setMeta('name', 'keywords', seo.focusKeyword);
  }

  // Canonical
  setLink('canonical', seo.canonicalUrl);

  // Hreflang alternates for Google SEO bilingual compliance
  setLink('alternate', seo.hreflangEn, 'en');
  setLink('alternate', seo.hreflangHi, 'hi');
  setLink('alternate', seo.hreflangEn, 'x-default');

  // OpenGraph
  setMeta('property', 'og:title', seo.title);
  setMeta('property', 'og:description', seo.description);
  setMeta('property', 'og:url', seo.canonicalUrl);
  setMeta('property', 'og:type', seo.type || 'website');
  setMeta('property', 'og:site_name', 'DigiSeekho');
  if (seo.ogImage) {
    const absoluteOgImage = toAbsoluteImageUrl(seo.ogImage);
    setMeta('property', 'og:image', absoluteOgImage);
  }

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', seo.title);
  setMeta('name', 'twitter:description', seo.description);
  if (seo.ogImage) {
    const absoluteOgImage = toAbsoluteImageUrl(seo.ogImage);
    setMeta('name', 'twitter:image', absoluteOgImage);
  }

  // JSON-LD Structured Data
  let ldJsonEl = document.querySelector('script[data-schema="digiseekho"]') as HTMLScriptElement | null;
  if (!ldJsonEl) {
    ldJsonEl = document.createElement('script');
    ldJsonEl.type = 'application/ld+json';
    ldJsonEl.setAttribute('data-schema', 'digiseekho');
    document.head.appendChild(ldJsonEl);
  }

  const structuredData: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DigiSeekho',
      url: BASE_SITE_URL,
      logo: `${BASE_SITE_URL}/logo.png`,
      sameAs: [
        'https://twitter.com/digiseekho',
        'https://linkedin.com/company/digiseekho',
        'https://youtube.com/@digiseekho'
      ],
      description: 'Learn Technology. Discover AI. Grow Digitally. India\'s premier bilingual tech publication.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: BASE_SITE_URL,
      name: 'DigiSeekho',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ];

  if (seo.type === 'article') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': seo.canonicalUrl
      },
      headline: seo.title,
      description: seo.description,
      image: seo.ogImage ? [toAbsoluteImageUrl(seo.ogImage)] : [],
      datePublished: seo.publishedTime || new Date().toISOString(),
      dateModified: seo.modifiedTime || seo.publishedTime || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: seo.author || 'DigiSeekho Editorial Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'DigiSeekho',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_SITE_URL}/logo.png`
        }
      },
      keywords: seo.focusKeyword,
      articleSection: seo.category || 'Technology'
    });
  }

  ldJsonEl.textContent = JSON.stringify(structuredData, null, 2);
}

// Focus Keyword Analysis for Post Publishing
export interface SEOAnalysisResult {
  score: number; // 0 - 100
  checks: {
    label: string;
    passed: boolean;
    recommendation: string;
  }[];
}

export function analyzeSEO(
  focusKeyword: string,
  title: string,
  description: string,
  slug: string,
  content: string
): SEOAnalysisResult {
  const kw = focusKeyword.trim().toLowerCase();
  if (!kw) {
    return {
      score: 30,
      checks: [
        {
          label: 'Focus Keyword',
          passed: false,
          recommendation: 'Enter a focus keyword to evaluate search optimization.'
        }
      ]
    };
  }

  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const slugLower = slug.toLowerCase();
  const contentLower = content.toLowerCase();

  const titleHasKw = titleLower.includes(kw);
  const titleLengthOk = title.length >= 35 && title.length <= 65;
  const descHasKw = descLower.includes(kw);
  const descLengthOk = description.length >= 110 && description.length <= 165;
  const slugHasKw = slugLower.includes(kw.replace(/\s+/g, '-'));

  // Calculate Keyword Density
  const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const kwMatches = (contentLower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const density = totalWords > 0 ? ((kwMatches / totalWords) * 100).toFixed(1) : '0';
  const densityNum = parseFloat(density);
  const densityOk = densityNum >= 0.8 && densityNum <= 3.0;

  // Headings check
  const hasH2WithKw = contentLower.includes('</h2>') && contentLower.includes(kw);

  const checks = [
    {
      label: 'Focus Keyword in Title',
      passed: titleHasKw,
      recommendation: titleHasKw ? 'Focus keyword is present in the SEO title.' : 'Include the exact focus keyword near the beginning of your title.'
    },
    {
      label: 'Title Length (35-65 characters)',
      passed: titleLengthOk,
      recommendation: titleLengthOk ? `Title length is ideal (${title.length} chars).` : `Current title is ${title.length} characters. Aim for 35-65 chars.`
    },
    {
      label: 'Focus Keyword in Meta Description',
      passed: descHasKw,
      recommendation: descHasKw ? 'Focus keyword is present in the description.' : 'Add your focus keyword to the meta description.'
    },
    {
      label: 'Meta Description Length (110-165 chars)',
      passed: descLengthOk,
      recommendation: descLengthOk ? `Description length is optimal (${description.length} chars).` : `Current description is ${description.length} chars. Aim for 120-160 chars.`
    },
    {
      label: 'Keyword in URL Slug',
      passed: slugHasKw,
      recommendation: slugHasKw ? 'Focus keyword appears in the URL slug.' : 'Include your main keyword in the URL slug.'
    },
    {
      label: `Keyword Density (${density}% - Target: 0.8% - 3.0%)`,
      passed: densityOk,
      recommendation: densityOk ? `Keyword density is healthy (${density}%).` : `Current density is ${density}%. Aim for between 0.8% and 3.0%.`
    },
    {
      label: 'Article Word Count (Minimum 300 words)',
      passed: totalWords >= 300,
      recommendation: totalWords >= 300 ? `Article length is good (${totalWords} words).` : `Short article (${totalWords} words). Target at least 300+ words for indexing.`
    },
    {
      label: 'Keyword in Subheadings (H2/H3)',
      passed: hasH2WithKw,
      recommendation: hasH2WithKw ? 'Focus keyword used in subheadings.' : 'Use your focus keyword or variation in an H2 subheading.'
    }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { score, checks };
}

// Generate XML Sitemap string
export function generateSitemapXML(posts: Post[], categories: Category[]): string {
  const publishedPosts = posts.filter(p => p.status === 'published');
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage English & Hindi -->
  <url>
    <loc>${BASE_SITE_URL}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi" />
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_SITE_URL}/hi</loc>
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/" />
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categories -->
`;

  categories.forEach(cat => {
    xml += `  <url>
    <loc>${BASE_SITE_URL}/category/${cat.translations.en.slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/category/${cat.translations.en.slug}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi/category/${cat.translations.hi.slug}" />
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_SITE_URL}/hi/category/${cat.translations.hi.slug}</loc>
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi/category/${cat.translations.hi.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/category/${cat.translations.en.slug}" />
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  xml += `  <!-- Published Articles -->
`;

  publishedPosts.forEach(post => {
    xml += `  <url>
    <loc>${BASE_SITE_URL}/blog/${post.translations.en.slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/blog/${post.translations.en.slug}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi/blog/${post.translations.hi.slug}" />
    <lastmod>${post.updated_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_SITE_URL}/hi/blog/${post.translations.hi.slug}</loc>
    <xhtml:link rel="alternate" hreflang="hi" href="${BASE_SITE_URL}/hi/blog/${post.translations.hi.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_SITE_URL}/blog/${post.translations.en.slug}" />
    <lastmod>${post.updated_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  xml += `</urlset>`;
  return xml;
}

// Generate RSS XML Feed
export function generateRSSXML(posts: Post[], lang: Language = 'en'): string {
  const published = posts.filter(p => p.status === 'published');
  const title = lang === 'hi' 
    ? 'DigiSeekho - तकनीक सीखें, AI खोजें, डिजिटली बढ़ें'
    : 'DigiSeekho - Learn Technology, Discover AI, Grow Digitally';
  const desc = lang === 'hi'
    ? 'DigiSeekho भारत का प्रमुख द्विभाषी तकनीकी प्रकाशन है।'
    : 'DigiSeekho is India\'s premier bilingual tech publication.';

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${BASE_SITE_URL}/${lang === 'hi' ? 'hi' : ''}</link>
    <description>${desc}</description>
    <language>${lang === 'hi' ? 'hi-IN' : 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_SITE_URL}/${lang === 'hi' ? 'hi/' : ''}rss.xml" rel="self" type="application/rss+xml" />
`;

  published.slice(0, 20).forEach(post => {
    const t = post.translations[lang];
    const link = `${BASE_SITE_URL}/${lang === 'hi' ? 'hi/' : ''}blog/${t.slug}`;
    rss += `    <item>
      <title><![CDATA[${t.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <description><![CDATA[${t.excerpt}]]></description>
    </item>
`;
  });

  rss += `  </channel>
</rss>`;
  return rss;
}

// Generate robots.txt
export function generateRobotsTxt(): string {
  return `# DigiSeekho robots.txt
# Optimized for Googlebot, Bingbot, and modern search crawlers

User-agent: *
Allow: /
Allow: /hi/
Allow: /blog/
Allow: /hi/blog/
Allow: /category/
Allow: /hi/category/

# Disallow admin dashboard and private preview views
Disallow: /admin
Disallow: /admin/*
Disallow: /api/

Sitemap: ${BASE_SITE_URL}/sitemap.xml
`;
}
