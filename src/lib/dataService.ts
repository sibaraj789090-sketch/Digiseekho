import {
  Post,
  Category,
  Tag,
  MediaItem,
  Comment,
  NewsletterSubscriber,
  SiteSettings,
  HomepageBanner,
  SocialMediaSettings,
  SocialPlatformConfig,
  NavigationItem,
  UserProfile,
  Language
} from '../types';
import { supabase, isSupabaseConfigured, getSupabaseClient } from './supabase';
import { INITIAL_AD_SETTINGS, adService } from './adService';
import { authService, AUTHORIZED_ADMIN_EMAIL } from './authService';

const STORAGE_KEYS = {
  POSTS: 'digiseekho_posts_v1',
  CATEGORIES: 'digiseekho_categories_v1',
  TAGS: 'digiseekho_tags_v1',
  MEDIA: 'digiseekho_media_v1',
  COMMENTS: 'digiseekho_comments_v1',
  SUBSCRIBERS: 'digiseekho_subscribers_v1',
  SETTINGS: 'digiseekho_settings_v1',
  NAVIGATION: 'digiseekho_navigation_v1',
  USER: 'digiseekho_admin_user_v2'
};

// Default Authorized Admin Profile
export const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-rajsiba',
  email: AUTHORIZED_ADMIN_EMAIL,
  full_name: 'Raj Siba',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'DigiSeekho Super Administrator & Editorial Lead.'
};

// Initial Categories (8 categories requested)
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    icon: 'Cpu',
    order_index: 1,
    translations: {
      en: {
        name: 'Artificial Intelligence',
        slug: 'artificial-intelligence',
        description: 'Explore neural networks, LLMs, breakthroughs, and the future of machine intelligence.'
      },
      hi: {
        name: 'आर्टिफिशियल इंटेलिजेंस',
        slug: 'artificial-intelligence',
        description: 'न्यूरल नेटवर्क, एलएलएम, नए नवाचार और कृत्रिम बुद्धिमत्ता के भविष्य को समझें।'
      }
    }
  },
  {
    id: 'cat-2',
    icon: 'Laptop',
    order_index: 2,
    translations: {
      en: {
        name: 'Technology',
        slug: 'technology',
        description: 'Deep dives into computing, developer ecosystems, gadgets, and software architecture.'
      },
      hi: {
        name: 'प्रौद्योगिकी',
        slug: 'technology',
        description: 'कंप्यूटिंग, सॉफ्टवेयर, आधुनिक गैजेट्स और तकनीकी विकास के विस्तृत लेख।'
      }
    }
  },
  {
    id: 'cat-3',
    icon: 'Wand2',
    order_index: 3,
    translations: {
      en: {
        name: 'AI Tools',
        slug: 'ai-tools',
        description: 'Hands-on reviews, prompt guides, and comparisons of the best AI tools.'
      },
      hi: {
        name: 'एआई टूल्स',
        slug: 'ai-tools',
        description: 'सर्वश्रेष्ठ एआई टूल्स के व्यावहारिक रिव्यू, प्रॉम्प्ट गाइड और तुलनात्मक विश्लेषण।'
      }
    }
  },
  {
    id: 'cat-4',
    icon: 'Search',
    order_index: 4,
    translations: {
      en: {
        name: 'Blogging & SEO',
        slug: 'blogging-seo',
        description: 'Organic Google search tactics, content marketing, technical SEO, and monetisation.'
      },
      hi: {
        name: 'ब्लॉगिंग और एसईओ',
        slug: 'blogging-seo',
        description: 'गूगल सर्च ऑर्गेनिक ट्रैफिक, कंटेंट मार्केटिंग, टेक्निकल एसईओ और ब्लॉगिंग तकनीकें।'
      }
    }
  },
  {
    id: 'cat-5',
    icon: 'GraduationCap',
    order_index: 5,
    translations: {
      en: {
        name: 'Digital Skills',
        slug: 'digital-skills',
        description: 'High-income digital capabilities: coding, prompt writing, analytics, and automation.'
      },
      hi: {
        name: 'डिजिटल स्किल्स',
        slug: 'digital-skills',
        description: 'उच्च मूल्य वाले डिजिटल कौशल: कोडिंग, प्रॉम्प्ट राइटिंग, डेटा और ऑटोमेशन।'
      }
    }
  },
  {
    id: 'cat-6',
    icon: 'Smartphone',
    order_index: 6,
    translations: {
      en: {
        name: 'Mobile & Apps',
        slug: 'mobile-apps',
        description: 'Essential mobile apps, Android/iOS optimization, and smartphone productivity.'
      },
      hi: {
        name: 'मोबाइल और ऐप्स',
        slug: 'mobile-apps',
        description: 'आवश्यक मोबाइल ऐप्स, एंड्रॉइड व आईओएस ट्रिक्स और स्मार्टफोन उत्पादकता टिप्स।'
      }
    }
  },
  {
    id: 'cat-7',
    icon: 'Globe',
    order_index: 7,
    translations: {
      en: {
        name: 'Internet Guides',
        slug: 'internet-guides',
        description: 'Practical how-to tutorials for modern web navigation, cloud storage, and networks.'
      },
      hi: {
        name: 'इंटरनेट गाइड्स',
        slug: 'internet-guides',
        description: 'इंटरनेट, क्लाउड स्टोरेज, होम वाई-फाई और ऑनलाइन सेवाओं के आसान ट्यूटोरियल।'
      }
    }
  },
  {
    id: 'cat-8',
    icon: 'ShieldCheck',
    order_index: 8,
    translations: {
      en: {
        name: 'Online Safety',
        slug: 'online-safety',
        description: 'Cybersecurity, scam prevention, two-factor authentication, and data privacy.'
      },
      hi: {
        name: 'ऑनलाइन सुरक्षा',
        slug: 'online-safety',
        description: 'साइबर सुरक्षा, ऑनलाइन फ्रॉड से बचाव, पासवर्ड सुरक्षा और डेटा गोपनीयता।'
      }
    }
  }
];

