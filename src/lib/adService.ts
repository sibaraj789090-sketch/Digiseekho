import {
  AdNetwork,
  AdPlacement,
  AdUnit,
  AdEvent,
  AdSystemSettings,
  AdAnalyticsSummary
} from '../types';
import { supabase, isSupabaseConfigured, getSupabaseClient } from './supabase';

const AD_STORAGE_KEYS = {
  NETWORKS: 'digiseekho_ad_networks_v2',
  PLACEMENTS: 'digiseekho_ad_placements_v2',
  UNITS: 'digiseekho_ad_units_v2',
  SETTINGS: 'digiseekho_ad_settings_v2',
  EVENTS: 'digiseekho_ad_events_v2'
};

// Initial Ad Networks (User requested: Google AdSense, Adsterra, Infolinks, HilltopAds, Monetag, Custom)
export const INITIAL_NETWORKS: AdNetwork[] = [
  {
    id: 'adsense',
    name: 'Google AdSense',
    slug: 'google-adsense',
    publisher_id: 'ca-pub-9842104820194820',
    header_code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842104820194820" crossorigin="anonymous"></script>',
    default_ad_code: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9842104820194820" data-ad-slot="1029384756" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    website_url: 'https://adsense.google.com',
    enabled: true,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'adsterra',
    name: 'Adsterra',
    slug: 'adsterra',
    publisher_id: 'adt-849201',
    header_code: '<!-- Adsterra Native Header Script (Async) -->',
    default_ad_code: '<div id="adsterra-banner" class="adsterra-placement" data-zone="849201"></div>',
    website_url: 'https://adsterra.com',
    enabled: true,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'infolinks',
    name: 'Infolinks',
    slug: 'infolinks',
    publisher_id: 'infolinks-39201',
    header_code: '<script type="text/javascript"> var infolinks_pid = 39201; var infolinks_wsid = 0; </script>',
    default_ad_code: '<div id="infolinks-inarticle" class="infolinks-ad-unit"></div>',
    website_url: 'https://infolinks.com',
    enabled: false,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'hilltopads',
    name: 'HilltopAds',
    slug: 'hilltopads',
    publisher_id: 'hta-77291',
    header_code: '<!-- HilltopAds Safe Direct Header Tag -->',
    default_ad_code: '<div id="hta-display-banner" data-hta-id="77291"></div>',
    website_url: 'https://hilltopads.com',
    enabled: false,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'monetag',
    name: 'Monetag',
    slug: 'monetag',
    publisher_id: 'monetag-11928',
    header_code: '<!-- Monetag MultiTag (Clean Ads Only) -->',
    default_ad_code: '<div id="monetag-inpage-unit" data-zone="11928"></div>',
    website_url: 'https://monetag.com',
    enabled: false,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'custom',
    name: 'Custom Direct Advertisers & Affiliates',
    slug: 'custom-advertisers',
    publisher_id: 'digiseekho-direct',
    header_code: '',
    default_ad_code: '',
    website_url: 'https://digiseekho.com',
    enabled: true,
    is_custom: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T03:00:00Z'
  }
];

