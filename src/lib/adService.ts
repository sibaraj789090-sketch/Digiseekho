import {
  AdNetwork,
  AdPlacement,
  AdUnit,
  AdEvent,
  AdSystemSettings,
  AdAnalyticsSummary
} from '../types';
import { supabase, isSupabaseConfigured, getSupabaseClient } from './supabase';
import { authService } from './authService';

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
    publisher_id: 'shameful-farm',
    header_code: `<script>
(function(myo){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = myo || {};
s.src = "\\/\\/shameful-farm.com\\/buXdVZs.dyGRlb0zYSWrcy\\/De\\/mE9_uxZfUWlgk\\/PeTgcb2\\/M\\/DqEl4\\/OlDWUFtdNNzbY\\/w\\/MNTWgz4\\/O\\/QS";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`,
    default_ad_code: `<script>
(function(myo){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = myo || {};
s.src = "\\/\\/shameful-farm.com\\/buXdVZs.dyGRlb0zYSWrcy\\/De\\/mE9_uxZfUWlgk\\/PeTgcb2\\/M\\/DqEl4\\/OlDWUFtdNNzbY\\/w\\/MNTWgz4\\/O\\/QS";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`,
    website_url: 'https://hilltopads.com',
    enabled: true,
    is_custom: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-11-07T20:12:00Z'
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

// User-provided ad codes
export const AD_CODE_728X90 = `<script>
  atOptions = {
    'key' : '975452282869e85e3ecb0ce9c0481ad8',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/975452282869e85e3ecb0ce9c0481ad8"></script>`;

export const AD_CODE_468X60 = `<script>
  atOptions = {
    'key' : '66fb27c1b80bb8362f0f63df6e6892c2',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/66fb27c1b80bb8362f0f63df6e6892c2"></script>`;

export const AD_CODE_160X600 = `<script>
  atOptions = {
    'key' : '0f4ff4bcb4fc84c6c62fa7b4b248e378',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/0f4ff4bcb4fc84c6c62fa7b4b248e378"></script>`;

export const AD_CODE_NATIVE = `<script async="async" data-cfasync="false" src="https://bauval.org/21/ae6aed7d96190fde7b38946cb1caf448"></script>
<div id="container-ae6aed7d96190fde7b38946cb1caf448"></div>`;

export const AD_CODE_POPUNDER = `<script data-cfasync="false" src="https://abscloud.org/1/0f311620061c320582c5f48edb2b8ab7"></script>`;

export const AD_CODE_SOCIALBAR = `<script data-cfasync="false" src="https://bauval.org/14/38962adaf86e4b9a1a55372f26cec354"></script>`;