// Initial Tags
export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name_en: 'ChatGPT', name_hi: 'चैटजीपीटी', slug_en: 'chatgpt', slug_hi: 'chatgpt-hi' },
  { id: 'tag-2', name_en: 'Search Console', name_hi: 'सर्च कंसोल', slug_en: 'search-console', slug_hi: 'search-console-hi' },
  { id: 'tag-3', name_en: 'Artificial Intelligence', name_hi: 'एआई', slug_en: 'ai', slug_hi: 'ai-hi' },
  { id: 'tag-4', name_en: 'Cyber Security', name_hi: 'साइबर सुरक्षा', slug_en: 'cyber-security', slug_hi: 'cyber-security-hi' },
  { id: 'tag-5', name_en: 'Productivity', name_hi: 'उत्पादकता', slug_en: 'productivity', slug_hi: 'productivity-hi' },
  { id: 'tag-6', name_en: 'Google SEO', name_hi: 'गूगल एसईओ', slug_en: 'google-seo', slug_hi: 'google-seo-hi' },
  { id: 'tag-7', name_en: 'Prompt Engineering', name_hi: 'प्रॉम्प्ट इंजीनियरिंग', slug_en: 'prompt-engineering', slug_hi: 'prompt-engineering-hi' }
];

// Initial Articles with rich bilingual content
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-001',
    featured_image: '/src/assets/images/ai_tools_guide_1794037938005.jpg',
    image_alt: 'Laptop displaying AI assistant visualization on modern limestone desk',
    category_id: 'cat-3',
    author_id: DEFAULT_ADMIN.id,
    status: 'published',
    reading_time_minutes: 6,
    views_count: 14200,
    is_featured: true,
    is_trending: true,
    published_at: '2026-03-20T08:00:00Z',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-20T12:00:00Z',
    author: DEFAULT_ADMIN,
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[2], INITIAL_TAGS[6]],
    translations: {
      en: {
        title: 'The Ultimate Guide to ChatGPT and Prompt Engineering in 2026',
        slug: 'chatgpt-prompt-engineering-guide',
        excerpt: 'Mastering the latest prompt frameworks to boost coding, creative writing, and research workflows with modern large language models.',
        seo_title: 'ChatGPT Prompt Engineering Guide (2026) – DigiSeekho',
        meta_description: 'Master prompt engineering for ChatGPT and modern AI models with our step-by-step practical guide. Boost your output quality today.',
        focus_keyword: 'prompt engineering',
        content: `
<h2>Introduction: Why Prompt Engineering Still Matters</h2>
<p>As large language models continue to evolve with reasoning capabilities and autonomous agent frameworks, the precision with which we structure instructions determines whether you receive generic output or production-grade results.</p>
<p>In this guide, we break down actionable prompt engineering frameworks, role architectures, and contextual constraints tailored for developers, researchers, and content creators.</p>

<h2>The 4 Pillars of a High-Precision Prompt</h2>
<p>Every reliable prompt requires four fundamental components:</p>
<ul>
  <li><strong>Role & Persona:</strong> Establish the exact seniority and domain expertise (e.g., "Senior Software Architect with 15 years experience in distributed systems").</li>
  <li><strong>Contextual Background:</strong> Provide the data, constraints, and target audience before asking for output.</li>
  <li><strong>Task & Execution Steps:</strong> Step-by-step requirements rather than an open-ended question.</li>
  <li><strong>Output Format & Negative Constraints:</strong> Specify tables, JSON, markdown, and explicitly state what to avoid.</li>
</ul>

<h2>Step-by-Step Example: Contextual Reasoning</h2>
<p>Consider the difference between a weak prompt and a structured one:</p>
<blockquote>Weak: "Write an SEO meta description for my tech blog article about AI."</blockquote>
<blockquote>Structured: "Act as an experienced Google SEO specialist. Generate 3 distinct meta descriptions between 135 and 155 characters for an article targeting 'prompt engineering'. Include high CTR action words and do not exceed 160 characters."</blockquote>

<h2>Key Takeaways for Daily Workflows</h2>
<p>By treating the AI model as an intelligent collaborator rather than a magic search bar, you unlock exponential productivity across technical writing, data synthesis, and code generation.</p>
        `
      },
      hi: {
        title: 'ChatGPT और प्रॉम्प्ट इंजीनियरिंग: 2026 की संपूर्ण व्यावहारिक गाइड',
        slug: 'chatgpt-prompt-engineering-guide-hindi',
        excerpt: 'आधुनिक AI टूल्स और ChatGPT से बेहतरीन परिणाम पाने के लिए सही प्रॉम्प्ट लिखने के सिद्ध नियम और प्रैक्टिकल उदाहरण सीखें।',
        seo_title: 'ChatGPT प्रॉम्प्ट इंजीनियरिंग गाइड हिंदी में (2026) – DigiSeekho',
        meta_description: 'ChatGPT से सटीक और उच्च-गुणवत्ता वाले उत्तर पाने के लिए प्रॉम्प्ट इंजीनियरिंग के आसान और प्रभावी तरीके सीखें। DigiSeekho की गाइड।',
        focus_keyword: 'प्रॉम्प्ट इंजीनियरिंग',
        content: `
<h2>परिचय: प्रॉम्प्ट इंजीनियरिंग क्यों अनिवार्य कौशल है?</h2>
<p>आर्टिफिशियल इंटेलिजेंस के इस दौर में AI टूल्स का उपयोग केवल सर्च करने के लिए नहीं, बल्कि जटिल समस्याओं को हल करने, कोडिंग करने और शोध के लिए किया जा रहा है। आप AI को कैसे निर्देश देते हैं, इसी पर उसके परिणाम की गुणवत्ता निर्भर करती है।</p>
<p>इस गाइड में हम जानेंगे कि कैसे आप केवल कुछ बुनियादी नियमों को समझकर एक साधारण प्रॉम्प्ट को अत्यधिक शक्तिशाली बना सकते हैं।</p>

<h2>एक सटीक प्रॉम्प्ट के 4 मुख्य स्तंभ</h2>
<ul>
  <li><strong>भूमिका (Role):</strong> AI को स्पष्ट बताएं कि वह किस विशेषज्ञ की भूमिका में बात करे (उदा. "आप एक अनुभवी तकनीकी सलाहकार हैं")।</li>
  <li><strong>संदर्भ (Context):</strong> कार्य की पृष्ठभूमि और समस्या की पूरी जानकारी दें।</li>
  <li><strong>स्पष्ट निर्देश (Actionable Task):</strong> बिंदुवार बताएं कि आपको क्या चाहिए।</li>
  <li><strong>प्रारूप और सीमाएं (Output Constraints):</strong> शब्द सीमा, बुलेट पॉइंट्स या तालिका का स्पष्ट उल्लेख करें।</li>
</ul>

<h2>व्यावहारिक उदाहरण</h2>
<blockquote>कमजोर प्रॉम्प्ट: "मुझे ब्लॉग के लिए कुछ टिप्स दो।"</blockquote>
<blockquote>बेहतर प्रॉम्प्ट: "आप 10 साल के अनुभव वाले ब्लॉगिंग विशेषज्ञ हैं। नए ब्लॉगर्स के लिए Google SEO के 5 सबसे महत्वपूर्ण नियम आसान हिंदी में बुलेट पॉइंट्स में समझाएं।"</blockquote>

<h2>निष्कर्ष</h2>
<p>नियमित अभ्यास से आप AI से अपने मनचाहे और उच्च कोटि के परिणाम प्राप्त कर सकते हैं और अपने दैनिक कार्यों की गति को कई गुना बढ़ा सकते हैं।</p>
        `
      }
    }
  },
  {
    id: 'post-002',
    featured_image: '/src/assets/images/seo_growth_desk_1794037938420.jpg',
    image_alt: 'Top-down photo of digital marketer laptop showing organic search ranking analytics',
    category_id: 'cat-4',
    author_id: DEFAULT_ADMIN.id,
    status: 'published',
    reading_time_minutes: 8,
    views_count: 22800,
    is_featured: true,
    is_trending: true,
    published_at: '2026-03-22T09:30:00Z',
    created_at: '2026-03-21T11:00:00Z',
    updated_at: '2026-03-22T14:00:00Z',
    author: DEFAULT_ADMIN,
    tags: [INITIAL_TAGS[1], INITIAL_TAGS[5]],
    translations: {
      en: {
        title: 'Blogging in 2026: Proven SEO Strategies to Rank on Google Page 1',
        slug: 'blogging-seo-strategies-google-ranking',
        excerpt: 'How to adapt to AI Overviews, technical Core Web Vitals, and build topic authority that search engines consistently trust.',
        seo_title: 'Blogging SEO Strategies to Rank on Google in 2026 – DigiSeekho',
        meta_description: 'Discover proven SEO strategies for 2026 to increase organic Google traffic, master topic clusters, and outperform AI search summaries.',
        focus_keyword: 'SEO strategies',
        content: `
<h2>The Shift in Google Organic Search</h2>
<p>Search engines are no longer matching basic keywords; they are evaluating information gain, domain topical authority, and real first-hand experience (E-E-A-T).</p>
<p>If your article simply repeats the same top 10 search results, Google has no reason to rank it above existing summaries. Here is how you win in 2026.</p>

<h2>1. Build Comprehensive Topic Clusters</h2>
<p>Rather than publishing disconnected articles, create dedicated cornerstone hub pages linked bidirectionally to supporting guides. This signals true topic authority to search crawlers.</p>

<h2>2. Optimize for First-Party Information Gain</h2>
<p>Include original screenshots, real workflow tests, authentic code examples, and practical case studies. Articles containing authentic testing data receive preferential crawling and citation.</p>

<h2>3. Technical Health & Mobile Performance</h2>
<ul>
  <li>Fast Largest Contentful Paint (&lt; 1.8s)</li>
  <li>Zero Cumulative Layout Shift</li>
  <li>Structured Schema Markup (JSON-LD Article and Breadcrumbs)</li>
  <li>Clean canonical and hreflang tag parity across translations</li>
</ul>
        `
      },
      hi: {
        title: '2026 में ब्लॉगिंग: गूगल के पहले पेज पर रैंक करने के अचूक SEO तरीके',
        slug: 'blogging-seo-strategies-google-ranking-hindi',
        excerpt: 'गूगल सर्च के नए एल्गोरिदम और AI ओवरव्यूज के दौर में अपने ब्लॉग को नंबर 1 पोजीशन पर लाने की संपूर्ण कार्यप्रणाली।',
        seo_title: 'गूगल SEO रणनीति 2026: ब्लॉगिंग में नंबर 1 कैसे आएं – DigiSeekho',
        meta_description: '2026 में गूगल पर ऑर्गेनिक ट्रैफिक बढ़ाने और ब्लॉग को रैंक कराने के सबसे असरदार SEO तरीके सीखें। पढ़ें DigiSeekho की रिपोर्ट।',
        focus_keyword: 'SEO तरीके',
        content: `
<h2>गूगल सर्च का नया रूप: केवल कीवर्ड्स से काम नहीं चलेगा</h2>
<p>अब सर्च इंजन केवल कीवर्ड की संख्या नहीं देखते, बल्कि यह जांचते हैं कि आपके लेख में मौलिक जानकारी (Information Gain) और लेखक का वास्तविक अनुभव कितना है।</p>
<p>यदि आपका लेख केवल दूसरे ब्लॉग्स की नकल है, तो गूगल उसे उच्च रैंकिंग नहीं देगा। इसके लिए आपको निम्नलिखित रणनीतियों का पालन करना होगा।</p>

<h2>1. टॉपिक क्लस्टर (Topic Clusters) बनाएं</h2>
<p>अलग-अलग बिखरे हुए लेख लिखने के बजाय एक मुख्य विषय पर पिलर पोस्ट लिखें और उससे जुड़े सभी उप-विषयों पर सहायक लेख लिखकर आपस में इंटरलिंक करें।</p>

<h2>2. वास्तविक अनुभव और प्रमाण जोड़ें</h2>
<p>अपने लेखों में ओरिजिनल स्क्रीनशॉट्स, केस स्टडीज और व्यावहारिक अनुभव जोड़ें। गूगल का E-E-A-T (अनुभव, विशेषज्ञता, प्राधिकारिता, विश्वसनीयता) सिद्धांत इसी पर आधारित है।</p>

<h2>3. मोबाइल पर तीव्र गति और साफ डिजाइन</h2>
<p>अधिकांश भारतीय पाठक स्मार्टफोन पर पढ़ते हैं। इसलिए पेज का 2 सेकंड के भीतर लोड होना और साफ टाइपोग्राफी होना अनिवार्य है।</p>
        `
      }
    }
  },
  {
    id: 'post-003',
    featured_image: '/src/assets/images/cyber_safety_tech_1794037938549.jpg',
    image_alt: 'Smartphone and hardware security token on dark slate texture representing cyber safety',
    category_id: 'cat-8',
    author_id: DEFAULT_ADMIN.id,
    status: 'published',
    reading_time_minutes: 5,
    views_count: 9800,
    is_featured: false,
    is_trending: true,
    published_at: '2026-03-24T10:15:00Z',
    created_at: '2026-03-23T14:00:00Z',
    updated_at: '2026-03-24T10:15:00Z',
    author: DEFAULT_ADMIN,
    tags: [INITIAL_TAGS[3], INITIAL_TAGS[4]],
    translations: {
      en: {
        title: 'Essential Cyber Hygiene: Protecting Your Banking & Identity Online',
        slug: 'essential-cyber-hygiene-online-safety',
        excerpt: 'Crucial steps to secure your UPI transactions, configure hardware-based two-factor authentication, and avoid sophisticated social engineering scams.',
        seo_title: 'Cyber Hygiene & Online Safety Guide (2026) – DigiSeekho',
        meta_description: 'Protect your financial accounts and identity online with essential cyber safety steps, passkeys, and phishing defence strategies.',
        focus_keyword: 'online safety',
        content: `
<h2>Why Traditional Passwords Are No Longer Enough</h2>
<p>With large-scale credential stuffing attacks and automated phishing kits, relying on standard text passwords puts your personal banking and identity at risk.</p>
<p>Modern security requires layered defence: Passkeys, multi-factor authentication, and vigilant verification of incoming financial alerts.</p>

<h2>1. Switch to Passkeys Where Supported</h2>
<p>Passkeys rely on cryptographic public-key pairs stored securely on your device's secure enclave. They cannot be phished or leaked in third-party server breaches.</p>

<h2>2. Secure Your UPI & Mobile Banking Apps</h2>
<ul>
  <li>Never approve unexpected collect requests on Google Pay, PhonePe, or Paytm.</li>
  <li>Keep your device OS updated with latest security patches.</li>
  <li>Avoid public Wi-Fi without a trusted VPN when entering credentials.</li>
</ul>
        `
      },
      hi: {
        title: 'ऑनलाइन सुरक्षा और साइबर स्वच्छता: बैंकिंग और पहचान सुरक्षित रखने के नियम',
        slug: 'essential-cyber-hygiene-online-safety-hindi',
        excerpt: 'UPI धोखाधड़ी, फर्जी कॉल्स और डिजिटल फ्रॉड से बचने के लिए अपने स्मार्टफोन और खातों को सुरक्षित रखने की व्यावहारिक गाइड।',
        seo_title: 'ऑनलाइन सुरक्षा और साइबर फ्रॉड से बचाव की गाइड – DigiSeekho',
        meta_description: 'UPI और बैंक खातों को डिजिटल धोखाधड़ी से कैसे बचाएं? जानें साइबर सुरक्षा के सबसे जरूरी नियम DigiSeekho पर।',
        focus_keyword: 'ऑनलाइन सुरक्षा',
        content: `
<h2>डिजिटल दुनिया में सतर्कता ही सबसे बड़ा बचाव है</h2>
<p>आजकल बैंकिंग, बिल भुगतान और शॉपिंग सब कुछ मोबाइल से होता है। लेकिन इसके साथ ही साइबर ठगी के नए-नए तरीके भी सामने आ रहे हैं।</p>
<p>थोड़ी सी सावधानी और सही सेटिंग्स अपनाकर आप अपने पैसों और निजी डेटा को 100% सुरक्षित रख सकते हैं।</p>

<h2>1. UPI भुगतान में ध्यान रखने योग्य बातें</h2>
<ul>
  <li>पैसे प्राप्त करने के लिए कभी भी UPI पिन दर्ज नहीं करना पड़ता; पिन केवल पैसे भेजने के लिए होता है।</li>
  <li>किसी भी अनजान व्यक्ति के कहने पर 'AnyDesk' या 'TeamViewer' जैसी स्क्रीन शेयरिंग ऐप्स डाउनलोड न करें।</li>
  <li>अपने मुख्य बैंक खाते से अलग एक छोटा खाता UPI पेमेंट्स के लिए रखें।</li>
</ul>

<h2>2. टू-फैक्टर ऑथेंटिकेशन (2FA) चालू करें</h2>
<p>Google अकाउंट, WhatsApp और सोशल मीडिया पर हमेशा 2-स्टेप वेरिफिकेशन ऑन रखें ताकि पासवर्ड लीक होने पर भी कोई आपका खाता न खोल सके।</p>
        `
      }
    }
  },
  {
    id: 'post-004',
    featured_image: '/src/assets/images/hero_tech_editorial_1794037937726.jpg',
    image_alt: 'Laptop on clean desk with neural network model code on screen',
    category_id: 'cat-5',
    author_id: DEFAULT_ADMIN.id,
    status: 'published',
    reading_time_minutes: 7,
    views_count: 18400,
    is_featured: false,
    is_trending: false,
    published_at: '2026-03-25T11:00:00Z',
    created_at: '2026-03-24T16:00:00Z',
    updated_at: '2026-03-25T11:00:00Z',
    author: DEFAULT_ADMIN,
    tags: [INITIAL_TAGS[2], INITIAL_TAGS[4]],
    translations: {
      en: {
        title: 'High-Value Digital Skills to Learn in 2026 for Global Remote Careers',
        slug: 'high-value-digital-skills-remote-careers',
        excerpt: 'From workflow automation and API orchestration to technical writing and data analysis: skills that pay well and cannot be easily automated.',
        seo_title: 'Top Digital Skills for Remote Careers (2026) – DigiSeekho',
        meta_description: 'Explore the highest-paying digital skills in 2026. Learn how to build a global remote career with technical literacy and AI orchestration.',
        focus_keyword: 'digital skills',
        content: `
<h2>The Evolution of the Digital Workforce</h2>
<p>Routine tasks are increasingly handled by automated agents. The professionals thriving today are those who understand how to orchestrate systems, communicate clearly, and bridge technical problems with business goals.</p>

<h2>1. Workflow Automation & No-Code Systems</h2>
<p>Tools like Make, n8n, and custom webhooks allow small teams to execute what once required an entire engineering department. Building robust automations is one of the highest-demand remote services.</p>

<h2>2. Technical Writing & Documentation</h2>
<p>Clear, unambiguous written communication is the backbone of distributed global companies. Being able to explain complex architectures simply is a superpower.</p>
        `
      },
      hi: {
        title: '2026 में सीखें ये उच्च-मूल्य डिजिटल स्किल्स: घर बैठे करियर बनाने के मौके',
        slug: 'high-value-digital-skills-remote-careers-hindi',
        excerpt: 'ऑटोमेशन, डेटा विश्लेषण और आधुनिक तकनीकी कौशल सीखकर आप कैसे अंतरराष्ट्रीय स्तर पर फ्रीलांसिंग और रिमोट जॉब्स पा सकते हैं।',
        seo_title: '2026 की टॉप डिजिटल स्किल्स: घर बैठे कमाएं – DigiSeekho',
        meta_description: 'भविष्य की सबसे डिमांड वाली डिजिटल स्किल्स सीखें। कोडिंग, ऑटोमेशन और कंटेंट स्किल्स की विस्तृत गाइड DigiSeekho पर।',
        focus_keyword: 'डिजिटल स्किल्स',
        content: `
<h2>भविष्य का वर्कप्लेस: स्किल्स ही आपकी पहचान हैं</h2>
<p>पारंपरिक नौकरियों के साथ-साथ अब घर बैठे दुनिया भर की कंपनियों के साथ काम करने के अवसर तेजी से बढ़ रहे हैं। इसके लिए कॉलेज की डिग्री से ज्यादा आपके व्यावहारिक हुनर की कीमत है।</p>

<h2>1. नो-कोड ऑटोमेशन और सिस्टम इंटीग्रेशन</h2>
<p>बिना भारी कोडिंग के अलग-अलग सॉफ्टवेयर को आपस में जोड़ना और बिजनेस प्रक्रियाओं को ऑटोमेट करना आज एक अत्यधिक मांग वाला कौशल है।</p>

<h2>2. डेटा विश्लेषण और विज़ुअलाइज़ेशन</h2>
<p>डेटा से सही निष्कर्ष निकालना और उसे सरल चार्ट्स में प्रस्तुत करना हर कंपनी की जरूरत है। Power BI और Google Data Studio जैसे टूल्स सीखकर आप अपनी वैल्यू बढ़ा सकते हैं।</p>
        `
      }
    }
  }
];