// Initial Placements across Homepage, Article, Sidebar, Mobile, Desktop
export const INITIAL_PLACEMENTS: AdPlacement[] = [
  // --- HOMEPAGE PLACEMENTS ---
  {
    id: 'home_header_below',
    name: 'Homepage: Below Header',
    group: 'homepage',
    description: 'Prominent 728x90 Leaderboard directly below the top website header and navigation.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=180&q=80',
    link_url: '/category/ai-tools',
    alt_text: 'DigiSeekho AI & Cloud Learning Hub',
    open_in_new_tab: false,
    device_visibility: 'desktop_only',
    display_order: 1,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_banner_below',
    name: 'Homepage: Below Banner',
    group: 'homepage',
    description: 'Appears directly beneath the DigiSeekho Hero Banner, above category shortcuts.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=180&q=80',
    link_url: '/category/technology',
    alt_text: 'Software Dev Architecture & AI Masterclass',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 2,
    dimensions_label: '728x90 / 970x120 Banner',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_category_nav_below',
    name: 'Homepage: Below Category Navigation',
    group: 'homepage',
    description: 'Directly below the 5 Category Navigation Shortcuts, above Featured Editorial.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=200&q=80',
    link_url: '/category/blogging-seo',
    alt_text: 'Google SEO Strategies & Web Monetization',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 3,
    dimensions_label: '728x90 / Responsive',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_featured_between',
    name: 'Homepage: Between Featured Editorial and Articles',
    group: 'homepage',
    description: 'Separates the hero featured editorial post from the Trending Guides section.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=220&q=80',
    link_url: '/category/ai-tools',
    alt_text: 'Discover Next-Gen Prompt Engineering Workflows',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 4,
    dimensions_label: '970x120 or 728x90 Responsive In-Feed',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_cards_between',
    name: 'Homepage: Between Article Cards',
    group: 'homepage',
    description: 'Native responsive ad placed within the Latest Articles card grid.',
    enabled: true,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&h=200&q=80',
    link_url: '/category/digital-skills',
    alt_text: 'Learn High-Income Tech Skills in 2026',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 5,
    dimensions_label: '728x90 / Native Feed Card',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_newsletter_above',
    name: 'Homepage: Above Newsletter Section',
    group: 'homepage',
    description: 'High CTR wide billboard directly preceding the newsletter / subscribe card.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=260&q=80',
    link_url: 'https://digiseekho.com',
    alt_text: 'DigiSeekho Pro Technology Masterclass - Enroll Free',
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 6,
    dimensions_label: '970x250 Billboard / Responsive',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'home_footer',
    name: 'Homepage: Footer Advertisement',
    group: 'homepage',
    description: 'Final banner position directly before the footer copyright strip.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&h=180&q=80',
    link_url: 'https://digiseekho.com',
    alt_text: 'DigiSeekho Global Technology News',
    open_in_new_tab: true,
    device_visibility: 'desktop_only',
    display_order: 7,
    dimensions_label: '728x90 Footer Leaderboard',
    updated_at: '2026-11-07T03:00:00Z'
  },

  // --- ARTICLE PAGE PLACEMENTS ---
  {
    id: 'article_title_below',
    name: 'Article: Below Article Title',
    group: 'article',
    description: 'Header ad right after the headline and metadata deck.',
    enabled: true,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&h=180&q=80',
    link_url: '/category/technology',
    alt_text: 'Enterprise Cloud & AI Architecture Tools',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 8,
    dimensions_label: '728x90 / Responsive Top Banner',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_image_below',
    name: 'Article: Below Featured Image',
    group: 'article',
    description: 'Placed immediately below the post cover hero graphic.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&h=180&q=80',
    link_url: '/category/ai-tools',
    alt_text: 'Curated Artificial Intelligence Tool Directory',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 9,
    dimensions_label: '728x90 Banner',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_para_1',
    name: 'Article: After First Paragraph',
    group: 'article',
    description: 'Early in-reading hook. Captures initial visitor attention as they begin reading.',
    enabled: true,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=260&q=80',
    link_url: '/category/blogging-seo',
    alt_text: 'Google Organic Ranking & SEO Guide',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 10,
    dimensions_label: '336x280 Large Rectangle / In-Article',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_para_3',
    name: 'Article: After Third Paragraph',
    group: 'article',
    description: 'Inserted after the 3rd paragraph. Ideal spot for AdSense in-article responsive units.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=260&q=80',
    link_url: '/category/technology',
    alt_text: 'Tech Tools & Frameworks',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 11,
    dimensions_label: 'In-Article Fluid / 300x250',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_mid_content',
    name: 'Article: In the Middle of Content',
    group: 'article',
    description: 'Automatically placed at the halfway mark of the article text for highest time-on-page CTR.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=280&q=80',
    link_url: '/category/digital-skills',
    alt_text: 'Upgrade Digital & Coding Skills',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 12,
    dimensions_label: '336x280 / Responsive Content Ad',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_before_conclusion',
    name: 'Article: Before Conclusion',
    group: 'article',
    description: 'Appears directly before the final takeaways or concluding heading.',
    enabled: false,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&h=240&q=80',
    link_url: '/category/ai-tools',
    alt_text: 'Top Generative AI Applications',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 13,
    dimensions_label: '300x250 or 728x90',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_after_content',
    name: 'Article: After Article Content',
    group: 'article',
    description: 'At the end of prose text, directly before author bio, tags, and comments.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&h=220&q=80',
    link_url: 'https://digiseekho.com',
    alt_text: 'Stay Connected with DigiSeekho Insights',
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 14,
    dimensions_label: '728x90 Responsive Banner',
    updated_at: '2026-11-07T03:00:00Z'
  },
  {
    id: 'article_related_section',
    name: 'Article: Related Articles Section',
    group: 'article',
    description: 'Directly above the 3-column Related Articles grid at the bottom of the page.',
    enabled: true,
    network_id: 'adsense',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&h=180&q=80',
    link_url: '/category/technology',
    alt_text: 'Recommended Technology Stacks & Tools',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 15,
    dimensions_label: '728x90 / Matched Content',
    updated_at: '2026-11-07T03:00:00Z'
  },

  // --- SIDEBAR PLACEMENT ---
  {
    id: 'article_sidebar',
    name: 'Sidebar: Desktop Sticky Sidebar Unit',
    group: 'sidebar',
    description: 'Sticky 300x250 Medium Rectangle or 300x600 Half-Page banner in desktop right rail.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&h=300&q=80',
    link_url: '/category/ai-tools',
    alt_text: 'DigiSeekho AI & Cloud Pro Certifications',
    open_in_new_tab: false,
    device_visibility: 'desktop_only',
    display_order: 16,
    dimensions_label: '300x250 Medium Rectangle',
    updated_at: '2026-11-07T03:00:00Z'
  },

  // --- GENERAL ARCHIVES ---
  {
    id: 'category_top',
    name: 'Category & Search: Header Banner',
    group: 'general',
    description: 'Displayed at the top of category archives and search results.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'custom_banner',
    desktop_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&h=200&q=80',
    link_url: '/category/technology',
    alt_text: 'Top Rated Tools for Tech Creators & Bloggers',
    open_in_new_tab: false,
    device_visibility: 'all',
    display_order: 17,
    dimensions_label: '728x90 Leaderboard / Responsive',
    updated_at: '2026-11-07T03:00:00Z'
  }
];

