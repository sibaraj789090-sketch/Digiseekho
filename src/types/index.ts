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
  social_links: {
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
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