// Initial Media Assets
export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Modern Tech Workspace Laptop',
    file_url: '/src/assets/images/hero_tech_editorial_1794037937726.jpg',
    file_name: 'hero_tech_editorial.jpg',
    file_size: 420000,
    mime_type: 'image/jpeg',
    alt_text: 'Editorial photograph of modern tech workspace with neural network model',
    created_at: '2026-03-20T10:00:00Z'
  },
  {
    id: 'med-2',
    title: 'AI Assistant Visualization',
    file_url: '/src/assets/images/ai_tools_guide_1794037938005.jpg',
    file_name: 'ai_tools_guide.jpg',
    file_size: 380000,
    mime_type: 'image/jpeg',
    alt_text: 'Sleek laptop showcasing AI assistant interface on travertine desk',
    created_at: '2026-03-20T10:05:00Z'
  },
  {
    id: 'med-3',
    title: 'SEO Ranking Workspace',
    file_url: '/src/assets/images/seo_growth_desk_1794037938420.jpg',
    file_name: 'seo_growth_desk.jpg',
    file_size: 450000,
    mime_type: 'image/jpeg',
    alt_text: 'Organic search ranking analytics laptop and notebook',
    created_at: '2026-03-21T09:00:00Z'
  },
  {
    id: 'med-4',
    title: 'Cyber Security & Passkey Concept',
    file_url: '/src/assets/images/cyber_safety_tech_1794037938549.jpg',
    file_name: 'cyber_safety_tech.jpg',
    file_size: 360000,
    mime_type: 'image/jpeg',
    alt_text: 'Smartphone and hardware security key on dark slate surface',
    created_at: '2026-03-22T08:00:00Z'
  }
];