// Initial Reusable Ad Units (Ad Codes)
export const INITIAL_AD_UNITS: AdUnit[] = [
  {
    id: 'unit-adsense-leaderboard',
    name: 'AdSense Responsive Leaderboard (728x90)',
    network_id: 'adsense',
    format: 'leaderboard',
    code: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9842104820194820" data-ad-slot="1029384756" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    notes: 'Default responsive leaderboard for header and in-feed positions',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'unit-adsense-rectangle',
    name: 'AdSense Medium Rectangle (300x250)',
    network_id: 'adsense',
    format: 'rectangle',
    code: '<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-9842104820194820" data-ad-slot="2938475610"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    notes: 'Sticky sidebar and desktop right column unit',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'unit-adsense-inarticle',
    name: 'AdSense Fluid In-Article Native Unit',
    network_id: 'adsense',
    format: 'in_article',
    code: '<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-9842104820194820" data-ad-slot="3847561029"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    notes: 'Automatically matches font and styling of DigiSeekho articles',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'unit-adsterra-banner',
    name: 'Adsterra 728x90 Display Banner',
    network_id: 'adsterra',
    format: 'leaderboard',
    code: '<div class="adsterra-unit" style="min-height:90px;display:flex;align-items:center;justify-content:center"><span style="font-size:11px;color:#888;">[Adsterra Network 728x90 Unit]</span></div>',
    notes: 'Secondary monetization network',
    created_at: '2026-01-01T00:00:00Z'
  }
];

