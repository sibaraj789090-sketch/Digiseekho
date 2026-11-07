import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Post, Language } from '../../types';
import { useApp } from '../../context/AppContext';
import { analyzeSEO } from '../../lib/seo';
import { TiptapEditor } from '../../components/editor/TiptapEditor';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Globe, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Code
} from 'lucide-react';

interface AdminPostEditorProps {
  postId?: string;
  onSelectSection: (section: string) => void;
}

export const AdminPostEditor: React.FC<AdminPostEditorProps> = ({ postId, onSelectSection }) => {
  const { showToast } = useApp();
  const categories = dataService.getCategories();
  const tagsList = dataService.getTags();
  const mediaList = dataService.getMedia();

  // Active translation tab in editor
  const [activeTab, setActiveTab] = useState<Language>('en');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Load existing post or initialize blank draft
  const existingPost = postId ? dataService.getPostById(postId) : null;

  // Form State
  const [categoryId, setCategoryId] = useState(existingPost?.category_id || categories[0]?.id || '');
  const [featuredImage, setFeaturedImage] = useState(existingPost?.featured_image || mediaList[0]?.file_url || '');
  const [imageAlt, setImageAlt] = useState(existingPost?.image_alt || '');
  const [status, setStatus] = useState<Post['status']>(existingPost?.status || 'published');
  const [readingTime, setReadingTime] = useState(existingPost?.reading_time_minutes || 5);
  const [isFeatured, setIsFeatured] = useState(existingPost?.is_featured || false);
  const [isTrending, setIsTrending] = useState(existingPost?.is_trending || false);

  // English State
  const [titleEn, setTitleEn] = useState(existingPost?.translations.en.title || '');
  const [slugEn, setSlugEn] = useState(existingPost?.translations.en.slug || '');
  const [excerptEn, setExcerptEn] = useState(existingPost?.translations.en.excerpt || '');
  const [contentEn, setContentEn] = useState(existingPost?.translations.en.content || '');
  const [seoTitleEn, setSeoTitleEn] = useState(existingPost?.translations.en.seo_title || '');
  const [metaDescEn, setMetaDescEn] = useState(existingPost?.translations.en.meta_description || '');
  const [focusKeywordEn, setFocusKeywordEn] = useState(existingPost?.translations.en.focus_keyword || '');

  // Hindi State
  const [titleHi, setTitleHi] = useState(existingPost?.translations.hi.title || '');
  const [slugHi, setSlugHi] = useState(existingPost?.translations.hi.slug || '');
  const [excerptHi, setExcerptHi] = useState(existingPost?.translations.hi.excerpt || '');
  const [contentHi, setContentHi] = useState(existingPost?.translations.hi.content || '');
  const [seoTitleHi, setSeoTitleHi] = useState(existingPost?.translations.hi.seo_title || '');
  const [metaDescHi, setMetaDescHi] = useState(existingPost?.translations.hi.meta_description || '');
  const [focusKeywordHi, setFocusKeywordHi] = useState(existingPost?.translations.hi.focus_keyword || '');

  // Auto generate slugs from titles if empty
  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    if (!existingPost && !slugEn) {
      setSlugEn(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleTitleHiChange = (val: string) => {
    setTitleHi(val);
    if (!existingPost && !slugHi) {
      setSlugHi(val.trim().replace(/\s+/g, '-').toLowerCase());
    }
  };

  // SEO Analysis for active tab
  const activeFocusKeyword = activeTab === 'en' ? focusKeywordEn : focusKeywordHi;
  const activeTitle = activeTab === 'en' ? (seoTitleEn || titleEn) : (seoTitleHi || titleHi);
  const activeDesc = activeTab === 'en' ? (metaDescEn || excerptEn) : (metaDescHi || excerptHi);
  const activeSlug = activeTab === 'en' ? slugEn : slugHi;
  const activeContent = activeTab === 'en' ? contentEn : contentHi;

  const seoResult = analyzeSEO(activeFocusKeyword, activeTitle, activeDesc, activeSlug, activeContent);

  // Content formatting toolbar helpers
  const insertFormatting = (tag: 'h2' | 'h3' | 'p' | 'ul' | 'quote' | 'code' | 'table') => {
    const isEn = activeTab === 'en';
    const current = isEn ? contentEn : contentHi;
    const setter = isEn ? setContentEn : setContentHi;

    let snippet = '';
    switch (tag) {
      case 'h2':
        snippet = `\n<h2>${isEn ? 'Section Subheading' : 'अनुभाग उपशीर्षक'}</h2>\n<p>${isEn ? 'Paragraph explanation here...' : 'यहाँ विवरण लिखें...'}</p>\n`;
        break;
      case 'h3':
        snippet = `\n<h3>${isEn ? 'Key Point Header' : 'मुख्य बिंदु'}</h3>\n`;
        break;
      case 'ul':
        snippet = `\n<ul>\n  <li>${isEn ? 'First key item' : 'पहला महत्वपूर्ण बिंदु'}</li>\n  <li>${isEn ? 'Second key item' : 'दूसरा महत्वपूर्ण बिंदु'}</li>\n</ul>\n`;
        break;
      case 'quote':
        snippet = `\n<blockquote>${isEn ? 'Important insight or quote from industry expert.' : 'उद्योग विशेषज्ञ का महत्वपूर्ण उद्धरण।'}</blockquote>\n`;
        break;
      case 'code':
        snippet = `\n<pre><code>// Example code or prompt instruction\nconst prompt = "Explain neural network weights";</code></pre>\n`;
        break;
      case 'table':
        snippet = `\n<table class="w-full border">\n  <thead><tr><th class="border p-2">Feature</th><th class="border p-2">Specification</th></tr></thead>\n  <tbody><tr><td class="border p-2">API Version</td><td class="border p-2">v2.4</td></tr></tbody>\n</table>\n`;
        break;
    }
    setter(current + snippet);
  };

  const handleSave = (newStatus?: Post['status']) => {
    const postStatus = newStatus || status;

    if (!titleEn && !titleHi) {
      showToast('Please enter an article title in at least one language.', 'error');
      return;
    }

    const saved = dataService.savePost({
      id: postId,
      category_id: categoryId,
      featured_image: featuredImage,
      image_alt: imageAlt,
      status: postStatus,
      reading_time_minutes: Number(readingTime) || 5,
      is_featured: isFeatured,
      is_trending: isTrending,
      translations: {
        en: {
          title: titleEn || titleHi || 'Untitled',
          slug: slugEn || `article-${Date.now()}`,
          excerpt: excerptEn || excerptHi || '',
          content: contentEn || contentHi || '<p>Content</p>',
          seo_title: seoTitleEn,
          meta_description: metaDescEn,
          focus_keyword: focusKeywordEn
        },
        hi: {
          title: titleHi || titleEn || 'शीर्षक रहित',
          slug: slugHi || `article-hi-${Date.now()}`,
          excerpt: excerptHi || excerptEn || '',
          content: contentHi || contentEn || '<p>सामग्री</p>',
          seo_title: seoTitleHi,
          meta_description: metaDescHi,
          focus_keyword: focusKeywordHi
        }
      }
    });

    showToast(`Article saved as ${postStatus}!`, 'success');
    onSelectSection('posts');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSection('posts')}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {postId ? 'Edit Article' : 'Compose New Article'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bilingual English & Hindi Publishing Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSave('published')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Translation Tabs & Content Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Language Tabs (Segmented control) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'en'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧 English Version</span>
              {titleEn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hi')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 ${
                activeTab === 'hi'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇮🇳 हिंदी संस्करण</span>
              {titleHi && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          </div>

          {/* ENGLISH EDITOR */}
          {activeTab === 'en' && (
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  English Title *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={e => handleTitleEnChange(e.target.value)}
                  placeholder="e.g. The Ultimate Guide to Prompt Engineering in 2026"
                  className="w-full px-4 py-2.5 text-base font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Slug (English) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-xs font-mono text-slate-500">
                    /blog/
                  </span>
                  <input
                    type="text"
                    required
                    value={slugEn}
                    onChange={e => setSlugEn(e.target.value)}
                    placeholder="prompt-engineering-guide"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows={3}
                  value={excerptEn}
                  onChange={e => setExcerptEn(e.target.value)}
                  placeholder="A compelling 1-2 sentence overview shown in article listings and social previews..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tiptap Rich Text Content Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Article Body (Tiptap Rich Text Editor & Blocks) *
                </label>
                <TiptapEditor
                  content={contentEn}
                  onChange={setContentEn}
                  language="en"
                  placeholder="Write your article, format text, upload multiple photos, and insert AI tool cards..."
                />
              </div>

              {/* SEO Meta Box for English */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Search Engine Optimization (English)
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeywordEn}
                    onChange={e => setFocusKeywordEn(e.target.value)}
                    placeholder="e.g. prompt engineering"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Custom SEO Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={seoTitleEn}
                    onChange={e => setSeoTitleEn(e.target.value)}
                    placeholder="Default: Title + DigiSeekho"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={metaDescEn}
                    onChange={e => setMetaDescEn(e.target.value)}
                    placeholder="Target 120-160 characters for search snippets..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* HINDI EDITOR */}
          {activeTab === 'hi' && (
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 font-sans">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  हिंदी शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  value={titleHi}
                  onChange={e => handleTitleHiChange(e.target.value)}
                  placeholder="उदा. ChatGPT और प्रॉम्प्ट इंजीनियरिंग: 2026 की संपूर्ण गाइड"
                  className="w-full px-4 py-2.5 text-base font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL स्लग (Hindi) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-xs font-mono text-slate-500">
                    /hi/blog/
                  </span>
                  <input
                    type="text"
                    required
                    value={slugHi}
                    onChange={e => setSlugHi(e.target.value)}
                    placeholder="chatgpt-guide-hindi"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  लेख सारांश (Excerpt) *
                </label>
                <textarea
                  rows={3}
                  value={excerptHi}
                  onChange={e => setExcerptHi(e.target.value)}
                  placeholder="पाठकों के लिए 1-2 पंक्तियों का संक्षिप्त परिचय..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tiptap Rich Text Content Editor (Hindi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                  लेख सामग्री (Tiptap एडवांस्ड एडिटर व ब्लॉक्स) *
                </label>
                <TiptapEditor
                  content={contentHi}
                  onChange={setContentHi}
                  language="hi"
                  placeholder="यहाँ अपना हिंदी लेख लिखें, तस्वीरें जोड़ें, AI टूल कार्ड्स शामिल करें..."
                />
              </div>

              {/* SEO Meta Box for Hindi */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  सर्च इंजन ऑप्टिमाइजेशन (Hindi SEO)
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    फोकस कीवर्ड
                  </label>
                  <input
                    type="text"
                    value={focusKeywordHi}
                    onChange={e => setFocusKeywordHi(e.target.value)}
                    placeholder="उदा. प्रॉम्प्ट इंजीनियरिंग"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    मेटा विवरण (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={metaDescHi}
                    onChange={e => setMetaDescHi(e.target.value)}
                    placeholder="सर्च इंजन के लिए 120-160 अक्षरों का विवरण..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Settings, Featured Image & Live SEO Score (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Publishing Settings Box */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Publishing Controls
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Post Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="published">Published (Live Online)</option>
                <option value="draft">Draft (Review Pending)</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.translations.en.name} / {c.translations.hi.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reading Time (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={readingTime}
                onChange={e => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Set as Homepage Featured Editorial</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={e => setIsTrending(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Highlight in Trending List</span>
              </label>
            </div>
          </div>

          {/* Featured Image Picker */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Image</span>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Choose from Media
              </button>
            </div>

            {featuredImage ? (
              <div className="aspect-16/10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                <img
                  src={featuredImage}
                  alt={imageAlt || 'Featured thumbnail'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-16/10 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-xs">
                No image selected
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={e => setFeaturedImage(e.target.value)}
                placeholder="/src/assets/images/..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Descriptive Alt Text (for SEO & Accessibility)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={e => setImageAlt(e.target.value)}
                placeholder="Detailed description of the image subject..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Live SEO Score & Checklist */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                SEO Audit ({activeTab.toUpperCase()})
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                seoResult.score >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : seoResult.score >= 50
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
              }`}>
                Score: {seoResult.score}/100
              </span>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-left">
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-mono">
                <span>digiseekho.com</span>
                <span>›</span>
                <span>blog</span>
                <span>›</span>
                <span className="truncate max-w-[120px]">{activeSlug || 'article-slug'}</span>
              </div>
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 line-clamp-1">
                {activeTitle || 'Article Title - DigiSeekho'}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                {activeDesc || 'Article meta description snippet as it will appear in Google organic search results.'}
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              {seoResult.checks.map((chk, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {chk.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={chk.passed ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                      {chk.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select from Media Library</h3>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mediaList.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setFeaturedImage(item.file_url);
                    setImageAlt(item.alt_text || item.title);
                    setMediaPickerOpen(false);
                    showToast('Featured image updated', 'info');
                  }}
                  className="aspect-16/10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 group relative"
                >
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Select
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Live Article Preview ({activeTab.toUpperCase()})
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded"
              >
                Close Preview
              </button>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
              {activeTab === 'en' ? (titleEn || 'Untitled Article') : (titleHi || 'शीर्षक')}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-6">
              {activeTab === 'en' ? excerptEn : excerptHi}
            </p>

            {featuredImage && (
              <div className="aspect-16/9 rounded-xl overflow-hidden mb-6 bg-slate-100">
                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: activeTab === 'en' ? contentEn : contentHi }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