// Initial Comments
export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    post_id: 'post-001',
    author_name: 'Rahul Verma',
    author_email: 'rahul.v@gmail.com',
    content: 'Very clear explanation of role architecture in prompt engineering! The comparison between weak and structured prompts helped me improve my daily output immediately.',
    status: 'approved',
    created_at: '2026-03-21T14:30:00Z'
  },
  {
    id: 'com-2',
    post_id: 'post-001',
    author_name: 'Pooja Nair',
    author_email: 'pooja.nair@techpulse.in',
    content: 'हिंदी में इतना बेहतरीन और व्यावहारिक लेख देखकर खुशी हुई। DigiSeekho की टीम को बहुत-बहुत बधाई!',
    status: 'approved',
    created_at: '2026-03-22T10:15:00Z'
  },
  {
    id: 'com-3',
    post_id: 'post-002',
    author_name: 'Suresh Patel',
    author_email: 'suresh@growthmarketer.co',
    content: 'The information gain section is spot on. Google has definitely started penalizing generic AI-rewritten articles without original experiments.',
    status: 'approved',
    created_at: '2026-03-23T16:20:00Z'
  }
];

// Initial Social Media Platforms
export const INITIAL_SOCIAL_MEDIA: SocialMediaSettings = {
  section_title_en: 'Follow DigiSeekho',
  section_title_hi: 'DigiSeekho को फॉलो करें',
  section_subtitle_en: 'Stay connected with us for the latest AI, Technology and Digital Updates.',
  section_subtitle_hi: 'नवीनतम एआई, तकनीक और डिजिटल अपडेट के लिए हमसे जुड़े रहें।',
  youtube: {
    url: 'https://youtube.com/@digiseekho',
    enabled: true,
    label: 'YouTube'
  },
  facebook: {
    url: 'https://facebook.com/digiseekho',
    enabled: true,
    label: 'Facebook'
  },
  instagram: {
    url: 'https://instagram.com/digiseekho',
    enabled: true,
    label: 'Instagram'
  },
  telegram: {
    url: 'https://t.me/digiseekho',
    enabled: true,
    label: 'Telegram'
  }
};