// Initial Global Settings
export const INITIAL_AD_SETTINGS: AdSystemSettings = {
  global_enabled: true,
  enable_desktop: true,
  enable_mobile: true,
  adsense_publisher_id: 'ca-pub-9842104820194820',
  auto_ads_enabled: false,
  ad_label_en: 'Advertisement',
  ad_label_hi: 'विज्ञापन',
  network_toggles: {
    adsense: true,
    adsterra: true,
    infolinks: false,
    hilltopads: false,
    monetag: false,
    custom: true
  },
  updated_at: '2026-11-07T03:00:00Z'
};

// Seed sample real analytics events (last 48 hours)
export const INITIAL_AD_EVENTS: AdEvent[] = [
  { id: 'ev-1', placement_id: 'home_newsletter_above', network_id: 'custom', event_type: 'impression', device: 'desktop', created_at: '2026-11-07T01:10:00Z' },
  { id: 'ev-2', placement_id: 'home_newsletter_above', network_id: 'custom', event_type: 'impression', device: 'mobile', created_at: '2026-11-07T01:15:00Z' },
  { id: 'ev-3', placement_id: 'home_newsletter_above', network_id: 'custom', event_type: 'click', device: 'desktop', created_at: '2026-11-07T01:18:00Z' },
  { id: 'ev-4', placement_id: 'article_title_below', network_id: 'adsense', event_type: 'impression', device: 'desktop', created_at: '2026-11-07T01:30:00Z' },
  { id: 'ev-5', placement_id: 'article_title_below', network_id: 'adsense', event_type: 'click', device: 'mobile', created_at: '2026-11-07T01:35:00Z' },
  { id: 'ev-6', placement_id: 'article_mid_content', network_id: 'custom', event_type: 'impression', device: 'mobile', created_at: '2026-11-07T02:00:00Z' },
  { id: 'ev-7', placement_id: 'article_sidebar', network_id: 'custom', event_type: 'impression', device: 'desktop', created_at: '2026-11-07T02:15:00Z' },
  { id: 'ev-8', placement_id: 'article_sidebar', network_id: 'custom', event_type: 'click', device: 'desktop', created_at: '2026-11-07T02:20:00Z' }
];

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

class AdService {
  private networks: AdNetwork[];
  private placements: AdPlacement[];
  private units: AdUnit[];
  private settings: AdSystemSettings;
  private events: AdEvent[];

  constructor() {
    this.networks = loadStored(AD_STORAGE_KEYS.NETWORKS, INITIAL_NETWORKS);
    this.placements = loadStored(AD_STORAGE_KEYS.PLACEMENTS, INITIAL_PLACEMENTS);
    this.units = loadStored(AD_STORAGE_KEYS.UNITS, INITIAL_AD_UNITS);
    this.settings = loadStored(AD_STORAGE_KEYS.SETTINGS, INITIAL_AD_SETTINGS);
    this.events = loadStored(AD_STORAGE_KEYS.EVENTS, INITIAL_AD_EVENTS);
  }

