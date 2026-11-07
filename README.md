# DigiSeekho – Bilingual Technology & AI Blogging Platform

> **Tagline:** Learn Technology. Discover AI. Grow Digitally.  
> **सीखें तकनीक. खोजें AI. बढ़ें डिजिटली.**  
> **Domain:** [digiseekho.com](https://digiseekho.com)  
> **Target Audience:** India & International Tech Readers  
> **Languages:** English (`en`) & Hindi (`hi`)

---

## 🚀 Overview

DigiSeekho is a complete, production-ready, full-stack bilingual technology blogging platform designed for superior Google organic search visibility, high performance, and effortless editorial management.

### Key Highlights
- **Full Bilingual Architecture**: Dedicated parallel URL hierarchies for English (`/blog/:slug`, `/category/:slug`) and Hindi (`/hi/blog/:slug`, `/hi/category/:slug`) with bidirectional language switcher and correct `hreflang` alternates (`en`, `hi`, `x-default`).
- **Editorial Technology Design**: Clean typography (Outfit display + Plus Jakarta Sans + Noto Sans Devanagari), modern dark navy prose, light/dark mode with optical compensation, zero-pill metadata discipline, and reading progress bars.
- **Supabase PostgreSQL & Auth Ready**: Complete 12-table database schema with Row Level Security (RLS) policies, indexes for slug and status queries, and dual-mode reactive local/cloud synchronization.
- **Advanced SEO Engine**: Real-time Google snippet preview, focus keyword density analysis, JSON-LD Schema (Organization, WebSite searchAction, BreadcrumbList, BlogPosting), dynamic `/sitemap.xml`, `/robots.txt`, and bilingual RSS 2.0 feeds.
- **Full-Featured Admin Dashboard** (`/admin`): Complete editorial control over posts, translations, categories, tags, media library, comments moderation, newsletter subscribers, SEO settings, and navigation menus.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (SPA with fast client router)
- **Styling**: Tailwind CSS v4 with dark mode variant
- **Icons**: Lucide Icons
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel ready + Cloud Run compatible

---

## 🗄️ Supabase Database Setup (12 Tables)

The complete SQL migration is located in `supabase/migrations/20250101_initial_schema.sql`.

### Tables Created:
1. `profiles`: Author profiles, avatars, roles (`admin`, `editor`, `author`).
2. `categories`: Topic taxonomy with ordering and icons.
3. `category_translations`: Bilingual names, slugs, and descriptions (`en`, `hi`).
4. `posts`: Core articles with status (`draft`, `published`, `scheduled`), views, reading times.
5. `post_translations`: Bilingual titles, slugs, excerpts, rich HTML content, SEO metadata.
6. `tags`: Reusable taxonomy tags with English and Hindi variants.
7. `post_tags`: Many-to-many relationships between articles and tags.
8. `media`: Media library assets with dimensions, MIME types, and alt text.
9. `comments`: Reader discussion entries with status moderation (`approved`, `pending`, `rejected`).
10. `newsletter_subscribers`: Subscriber list with language edition preference and active flags.
11. `site_settings`: Global configurations, social media profiles, and analytics IDs.
12. `navigation_items`: Customizable header and footer links.

### How to apply to your Supabase project:
1. Go to [supabase.com](https://supabase.com) and create a project.
2. In the Supabase Dashboard, open **SQL Editor**.
3. Copy the contents of `supabase/migrations/20250101_initial_schema.sql` and click **Run**.
4. In your `.env` file or in the **DigiSeekho Admin > Supabase Database** screen, enter your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 🔒 Admin Access & Authentication

- **Admin URL**: `/admin`
- **Default Test Admin Credentials**:
  - **Email**: `admin@digiseekho.com`
  - **Password**: `admin123`
  - Or click **One-Click Admin Demo Login** on the login page for instant access.

---

## 🌐 Bilingual URL Structure

| Page | English URL | Hindi URL |
|---|---|---|
| Homepage | `/` | `/hi` |
| Category Archive | `/category/ai-tools` | `/hi/category/ai-tools` |
| Article Page | `/blog/chatgpt-prompt-engineering-guide` | `/hi/blog/chatgpt-prompt-engineering-guide-hindi` |
| Search | `/search?q=...` | `/hi/search?q=...` |
| About Us | `/about` | `/hi/about` |
| Contact Us | `/contact` | `/hi/contact` |
| XML Sitemap | `/sitemap.xml` | Included with `hreflang` |
| Robots.txt | `/robots.txt` | Disallow admin, allow content |
| RSS Feed | `/rss.xml` | `/hi/rss.xml` |

---

## ☁️ Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon API Key.
   - `VITE_SITE_URL`: `https://digiseekho.com`
5. Click **Deploy**.
6. In Vercel Project Settings > **Domains**, add `digiseekho.com` and configure the CNAME / A records in your DNS provider.

---

## 📝 Editorial Guidelines

- Each article must be reviewed in both English and Hindi before switching status to **Published**.
- Use the **SEO Audit** panel in the post editor to verify keyword presence in Title, Description, and Subheadings.
- Keep image alt texts descriptive and focused on technical accuracy for accessibility.