// Initial Site Settings
export const INITIAL_SETTINGS: SiteSettings = {
  website_name: 'DigiSeekho',
  tagline_en: 'Learn Technology. Discover AI. Grow Digitally.',
  tagline_hi: 'सीखें तकनीक. खोजें AI. बढ़ें डिजिटली.',
  logo_url: '',
  favicon_url: '',
  homepage_seo_title_en: 'DigiSeekho – Learn Technology. Discover AI. Grow Digitally.',
  homepage_seo_title_hi: 'DigiSeekho – तकनीक सीखें, AI खोजें, डिजिटली आगे बढ़ें',
  homepage_meta_description_en: 'India\'s premier bilingual publication for mastering Artificial Intelligence, modern digital skills, blogging, SEO, and practical tech guides.',
  homepage_meta_description_hi: 'आर्टिफिशियल इंटेलिजेंस, डिजिटल स्किल्स, ब्लॉगिंग और ऑनलाइन टेक्नोलॉजी सीखने का भारत का अग्रणी द्विभाषी प्लेटफॉर्म।',
  homepage_banner: {
    enabled: true,
    desktop_image_url: '/assets/aistudio/file_0000000058e88211828c5103c84bb209_aa3cdfea.png',
    mobile_image_url: '',
    alt_text: 'DigiSeekho – Learn Technology. Discover AI. Grow Digitally. Your Complete Tech Learning Hub',
    link_url: '',
    open_in_new_tab: false,
    updated_at: '2026-11-07T01:30:00Z'
  },
  social_media: INITIAL_SOCIAL_MEDIA,
  ads: INITIAL_AD_SETTINGS,
  social_links: {
    twitter: 'https://twitter.com/digiseekho',
    youtube: 'https://youtube.com/@digiseekho',
    linkedin: 'https://linkedin.com/company/digiseekho',
    github: 'https://github.com/digiseekho',
    facebook: 'https://facebook.com/digiseekho',
    instagram: 'https://instagram.com/digiseekho',
    telegram: 'https://t.me/digiseekho'
  },
  contact_email: 'contact@digiseekho.com',
  footer_text_en: '© 2026 DigiSeekho. All rights reserved. High quality bilingual tech journalism empowering readers across India and globally.',
  footer_text_hi: '© 2026 DigiSeekho. सर्वाधिकार सुरक्षित। भारत और विश्व भर के पाठकों को सशक्त बनाने वाला तकनीकी मंच।',
  site_url: 'https://digiseekho.com',
  ga4_id: 'G-DIGISEEKHO99',
  gsc_verification: 'google-site-verification=digiseekho-verification-token'
};