  // --- SETTINGS ---
  getSettings(): AdSystemSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: Partial<AdSystemSettings>): AdSystemSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
      updated_at: new Date().toISOString()
    };
    saveStored(AD_STORAGE_KEYS.SETTINGS, this.settings);
    this.notifyChange();
    this.syncToSupabase('ad_settings', this.settings);
    return this.settings;
  }

  // --- NETWORKS ---
  getNetworks(): AdNetwork[] {
    return [...this.networks];
  }

  getNetworkById(id: string): AdNetwork | undefined {
    return this.networks.find(n => n.id === id);
  }

  saveNetwork(network: Partial<AdNetwork> & { name: string }): AdNetwork {
    const now = new Date().toISOString();
    let updated: AdNetwork;

    if (network.id && this.networks.some(n => n.id === network.id)) {
      this.networks = this.networks.map(n => {
        if (n.id === network.id) {
          updated = { ...n, ...network, updated_at: now };
          return updated;
        }
        return n;
      });
    } else {
      const slug = network.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      updated = {
        id: network.id || `net-${Date.now()}`,
        name: network.name,
        slug,
        publisher_id: network.publisher_id || '',
        header_code: network.header_code || '',
        default_ad_code: network.default_ad_code || '',
        website_url: network.website_url || '',
        enabled: network.enabled ?? true,
        is_custom: true,
        created_at: now,
        updated_at: now
      };
      this.networks.push(updated);
    }

    saveStored(AD_STORAGE_KEYS.NETWORKS, this.networks);
    this.notifyChange();
    this.syncToSupabase('ad_networks', this.networks);
    return updated!;
  }

  deleteNetwork(id: string): boolean {
    const target = this.networks.find(n => n.id === id);
    if (!target) return false;
    this.networks = this.networks.filter(n => n.id !== id);
    saveStored(AD_STORAGE_KEYS.NETWORKS, this.networks);
    this.notifyChange();
    this.syncToSupabase('ad_networks', this.networks);
    return true;
  }

  // --- PLACEMENTS ---
  getPlacements(filter?: { group?: string; device?: 'desktop' | 'mobile' }): AdPlacement[] {
    let result = [...this.placements];
    if (filter?.group) {
      result = result.filter(p => p.group === filter.group);
    }
    if (filter?.device) {
      result = result.filter(p => p.device_visibility === 'all' || p.device_visibility === `${filter.device}_only`);
    }
    return result.sort((a, b) => a.display_order - b.display_order);
  }

  getPlacementById(id: string): AdPlacement | undefined {
    return this.placements.find(p => p.id === id);
  }

  savePlacement(placement: AdPlacement): AdPlacement {
    const updated: AdPlacement = {
      ...placement,
      updated_at: new Date().toISOString()
    };
    this.placements = this.placements.map(p => (p.id === updated.id ? updated : p));
    if (!this.placements.some(p => p.id === updated.id)) {
      this.placements.push(updated);
    }
    saveStored(AD_STORAGE_KEYS.PLACEMENTS, this.placements);
    this.notifyChange();
    this.syncToSupabase('ad_placements', this.placements);
    return updated;
  }

  togglePlacement(id: string, enabled?: boolean): boolean {
    const p = this.placements.find(item => item.id === id);
    if (!p) return false;
    p.enabled = enabled !== undefined ? enabled : !p.enabled;
    p.updated_at = new Date().toISOString();
    saveStored(AD_STORAGE_KEYS.PLACEMENTS, this.placements);
    this.notifyChange();
    this.syncToSupabase('ad_placements', this.placements);
    return p.enabled;
  }

  // --- AD UNITS (REUSABLE CODES) ---
  getUnits(): AdUnit[] {
    return [...this.units];
  }

  saveUnit(unit: Partial<AdUnit> & { name: string; network_id: string; code: string; format: any }): AdUnit {
    let saved: AdUnit;
    if (unit.id && this.units.some(u => u.id === unit.id)) {
      this.units = this.units.map(u => {
        if (u.id === unit.id) {
          saved = { ...u, ...unit };
          return saved;
        }
        return u;
      });
    } else {
      saved = {
        id: `unit-${Date.now()}`,
        name: unit.name,
        network_id: unit.network_id,
        format: unit.format || 'responsive',
        code: unit.code,
        notes: unit.notes || '',
        created_at: new Date().toISOString()
      };
      this.units.unshift(saved);
    }
    saveStored(AD_STORAGE_KEYS.UNITS, this.units);
    this.notifyChange();
    this.syncToSupabase('ad_units', this.units);
    return saved!;
  }

  deleteUnit(id: string): boolean {
    this.units = this.units.filter(u => u.id !== id);
    saveStored(AD_STORAGE_KEYS.UNITS, this.units);
    this.notifyChange();
    this.syncToSupabase('ad_units', this.units);
    return true;
  }

  // --- ANALYTICS & EVENT TRACKING ---
  recordEvent(placementId: string, eventType: 'impression' | 'click', device: 'desktop' | 'mobile' = 'desktop'): void {
    const placement = this.getPlacementById(placementId);
    const networkId = placement?.network_id || 'custom';

    const event: AdEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      placement_id: placementId,
      network_id: networkId,
      event_type: eventType,
      device,
      created_at: new Date().toISOString()
    };

    this.events.unshift(event);
    if (this.events.length > 500) {
      this.events = this.events.slice(0, 500);
    }
    saveStored(AD_STORAGE_KEYS.EVENTS, this.events);

    // Sync event to Supabase ad_events table
    const client = getSupabaseClient();
    if (isSupabaseConfigured() && client) {
      (async () => {
        try {
          await client.from('ad_events').insert({
            placement_id: placementId,
            network_id: networkId,
            event_type: eventType,
            device,
            created_at: event.created_at
          });
        } catch (e) {
          // Non-blocking telemetry
        }
      })();
    }
  }

  getAnalytics(): AdAnalyticsSummary {
    const totalImpressions = this.events.filter(e => e.event_type === 'impression').length;
    const totalClicks = this.events.filter(e => e.event_type === 'click').length;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const byPlacement: Record<string, { impressions: number; clicks: number; ctr: number; name: string }> = {};
    const byNetwork: Record<string, { impressions: number; clicks: number; ctr: number; name: string }> = {};
    const byDevice = {
      desktop: { impressions: 0, clicks: 0, ctr: 0 },
      mobile: { impressions: 0, clicks: 0, ctr: 0 }
    };

    // Initialize placements
    for (const p of this.placements) {
      byPlacement[p.id] = { impressions: 0, clicks: 0, ctr: 0, name: p.name };
    }
    // Initialize networks
    for (const n of this.networks) {
      byNetwork[n.id] = { impressions: 0, clicks: 0, ctr: 0, name: n.name };
    }

    for (const ev of this.events) {
      // By Placement
      if (!byPlacement[ev.placement_id]) {
        byPlacement[ev.placement_id] = { impressions: 0, clicks: 0, ctr: 0, name: ev.placement_id };
      }
      if (ev.event_type === 'impression') {
        byPlacement[ev.placement_id].impressions++;
      } else {
        byPlacement[ev.placement_id].clicks++;
      }

      // By Network
      if (!byNetwork[ev.network_id]) {
        byNetwork[ev.network_id] = { impressions: 0, clicks: 0, ctr: 0, name: ev.network_id };
      }
      if (ev.event_type === 'impression') {
        byNetwork[ev.network_id].impressions++;
      } else {
        byNetwork[ev.network_id].clicks++;
      }

      // By Device
      if (ev.device === 'mobile') {
        if (ev.event_type === 'impression') byDevice.mobile.impressions++;
        else byDevice.mobile.clicks++;
      } else {
        if (ev.event_type === 'impression') byDevice.desktop.impressions++;
        else byDevice.desktop.clicks++;
      }
    }

    // Calculate CTRs
    for (const key of Object.keys(byPlacement)) {
      const item = byPlacement[key];
      item.ctr = item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0;
    }
    for (const key of Object.keys(byNetwork)) {
      const item = byNetwork[key];
      item.ctr = item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0;
    }
    byDevice.desktop.ctr = byDevice.desktop.impressions > 0 ? (byDevice.desktop.clicks / byDevice.desktop.impressions) * 100 : 0;
    byDevice.mobile.ctr = byDevice.mobile.impressions > 0 ? (byDevice.mobile.clicks / byDevice.mobile.impressions) * 100 : 0;

    return {
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      ctr,
      by_placement: byPlacement,
      by_network: byNetwork,
      by_device: byDevice,
      recent_events: this.events.slice(0, 20)
    };
  }

  // --- SUPABASE SYNC ---
  private syncToSupabase(table: string, payload: any) {
    const client = getSupabaseClient();
    if (isSupabaseConfigured() && client) {
      (async () => {
        try {
          await client.from('site_settings').upsert({
            key: `ads_${table}`,
            value: payload,
            updated_at: new Date().toISOString()
          });
        } catch (err: any) {
          console.warn(`Supabase sync warning for ${table}:`, err?.message || err);
        }
      })();
    }
  }

  private notifyChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('digiseekho_ad_system_changed', {
        detail: {
          settings: this.settings,
          placements: this.placements,
          networks: this.networks
        }
      }));
    }
  }

  // Generate Supabase SQL Setup Migration Script
  getSupabaseSQLSchema(): string {
    return `-- ========================================================
-- DIGISEEKHO ADVERTISING MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Migration: 20261107_ad_management_system.sql
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ad Networks Table
CREATE TABLE IF NOT EXISTS public.ad_networks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  publisher_id TEXT,
  header_code TEXT,
  default_ad_code TEXT,
  website_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ad Units Library (Reusable Snippets & Creatives)
CREATE TABLE IF NOT EXISTS public.ad_units (
  id TEXT PRIMARY KEY DEFAULT ('unit-' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  network_id TEXT NOT NULL REFERENCES public.ad_networks(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'responsive' CHECK (
    format IN ('leaderboard', 'banner', 'rectangle', 'large_rectangle', 'half_page', 'in_article', 'native', 'responsive')
  ),
  code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ad Placements Table
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL CHECK (group_name IN ('homepage', 'article', 'sidebar', 'general', 'custom')),
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  network_id TEXT REFERENCES public.ad_networks(id) ON DELETE SET NULL,
  ad_unit_id TEXT REFERENCES public.ad_units(id) ON DELETE SET NULL,
  ad_type TEXT NOT NULL DEFAULT 'custom_banner' CHECK (ad_type IN ('custom_banner', 'network_unit', 'raw_code', 'adsense_auto')),
  code TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  link_url TEXT,
  alt_text TEXT,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT true,
  device_visibility TEXT NOT NULL DEFAULT 'all' CHECK (device_visibility IN ('all', 'desktop_only', 'mobile_only')),
  display_order INT NOT NULL DEFAULT 0,
  dimensions_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ad Analytics Events (Impressions & Clicks)
CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id TEXT NOT NULL REFERENCES public.ad_placements(id) ON DELETE CASCADE,
  network_id TEXT REFERENCES public.ad_networks(id) ON DELETE SET NULL,
  ad_unit_id TEXT REFERENCES public.ad_units(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  device TEXT NOT NULL CHECK (device IN ('desktop', 'mobile', 'tablet')),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Ad Settings (Global Configuration)
CREATE TABLE IF NOT EXISTS public.ad_settings (
  key TEXT PRIMARY KEY DEFAULT 'global_config',
  global_enabled BOOLEAN NOT NULL DEFAULT true,
  enable_desktop BOOLEAN NOT NULL DEFAULT true,
  enable_mobile BOOLEAN NOT NULL DEFAULT true,
  adsense_publisher_id TEXT,
  auto_ads_enabled BOOLEAN NOT NULL DEFAULT false,
  ad_label_en TEXT NOT NULL DEFAULT 'Advertisement',
  ad_label_hi TEXT NOT NULL DEFAULT 'विज्ञापन',
  network_toggles JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ad_networks_enabled ON public.ad_networks(enabled);
CREATE INDEX IF NOT EXISTS idx_ad_units_network_id ON public.ad_units(network_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_network_id ON public.ad_placements(network_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_ad_unit_id ON public.ad_placements(ad_unit_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_group ON public.ad_placements(group_name, display_order);
CREATE INDEX IF NOT EXISTS idx_ad_events_placement ON public.ad_events(placement_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON public.ad_events(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.ad_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can view active ad networks" ON public.ad_networks FOR SELECT USING (true);
CREATE POLICY "Public can view active ad units" ON public.ad_units FOR SELECT USING (true);
CREATE POLICY "Public can view active ad placements" ON public.ad_placements FOR SELECT USING (true);
CREATE POLICY "Public can view ad settings" ON public.ad_settings FOR SELECT USING (true);

-- Public Telemetry Write Policy
CREATE POLICY "Public can record ad events" ON public.ad_events FOR INSERT WITH CHECK (true);

-- Authenticated Admin Policies (Full Access)
CREATE POLICY "Admins have full access to ad_networks" ON public.ad_networks FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to ad_units" ON public.ad_units FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to ad_placements" ON public.ad_placements FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to ad_events" ON public.ad_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to ad_settings" ON public.ad_settings FOR ALL TO authenticated USING (true);
`;
  }
}

export const adService = new AdService();