// Initial Placements across Homepage, Article, Sidebar, Mobile, Desktop
export const INITIAL_PLACEMENTS: AdPlacement[] = [
  // --- HOMEPAGE PLACEMENTS ---
  {
    id: 'home_header_below',
    name: 'Homepage: Below Header',
    group: 'homepage',
    description: 'Prominent 728x90 Leaderboard directly below the top website header and navigation.',
    enabled: false, // Disabled per user request
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 1,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_banner_below',
    name: 'Homepage: Below Banner',
    group: 'homepage',
    description: 'Appears directly beneath the DigiSeekho Hero Banner, above category shortcuts.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 2,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_category_nav_below',
    name: 'Homepage: Below Category Navigation',
    group: 'homepage',
    description: 'Directly below the 5 Category Navigation Shortcuts, above Featured Editorial.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 3,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_featured_between',
    name: 'Homepage: Between Featured Editorial and Articles',
    group: 'homepage',
    description: 'Separates the hero featured editorial post from the Trending Guides section.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_NATIVE,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 4,
    dimensions_label: 'Native Container Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_cards_between',
    name: 'Homepage: Between Article Cards',
    group: 'homepage',
    description: 'Native responsive ad placed within the Latest Articles card grid.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 5,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_newsletter_above',
    name: 'Homepage: Above Newsletter Section',
    group: 'homepage',
    description: 'High CTR wide billboard directly preceding the newsletter / subscribe card.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 6,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'home_footer',
    name: 'Homepage: Footer Advertisement',
    group: 'homepage',
    description: 'Final banner position directly before the footer copyright strip.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 7,
    dimensions_label: '728x90 Footer Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },

  // --- ARTICLE PAGE PLACEMENTS ---
  {
    id: 'article_top',
    name: 'Article: Top Header Banner',
    group: 'article',
    description: 'Leaderboard banner at the very top of the article reading page.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 8,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_title_below',
    name: 'Article: Below Article Title',
    group: 'article',
    description: 'Header ad right after the headline and metadata deck.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 9,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_image_below',
    name: 'Article: Below Featured Image',
    group: 'article',
    description: 'Placed immediately below the post cover hero graphic.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_NATIVE,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 10,
    dimensions_label: 'Native Container Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_para_1',
    name: 'Article: After First Paragraph',
    group: 'article',
    description: 'Early in-reading hook. Captures initial visitor attention as they begin reading.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 11,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_para_3',
    name: 'Article: After Third Paragraph',
    group: 'article',
    description: 'Inserted after the 3rd paragraph. Ideal spot for responsive banner units.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 12,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_mid_content',
    name: 'Article: In the Middle of Content',
    group: 'article',
    description: 'Automatically placed at the halfway mark of the article text for highest time-on-page CTR.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_NATIVE,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 13,
    dimensions_label: 'Native Container Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_before_conclusion',
    name: 'Article: Before Conclusion',
    group: 'article',
    description: 'Appears directly before the final takeaways or concluding heading.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_468X60,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 14,
    dimensions_label: '468x60 Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_after_content',
    name: 'Article: After Article Content',
    group: 'article',
    description: 'At the end of prose text, directly before author bio, tags, and comments.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 15,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'article_related_section',
    name: 'Article: Related Articles Section',
    group: 'article',
    description: 'Directly above the 3-column Related Articles grid at the bottom of the page.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_NATIVE,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 16,
    dimensions_label: 'Native Container Banner',
    updated_at: '2026-11-08T02:22:00Z'
  },

  // --- SIDEBAR PLACEMENT ---
  {
    id: 'article_sidebar',
    name: 'Sidebar: Desktop Sticky Sidebar Unit',
    group: 'sidebar',
    description: 'Sticky 160x600 Wide Skyscraper banner in desktop right rail.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_160X600,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 17,
    dimensions_label: '160x600 Wide Skyscraper',
    updated_at: '2026-11-08T02:22:00Z'
  },

  // --- GENERAL ARCHIVES ---
  {
    id: 'category_top',
    name: 'Category & Search: Header Banner',
    group: 'general',
    description: 'Displayed at the top of category archives and search results.',
    enabled: true,
    network_id: 'custom',
    ad_type: 'code',
    code: AD_CODE_728X90,
    open_in_new_tab: true,
    device_visibility: 'all',
    display_order: 18,
    dimensions_label: '728x90 Leaderboard',
    updated_at: '2026-11-08T02:22:00Z'
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
  },
  {
    id: 'unit-hilltopads-banner',
    name: 'HilltopAds Site-wide Banner Code',
    network_id: 'hilltopads',
    format: 'leaderboard',
    code: `<script>
(function(myo){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = myo || {};
s.src = "\\/\\/shameful-farm.com\\/buXdVZs.dyGRlb0zYSWrcy\\/De\\/mE9_uxZfUWlgk\\/PeTgcb2\\/M\\/DqEl4\\/OlDWUFtdNNzbY\\/w\\/MNTWgz4\\/O\\/QS";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`,
    notes: 'Official HilltopAds banner tag configured for site-wide monetization',
    created_at: '2026-11-07T20:12:00Z'
  },
  {
    id: 'unit-hilltopads-multitag',
    name: 'HilltopAds MultiTag In-Page Ad Code',
    network_id: 'hilltopads',
    format: 'in_article',
    code: `<script>
(function(wtb){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = wtb || {};
s.src = "\\/\\/shameful-farm.com\\/b.XYVys\\/dSGTlQ0-Y\\/WNc_\\/yebmY9GunZgUal\\/kZPtTgcP2HMyD\\/EL4pNRj\\/EEtbNbzFY\\/wYM\\/TCgQ2\\/NxQ_";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`,
    notes: 'Official HilltopAds multi-tag script for site-wide in-page monetization',
    created_at: '2026-11-08T02:07:00Z'
  },
  {
    id: 'unit-leaderboard-728x90',
    name: '728x90 Leaderboard Banner (bauval.org)',
    network_id: 'custom',
    format: 'leaderboard',
    code: `<script>
  atOptions = {
    'key' : '975452282869e85e3ecb0ce9c0481ad8',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/975452282869e85e3ecb0ce9c0481ad8"></script>`,
    notes: 'Official 728x90 Leaderboard display banner from bauval.org',
    created_at: '2026-11-08T02:22:00Z'
  },
  {
    id: 'unit-banner-468x60',
    name: '468x60 Full Banner (bauval.org)',
    network_id: 'custom',
    format: 'leaderboard',
    code: `<script>
  atOptions = {
    'key' : '66fb27c1b80bb8362f0f63df6e6892c2',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/66fb27c1b80bb8362f0f63df6e6892c2"></script>`,
    notes: 'Official 468x60 Full Banner from bauval.org',
    created_at: '2026-11-08T02:21:00Z'
  },
  {
    id: 'unit-skyscraper-160x600',
    name: '160x600 Wide Skyscraper Banner (bauval.org)',
    network_id: 'custom',
    format: 'skyscraper',
    code: `<script>
  atOptions = {
    'key' : '0f4ff4bcb4fc84c6c62fa7b4b248e378',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/0f4ff4bcb4fc84c6c62fa7b4b248e378"></script>`,
    notes: 'Official 160x600 Wide Skyscraper sidebar unit from bauval.org',
    created_at: '2026-11-08T02:18:00Z'
  },
  {
    id: 'unit-native-container',
    name: 'Native Container Display Ad (bauval.org)',
    network_id: 'custom',
    format: 'in_article',
    code: `<script async="async" data-cfasync="false" src="https://bauval.org/21/ae6aed7d96190fde7b38946cb1caf448"></script>
<div id="container-ae6aed7d96190fde7b38946cb1caf448"></div>`,
    notes: 'Official responsive Native Container in-feed display unit from bauval.org',
    created_at: '2026-11-08T02:20:00Z'
  },
  {
    id: 'unit-popunder-abscloud',
    name: 'Site-wide Popunder Script (abscloud.org)',
    network_id: 'custom',
    format: 'popunder',
    code: `<script data-cfasync="false" src="https://abscloud.org/1/0f311620061c320582c5f48edb2b8ab7"></script>`,
    notes: 'Official site-wide popunder ad script from abscloud.org',
    created_at: '2026-11-08T02:20:00Z'
  },
  {
    id: 'unit-socialbar-bauval',
    name: 'Social Bar Interactive Ad (bauval.org)',
    network_id: 'custom',
    format: 'social_bar',
    code: `<script data-cfasync="false" src="https://bauval.org/14/38962adaf86e4b9a1a55372f26cec354"></script>`,
    notes: 'Official interactive Social Bar floating notification ad tag from bauval.org',
    created_at: '2026-11-08T02:24:00Z'
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
    hilltopads: true,
    monetag: false,
    custom: true
  },
  updated_at: '2026-11-07T20:12:00Z'
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

    // Auto-migrate HilltopAds official banner scripts
    const htaCode1 = `<script>
(function(myo){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = myo || {};
s.src = "\\/\\/shameful-farm.com\\/buXdVZs.dyGRlb0zYSWrcy\\/De\\/mE9_uxZfUWlgk\\/PeTgcb2\\/M\\/DqEl4\\/OlDWUFtdNNzbY\\/w\\/MNTWgz4\\/O\\/QS";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`;

    const htaCode2 = `<script>
(function(wtb){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = wtb || {};
s.src = "\\/\\/shameful-farm.com\\/b.XYVys\\/dSGTlQ0-Y\\/WNc_\\/yebmY9GunZgUal\\/kZPtTgcP2HMyD\\/EL4pNRj\\/EEtbNbzFY\\/wYM\\/TCgQ2\\/NxQ_";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`;

    const htaNet = this.networks.find(n => n.id === 'hilltopads');
    if (htaNet) {
      htaNet.enabled = true;
      htaNet.header_code = `${htaCode1}\n\n${htaCode2}`;
      htaNet.default_ad_code = htaCode2;
      htaNet.publisher_id = 'shameful-farm';
    }
    if (this.settings.network_toggles) {
      this.settings.network_toggles.hilltopads = true;
    }
    if (!this.units.some(u => u.id === 'unit-hilltopads-banner')) {
      this.units.unshift({
        id: 'unit-hilltopads-banner',
        name: 'HilltopAds Site-wide Banner Code',
        network_id: 'hilltopads',
        format: 'leaderboard',
        code: htaCode1,
        notes: 'Official HilltopAds banner tag configured for site-wide monetization',
        created_at: new Date().toISOString()
      });
    }
    if (!this.units.some(u => u.id === 'unit-hilltopads-multitag')) {
      this.units.unshift({
        id: 'unit-hilltopads-multitag',
        name: 'HilltopAds MultiTag In-Page Ad Code',
        network_id: 'hilltopads',
        format: 'in_article',
        code: htaCode2,
        notes: 'Official HilltopAds multi-tag script for site-wide in-page monetization',
        created_at: new Date().toISOString()
      });
    }

    // Auto-migrate Bauval.org and Abscloud ad units
    const code728x90 = `<script>
  atOptions = {
    'key' : '975452282869e85e3ecb0ce9c0481ad8',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/975452282869e85e3ecb0ce9c0481ad8"></script>`;

    const code468x60 = `<script>
  atOptions = {
    'key' : '66fb27c1b80bb8362f0f63df6e6892c2',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/66fb27c1b80bb8362f0f63df6e6892c2"></script>`;

    const code160x600 = `<script>
  atOptions = {
    'key' : '0f4ff4bcb4fc84c6c62fa7b4b248e378',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/0f4ff4bcb4fc84c6c62fa7b4b248e378"></script>`;

    const codeNativeContainer = `<script async="async" data-cfasync="false" src="https://bauval.org/21/ae6aed7d96190fde7b38946cb1caf448"></script>
<div id="container-ae6aed7d96190fde7b38946cb1caf448"></div>`;

    const codePopunder = `<script data-cfasync="false" src="https://abscloud.org/1/0f311620061c320582c5f48edb2b8ab7"></script>`;

    if (!this.units.some(u => u.id === 'unit-leaderboard-728x90')) {
      this.units.unshift({
        id: 'unit-leaderboard-728x90',
        name: '728x90 Leaderboard Banner (bauval.org)',
        network_id: 'custom',
        format: 'leaderboard',
        code: code728x90,
        notes: 'Official 728x90 Leaderboard display banner from bauval.org',
        created_at: new Date().toISOString()
      });
    }

    if (!this.units.some(u => u.id === 'unit-banner-468x60')) {
      this.units.unshift({
        id: 'unit-banner-468x60',
        name: '468x60 Full Banner (bauval.org)',
        network_id: 'custom',
        format: 'leaderboard',
        code: code468x60,
        notes: 'Official 468x60 Full Banner from bauval.org',
        created_at: new Date().toISOString()
      });
    }

    if (!this.units.some(u => u.id === 'unit-skyscraper-160x600')) {
      this.units.unshift({
        id: 'unit-skyscraper-160x600',
        name: '160x600 Wide Skyscraper Banner (bauval.org)',
        network_id: 'custom',
        format: 'skyscraper',
        code: code160x600,
        notes: 'Official 160x600 Wide Skyscraper sidebar unit from bauval.org',
        created_at: new Date().toISOString()
      });
    }

    if (!this.units.some(u => u.id === 'unit-native-container')) {
      this.units.unshift({
        id: 'unit-native-container',
        name: 'Native Container Display Ad (bauval.org)',
        network_id: 'custom',
        format: 'in_article',
        code: codeNativeContainer,
        notes: 'Official responsive Native Container in-feed display unit from bauval.org',
        created_at: new Date().toISOString()
      });
    }

    if (!this.units.some(u => u.id === 'unit-popunder-abscloud')) {
      this.units.unshift({
        id: 'unit-popunder-abscloud',
        name: 'Site-wide Popunder Script (abscloud.org)',
        network_id: 'custom',
        format: 'popunder',
        code: codePopunder,
        notes: 'Official site-wide popunder ad script from abscloud.org',
        created_at: new Date().toISOString()
      });
    }

    const codeSocialBar = `<script data-cfasync="false" src="https://bauval.org/14/38962adaf86e4b9a1a55372f26cec354"></script>`;

    if (!this.units.some(u => u.id === 'unit-socialbar-bauval')) {
      this.units.unshift({
        id: 'unit-socialbar-bauval',
        name: 'Social Bar Interactive Ad (bauval.org)',
        network_id: 'custom',
        format: 'social_bar',
        code: codeSocialBar,
        notes: 'Official interactive Social Bar floating notification ad tag from bauval.org',
        created_at: new Date().toISOString()
      });
    }

    // Auto-update ALL core placements with real active codes
    const setPlacementCode = (id: string, code: string, label: string) => {
      let p = this.placements.find(item => item.id === id);
      if (!p) {
        const initial = INITIAL_PLACEMENTS.find(item => item.id === id);
        if (initial) {
          p = { ...initial };
          this.placements.push(p);
        }
      }
      if (p) {
        p.enabled = true;
        p.network_id = 'custom';
        p.ad_type = 'code';
        p.code = code;
        p.dimensions_label = label;
        p.device_visibility = 'all';
      }
    };

    // Homepage slots
    setPlacementCode('home_header_below', AD_CODE_728X90, '728x90 Leaderboard');
    const pTopHdr = this.placements.find(item => item.id === 'home_header_below');
    if (pTopHdr) {
      pTopHdr.enabled = false;
    }
    setPlacementCode('home_banner_below', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('home_category_nav_below', AD_CODE_728X90, '728x90 Leaderboard');
    setPlacementCode('home_featured_between', AD_CODE_NATIVE, 'Native Container Banner');
    setPlacementCode('home_cards_between', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('home_newsletter_above', AD_CODE_728X90, '728x90 Leaderboard');
    setPlacementCode('home_footer', AD_CODE_728X90, '728x90 Footer Leaderboard');

    // Article slots
    setPlacementCode('article_top', AD_CODE_728X90, '728x90 Leaderboard');
    setPlacementCode('article_title_below', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('article_image_below', AD_CODE_NATIVE, 'Native Container Banner');
    setPlacementCode('article_para_1', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('article_para_3', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('article_mid_content', AD_CODE_NATIVE, 'Native Container Banner');
    setPlacementCode('article_before_conclusion', AD_CODE_468X60, '468x60 Banner');
    setPlacementCode('article_after_content', AD_CODE_728X90, '728x90 Leaderboard');
    setPlacementCode('article_sidebar', AD_CODE_160X600, '160x600 Wide Skyscraper');
    setPlacementCode('article_related_section', AD_CODE_NATIVE, 'Native Container Banner');

    // Category slot
    setPlacementCode('category_top', AD_CODE_728X90, '728x90 Leaderboard');

    saveStored(AD_STORAGE_KEYS.NETWORKS, this.networks);
    saveStored(AD_STORAGE_KEYS.SETTINGS, this.settings);
    saveStored(AD_STORAGE_KEYS.UNITS, this.units);
    saveStored(AD_STORAGE_KEYS.PLACEMENTS, this.placements);
  }

  // --- SETTINGS ---
  getSettings(): AdSystemSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: Partial<AdSystemSettings>): AdSystemSettings {
    if (!authService.isSessionValid()) {
      console.warn('Unauthorized: Session for rajsiba2005@gmail.com required to change ad settings.');
      return this.settings;
    }
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