// Initial Navigation Items
export const INITIAL_NAVIGATION: NavigationItem[] = [
  { id: 'nav-1', location: 'header', title_en: 'Home', title_hi: 'होम', url_en: '/', url_hi: '/hi', order_index: 1, is_active: true },
  { id: 'nav-2', location: 'header', title_en: 'AI Tools', title_hi: 'एआई टूल्स', url_en: '/category/ai-tools', url_hi: '/hi/category/ai-tools', order_index: 2, is_active: true },
  { id: 'nav-3', location: 'header', title_en: 'Technology', title_hi: 'प्रौद्योगिकी', url_en: '/category/technology', url_hi: '/hi/category/technology', order_index: 3, is_active: true },
  { id: 'nav-4', location: 'header', title_en: 'Blogging & SEO', title_hi: 'ब्लॉगिंग और एसईओ', url_en: '/category/blogging-seo', url_hi: '/hi/category/blogging-seo', order_index: 4, is_active: true },
  { id: 'nav-5', location: 'header', title_en: 'Digital Guides', title_hi: 'डिजिटल गाइड्स', url_en: '/category/digital-skills', url_hi: '/hi/category/digital-skills', order_index: 5, is_active: true }
];

// Helper to get from LocalStorage with fallback
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

// Data Service Singleton
class DataService {
  private posts: Post[];
  private categories: Category[];
  private tags: Tag[];
  private media: MediaItem[];
  private comments: Comment[];
  private subscribers: NewsletterSubscriber[];
  private settings: SiteSettings;
  private navigation: NavigationItem[];
  private adminUser: UserProfile;

  constructor() {
    this.posts = loadStored(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    this.categories = loadStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.tags = loadStored(STORAGE_KEYS.TAGS, INITIAL_TAGS);
    this.media = loadStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    this.comments = loadStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    this.subscribers = loadStored(STORAGE_KEYS.SUBSCRIBERS, [
      { id: 'sub-1', email: 'anand.tech@gmail.com', language: 'en', is_active: true, subscribed_at: '2026-03-15T09:00:00Z' },
      { id: 'sub-2', email: 'priya.marketing@gmail.com', language: 'hi', is_active: true, subscribed_at: '2026-03-18T11:20:00Z' }
    ]);
    this.settings = loadStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!this.settings.homepage_banner) {
      this.settings.homepage_banner = INITIAL_SETTINGS.homepage_banner;
      saveStored(STORAGE_KEYS.SETTINGS, this.settings);
    }
    if (!this.settings.social_media) {
      this.settings.social_media = INITIAL_SOCIAL_MEDIA;
      saveStored(STORAGE_KEYS.SETTINGS, this.settings);
    }
    if (!this.settings.ads) {
      this.settings.ads = INITIAL_AD_SETTINGS;
      saveStored(STORAGE_KEYS.SETTINGS, this.settings);
    }
    this.navigation = loadStored(STORAGE_KEYS.NAVIGATION, INITIAL_NAVIGATION);
    this.adminUser = loadStored(STORAGE_KEYS.USER, DEFAULT_ADMIN);
  }

