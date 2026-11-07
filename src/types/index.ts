export type Language = 'en' | 'hi';

export type UserRole = 'admin' | 'editor' | 'author';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
}

export interface CategoryTranslation {
  id?: string;
  category_id?: string;
  language?: Language;
  name: string;
  slug: string;
  description: string;
}

export interface Category {
  id: string;
  icon: string;
  order_index: number;
  translations: {
    en: CategoryTranslation;
    hi: CategoryTranslation;
  };
}

export interface Tag {
  id: string;
  name_en: string;
  name_hi: string;
  slug_en: string;
  slug_hi: string;
}

export interface PostTranslation {
  id?: string;
  post_id?: string;
  language?: Language;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  og_image?: string;
}

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface Post {
  id: string;
  featured_image: string;
  image_alt: string;
  category_id: string;
  author_id: string;
  status: PostStatus;
  reading_time_minutes: number;
  views_count: number;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
  category?: Category;
  tags: Tag[];
  translations: {
    en: PostTranslation;
    hi: PostTranslation;
  };
}

export interface MediaItem {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  alt_text: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: Language;
  is_active: boolean;
  subscribed_at: string;
}

export interface HomepageBanner {
  enabled: boolean;
  desktop_image_url: string;
  mobile_image_url?: string;
  alt_text: string;
  link_url?: string;
  open_in_new_tab?: boolean;
  updated_at?: string;
}

export interface SocialPlatformConfig {
  url: string;
  enabled: boolean;
  label?: string;
}

export interface SocialMediaSettings {
  section_title_en?: string;
  section_title_hi?: string;
  section_subtitle_en?: string;
  section_subtitle_hi?: string;
  youtube: SocialPlatformConfig;
  facebook: SocialPlatformConfig;
  instagram: SocialPlatformConfig;
  telegram: SocialPlatformConfig;
  updated_at?: string;
}

export type AdPlacementGroup = 'homepage' | 'article' | 'sidebar' | 'general';
export type AdDeviceVisibility = 'all' | 'desktop_only' | 'mobile_only';
export type AdType = 'custom_banner' | 'code';

export interface AdNetwork {
  id: string;
  name: string;
  slug: string;
  publisher_id?: string;
  header_code?: string;
  default_ad_code?: string;
  website_url?: string;
  enabled: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdPlacement {
  id: string;
  name: string;
  group: AdPlacementGroup;
  description: string;
  enabled: boolean;
  network_id: string; // 'adsense', 'adsterra', 'infolinks', 'hilltopads', 'monetag', 'custom', etc.
  ad_type: AdType;
  code?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  link_url?: string;
  alt_text?: string;
  open_in_new_tab?: boolean;
  device_visibility: AdDeviceVisibility;
  display_order: number;
  dimensions_label: string;
  updated_at: string;
}

export interface AdUnit {
  id: string;
  name: string;
  network_id: string;
  format: 'leaderboard' | 'rectangle' | 'billboard' | 'mobile_banner' | 'in_article' | 'responsive';
  code: string;
  notes?: string;
  created_at: string;
}

export interface AdEvent {
  id: string;
  placement_id: string;
  network_id: string;
  event_type: 'impression' | 'click';
  device: 'desktop' | 'mobile';
  created_at: string;
}

export interface AdSystemSettings {
  global_enabled: boolean;
  enable_desktop: boolean;
  enable_mobile: boolean;
  adsense_publisher_id?: string;
  auto_ads_enabled?: boolean;
  ad_label_en: string;
  ad_label_hi: string;
  network_toggles: Record<string, boolean>;
  updated_at: string;
}

export interface AdAnalyticsSummary {
  total_impressions: number;
  total_clicks: number;
  ctr: number;
  by_placement: Record<string, { impressions: number; clicks: number; ctr: number; name: string }>;
  by_network: Record<string, { impressions: number; clicks: number; ctr: number; name: string }>;
  by_device: {
    desktop: { impressions: number; clicks: number; ctr: number };
    mobile: { impressions: number; clicks: number; ctr: number };
  };
  recent_events: AdEvent[];
}

export interface SiteSettings {
  website_name: string;
  tagline_en: string;
  tagline_hi: string;
  logo_url?: string;
  favicon_url?: string;
  homepage_seo_title_en: string;
  homepage_seo_title_hi: string;
  homepage_meta_description_en: string;
  homepage_meta_description_hi: string;
  homepage_banner?: HomepageBanner;
  social_media?: SocialMediaSettings;
  ads?: AdSystemSettings;
  social_links: {
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  contact_email: string;
  footer_text_en: string;
  footer_text_hi: string;
  ga4_id?: string;
  gtm_id?: string;
  gsc_verification?: string;
  site_url: string;
}

export interface NavigationItem {
  id: string;
  location: 'header' | 'footer';
  title_en: string;
  title_hi: string;
  url_en: string;
  url_hi: string;
  order_index: number;
  is_active: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  canonicalUrl: string;
  hreflangEn: string;
  hreflangHi: string;
  ogImage?: string;
  focusKeyword?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article';
  category?: string;
}