  // --- POSTS ---
  getPosts(options?: { language?: Language; categorySlug?: string; status?: string; search?: string }): Post[] {
    let result = [...this.posts];

    if (options?.status) {
      result = result.filter(p => p.status === options.status);
    }

    if (options?.categorySlug) {
      const category = this.categories.find(
        c => c.translations.en.slug === options.categorySlug || c.translations.hi.slug === options.categorySlug
      );
      if (category) {
        result = result.filter(p => p.category_id === category.id);
      }
    }

    if (options?.search) {
      const term = options.search.toLowerCase().trim();
      result = result.filter(p => {
        const enMatch = p.translations.en.title.toLowerCase().includes(term) ||
          p.translations.en.excerpt.toLowerCase().includes(term) ||
          (p.translations.en.focus_keyword && p.translations.en.focus_keyword.toLowerCase().includes(term));
        const hiMatch = p.translations.hi.title.toLowerCase().includes(term) ||
          p.translations.hi.excerpt.toLowerCase().includes(term) ||
          (p.translations.hi.focus_keyword && p.translations.hi.focus_keyword.toLowerCase().includes(term));
        return enMatch || hiMatch;
      });
    }

    return result.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
  }

  getPostBySlug(slug: string, lang: Language): { post: Post; translation: typeof INITIAL_POSTS[0]['translations']['en'] } | null {
    const post = this.posts.find(p => p.translations.en.slug === slug || p.translations.hi.slug === slug);
    if (!post) return null;
    return {
      post,
      translation: post.translations[lang] || post.translations.en
    };
  }

  getPostById(id: string): Post | null {
    return this.posts.find(p => p.id === id) || null;
  }

  savePost(postData: Partial<Post>): Post {
    if (!authService.isSessionValid()) {
      throw new Error('Access Denied: Only authorized administrator (rajsiba2005@gmail.com) can publish or edit posts.');
    }
    const now = new Date().toISOString();
    let post: Post;

    if (postData.id) {
      const index = this.posts.findIndex(p => p.id === postData.id);
      if (index !== -1) {
        post = {
          ...this.posts[index],
          ...postData,
          updated_at: now
        } as Post;
        this.posts[index] = post;
      } else {
        post = {
          ...postData,
          id: postData.id,
          created_at: now,
          updated_at: now
        } as Post;
        this.posts.unshift(post);
      }
    } else {
      post = {
        id: `post-${Date.now()}`,
        featured_image: postData.featured_image || '/src/assets/images/hero_tech_editorial_1794037937726.jpg',
        image_alt: postData.image_alt || '',
        category_id: postData.category_id || this.categories[0].id,
        author_id: this.adminUser.id,
        status: postData.status || 'draft',
        reading_time_minutes: postData.reading_time_minutes || 5,
        views_count: 0,
        is_featured: Boolean(postData.is_featured),
        is_trending: Boolean(postData.is_trending),
        published_at: postData.status === 'published' ? now : (postData.published_at || now),
        created_at: now,
        updated_at: now,
        author: this.adminUser,
        tags: postData.tags || [],
        translations: postData.translations || {
          en: {
            title: 'Untitled Article',
            slug: `untitled-article-${Date.now()}`,
            excerpt: '',
            content: '',
            focus_keyword: ''
          },
          hi: {
            title: 'शीर्षक रहित लेख',
            slug: `untitled-article-hi-${Date.now()}`,
            excerpt: '',
            content: '',
            focus_keyword: ''
          }
        }
      };
      this.posts.unshift(post);
    }

    saveStored(STORAGE_KEYS.POSTS, this.posts);
    return post;
  }

  deletePost(id: string): boolean {
    if (!authService.isSessionValid()) {
      throw new Error('Access Denied: Only authorized administrator (rajsiba2005@gmail.com) can delete posts.');
    }
    this.posts = this.posts.filter(p => p.id !== id);
    saveStored(STORAGE_KEYS.POSTS, this.posts);
    return true;
  }

  incrementViews(postId: string): void {
    const p = this.posts.find(item => item.id === postId);
    if (p) {
      p.views_count = (p.views_count || 0) + 1;
      saveStored(STORAGE_KEYS.POSTS, this.posts);
    }
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.order_index - b.order_index);
  }

  getCategoryBySlug(slug: string): Category | null {
    return this.categories.find(
      c => c.translations.en.slug === slug || c.translations.hi.slug === slug
    ) || null;
  }

  saveCategory(catData: Partial<Category>): Category {
    if (catData.id) {
      const idx = this.categories.findIndex(c => c.id === catData.id);
      if (idx !== -1) {
        this.categories[idx] = { ...this.categories[idx], ...catData } as Category;
        saveStored(STORAGE_KEYS.CATEGORIES, this.categories);
        return this.categories[idx];
      }
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      icon: catData.icon || 'Folder',
      order_index: this.categories.length + 1,
      translations: catData.translations || {
        en: { name: 'New Category', slug: `new-category-${Date.now()}`, description: '' },
        hi: { name: 'नई श्रेणी', slug: `new-category-hi-${Date.now()}`, description: '' }
      }
    };
    this.categories.push(newCat);
    saveStored(STORAGE_KEYS.CATEGORIES, this.categories);
    return newCat;
  }

  deleteCategory(id: string): boolean {
    this.categories = this.categories.filter(c => c.id !== id);
    saveStored(STORAGE_KEYS.CATEGORIES, this.categories);
    return true;
  }

  // --- TAGS ---
  getTags(): Tag[] {
    return [...this.tags];
  }

  saveTag(tagData: Partial<Tag>): Tag {
    if (tagData.id) {
      const idx = this.tags.findIndex(t => t.id === tagData.id);
      if (idx !== -1) {
        this.tags[idx] = { ...this.tags[idx], ...tagData } as Tag;
        saveStored(STORAGE_KEYS.TAGS, this.tags);
        return this.tags[idx];
      }
    }
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name_en: tagData.name_en || 'New Tag',
      name_hi: tagData.name_hi || 'नया टैग',
      slug_en: tagData.slug_en || `tag-${Date.now()}`,
      slug_hi: tagData.slug_hi || `tag-hi-${Date.now()}`
    };
    this.tags.push(newTag);
    saveStored(STORAGE_KEYS.TAGS, this.tags);
    return newTag;
  }

  // --- MEDIA ---
  getMedia(): MediaItem[] {
    return [...this.media];
  }

  addMedia(item: Omit<MediaItem, 'id' | 'created_at'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.media.unshift(newItem);
    saveStored(STORAGE_KEYS.MEDIA, this.media);
    return newItem;
  }

  deleteMedia(id: string): boolean {
    this.media = this.media.filter(m => m.id !== id);
    saveStored(STORAGE_KEYS.MEDIA, this.media);
    return true;
  }

  // --- COMMENTS ---
  getComments(postId?: string): Comment[] {
    if (postId) {
      return this.comments.filter(c => c.post_id === postId);
    }
    return [...this.comments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addComment(data: { postId: string; authorName: string; authorEmail: string; content: string }): Comment {
    const comment: Comment = {
      id: `com-${Date.now()}`,
      post_id: data.postId,
      author_name: data.authorName,
      author_email: data.authorEmail,
      content: data.content,
      status: 'approved', // auto-approve with moderation controls in admin
      created_at: new Date().toISOString()
    };
    this.comments.unshift(comment);
    saveStored(STORAGE_KEYS.COMMENTS, this.comments);
    return comment;
  }

  updateCommentStatus(id: string, status: 'approved' | 'pending' | 'rejected'): void {
    const c = this.comments.find(item => item.id === id);
    if (c) {
      c.status = status;
      saveStored(STORAGE_KEYS.COMMENTS, this.comments);
    }
  }

  deleteComment(id: string): boolean {
    this.comments = this.comments.filter(c => c.id !== id);
    saveStored(STORAGE_KEYS.COMMENTS, this.comments);
    return true;
  }

  // --- NEWSLETTER ---
  getSubscribers(): NewsletterSubscriber[] {
    return [...this.subscribers];
  }

  subscribe(email: string, language: Language = 'en'): { success: boolean; message: string } {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    const exists = this.subscribers.some(s => s.email.toLowerCase() === normalized);
    if (exists) {
      return { success: true, message: 'You are already subscribed to DigiSeekho!' };
    }
    this.subscribers.unshift({
      id: `sub-${Date.now()}`,
      email: normalized,
      language,
      is_active: true,
      subscribed_at: new Date().toISOString()
    });
    saveStored(STORAGE_KEYS.SUBSCRIBERS, this.subscribers);
    return { success: true, message: 'Thank you for subscribing to DigiSeekho!' };
  }

  unsubscribe(id: string): void {
    const sub = this.subscribers.find(s => s.id === id);
    if (sub) {
      sub.is_active = false;
      saveStored(STORAGE_KEYS.SUBSCRIBERS, this.subscribers);
    }
  }

  // --- SETTINGS ---
  getSettings(): SiteSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    this.settings = { ...this.settings, ...newSettings };
    saveStored(STORAGE_KEYS.SETTINGS, this.settings);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('digiseekho_settings_changed', { detail: this.settings }));
    }
    return this.settings;
  }

  getBanner(): HomepageBanner {
    return this.settings.homepage_banner || INITIAL_SETTINGS.homepage_banner!;
  }

  saveBanner(banner: HomepageBanner): HomepageBanner {
    const updatedBanner: HomepageBanner = {
      ...banner,
      updated_at: new Date().toISOString()
    };
    this.settings = {
      ...this.settings,
      homepage_banner: updatedBanner
    };
    saveStored(STORAGE_KEYS.SETTINGS, this.settings);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('digiseekho_settings_changed', { detail: this.settings }));
      window.dispatchEvent(new CustomEvent('digiseekho_banner_changed', { detail: updatedBanner }));
    }

    // Real-time synchronization to Supabase PostgreSQL database if connected
    const supabaseClient = getSupabaseClient();
    if (isSupabaseConfigured() && supabaseClient) {
      (async () => {
        try {
          const { error } = await supabaseClient
            .from('site_settings')
            .upsert({
              key: 'homepage_banner',
              value: updatedBanner,
              updated_at: new Date().toISOString()
            });
          if (error) {
            console.warn('Supabase site_settings sync notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase sync catch:', err?.message || err);
        }
      })();
    }

    return updatedBanner;
  }

  getSocialMedia(): SocialMediaSettings {
    return this.settings.social_media || INITIAL_SOCIAL_MEDIA;
  }

  saveSocialMedia(social: SocialMediaSettings): SocialMediaSettings {
    const updatedSocial: SocialMediaSettings = {
      ...social,
      updated_at: new Date().toISOString()
    };
    this.settings = {
      ...this.settings,
      social_media: updatedSocial,
      social_links: {
        ...this.settings.social_links,
        youtube: updatedSocial.youtube.url,
        facebook: updatedSocial.facebook.url,
        instagram: updatedSocial.instagram.url,
        telegram: updatedSocial.telegram.url
      }
    };
    saveStored(STORAGE_KEYS.SETTINGS, this.settings);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('digiseekho_settings_changed', { detail: this.settings }));
      window.dispatchEvent(new CustomEvent('digiseekho_social_changed', { detail: updatedSocial }));
    }

    // Sync to Supabase PostgreSQL database if connected
    const supabaseClient = getSupabaseClient();
    if (isSupabaseConfigured() && supabaseClient) {
      (async () => {
        try {
          const { error } = await supabaseClient
            .from('site_settings')
            .upsert({
              key: 'social_links',
              value: updatedSocial,
              updated_at: new Date().toISOString()
            });
          if (error) {
            console.warn('Supabase social_links sync notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase social sync catch:', err?.message || err);
        }
      })();
    }

    return updatedSocial;
  }

  // --- AD MANAGEMENT (DELEGATED TO ADSERVICE) ---
  getAds() {
    return adService.getSettings();
  }

  saveAds(ads: any) {
    return adService.saveSettings(ads);
  }

  // --- NAVIGATION ---
  getNavigation(): NavigationItem[] {
    return [...this.navigation].sort((a, b) => a.order_index - b.order_index);
  }

  saveNavigation(items: NavigationItem[]): void {
    this.navigation = [...items];
    saveStored(STORAGE_KEYS.NAVIGATION, this.navigation);
  }

  // --- AUTH / USER ---
  getAdminProfile(): UserProfile {
    return { ...this.adminUser };
  }

  updateAdminProfile(profile: Partial<UserProfile>): UserProfile {
    this.adminUser = { ...this.adminUser, ...profile };
    saveStored(STORAGE_KEYS.USER, this.adminUser);
    return this.adminUser;
  }
}

export const dataService = new DataService();
