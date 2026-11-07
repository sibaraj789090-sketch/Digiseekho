import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService, INITIAL_SOCIAL_MEDIA } from '../../lib/dataService';
import { SocialMediaSettings, SocialPlatformConfig } from '../../types';
import { isSupabaseConfigured, getSupabaseClient } from '../../lib/supabase';
import {
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cloud,
  ToggleLeft,
  ToggleRight,
  Eye,
  RotateCcw,
  Info,
  Globe
} from 'lucide-react';

interface AdminSocialLinksManagerProps {
  onNavigateHome?: () => void;
}

export const AdminSocialLinksManager: React.FC<AdminSocialLinksManagerProps> = ({ onNavigateHome }) => {
  const { showToast, adminUser } = useApp();
  const isSuperAdmin = adminUser.role === 'admin';

  const [currentSocial, setCurrentSocial] = useState<SocialMediaSettings>(() => dataService.getSocialMedia());

  // Form draft states
  const [sectionTitleEn, setSectionTitleEn] = useState(currentSocial.section_title_en || 'Follow DigiSeekho');
  const [sectionTitleHi, setSectionTitleHi] = useState(currentSocial.section_title_hi || 'DigiSeekho को फॉलो करें');
  const [sectionSubtitleEn, setSectionSubtitleEn] = useState(
    currentSocial.section_subtitle_en || 'Stay connected with us for the latest AI, Technology and Digital Updates.'
  );
  const [sectionSubtitleHi, setSectionSubtitleHi] = useState(
    currentSocial.section_subtitle_hi || 'नवीनतम एआई, तकनीक और डिजिटल अपडेट के लिए हमसे जुड़े रहें।'
  );

  const [youtubeUrl, setYoutubeUrl] = useState(currentSocial.youtube.url || '');
  const [youtubeEnabled, setYoutubeEnabled] = useState(currentSocial.youtube.enabled);

  const [facebookUrl, setFacebookUrl] = useState(currentSocial.facebook.url || '');
  const [facebookEnabled, setFacebookEnabled] = useState(currentSocial.facebook.enabled);

  const [instagramUrl, setInstagramUrl] = useState(currentSocial.instagram.url || '');
  const [instagramEnabled, setInstagramEnabled] = useState(currentSocial.instagram.enabled);

  const [telegramUrl, setTelegramUrl] = useState(currentSocial.telegram.url || '');
  const [telegramEnabled, setTelegramEnabled] = useState(currentSocial.telegram.enabled);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabaseConnected = isSupabaseConfigured();

  // Listen for external updates
  useEffect(() => {
    const handleUpdate = () => {
      const updated = dataService.getSocialMedia();
      setCurrentSocial(updated);
    };
    window.addEventListener('digiseekho_social_changed', handleUpdate);
    return () => window.removeEventListener('digiseekho_social_changed', handleUpdate);
  }, []);

  // Validation function
  const validateUrl = (url: string, platformName: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (just disabled/hidden)
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('t.me/')) {
      setValidationError(`Please enter a valid URL (starting with https://) for ${platformName}`);
      return false;
    }
    return true;
  };

  // Restore Official DigiSeekho Handles
  const handleRestoreDefaults = () => {
    setSectionTitleEn(INITIAL_SOCIAL_MEDIA.section_title_en || 'Follow DigiSeekho');
    setSectionTitleHi(INITIAL_SOCIAL_MEDIA.section_title_hi || 'DigiSeekho को फॉलो करें');
    setSectionSubtitleEn(INITIAL_SOCIAL_MEDIA.section_subtitle_en || 'Stay connected with us for the latest AI, Technology and Digital Updates.');
    setSectionSubtitleHi(INITIAL_SOCIAL_MEDIA.section_subtitle_hi || 'नवीनतम एआई, तकनीक और डिजिटल अपडेट के लिए हमसे जुड़े रहें।');

    setYoutubeUrl(INITIAL_SOCIAL_MEDIA.youtube.url);
    setYoutubeEnabled(true);
    setFacebookUrl(INITIAL_SOCIAL_MEDIA.facebook.url);
    setFacebookEnabled(true);
    setInstagramUrl(INITIAL_SOCIAL_MEDIA.instagram.url);
    setInstagramEnabled(true);
    setTelegramUrl(INITIAL_SOCIAL_MEDIA.telegram.url);
    setTelegramEnabled(true);

    showToast('Loaded official DigiSeekho social media handles. Click "Save Changes" to publish.', 'info');
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admins can modify social media links.', 'error');
      return;
    }

    // Validate URLs
    if (youtubeEnabled && !validateUrl(youtubeUrl, 'YouTube')) return;
    if (facebookEnabled && !validateUrl(facebookUrl, 'Facebook')) return;
    if (instagramEnabled && !validateUrl(instagramUrl, 'Instagram')) return;
    if (telegramEnabled && !validateUrl(telegramUrl, 'Telegram')) return;

    try {
      setIsSaving(true);

      const updatedSocial: SocialMediaSettings = {
        section_title_en: sectionTitleEn.trim(),
        section_title_hi: sectionTitleHi.trim(),
        section_subtitle_en: sectionSubtitleEn.trim(),
        section_subtitle_hi: sectionSubtitleHi.trim(),
        youtube: {
          url: youtubeUrl.trim(),
          enabled: youtubeEnabled,
          label: 'YouTube'
        },
        facebook: {
          url: facebookUrl.trim(),
          enabled: facebookEnabled,
          label: 'Facebook'
        },
        instagram: {
          url: instagramUrl.trim(),
          enabled: instagramEnabled,
          label: 'Instagram'
        },
        telegram: {
          url: telegramUrl.trim(),
          enabled: telegramEnabled,
          label: 'Telegram'
        }
      };

      dataService.saveSocialMedia(updatedSocial);
      setCurrentSocial(updatedSocial);

      setSaveStatus('Social media links saved and synced to homepage & Supabase database!');
      showToast('Social media links updated successfully! The homepage reflects changes immediately.', 'success');

      setTimeout(() => {
        setSaveStatus(null);
      }, 4000);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save social media settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview platform list
  const previewPlatforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      enabled: youtubeEnabled,
      url: youtubeUrl,
      bgColor: 'bg-[#FF0000]',
      shadowColor: 'hover:shadow-red-600/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      enabled: facebookEnabled,
      url: facebookUrl,
      bgColor: 'bg-[#1877F2]',
      shadowColor: 'hover:shadow-blue-600/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      enabled: instagramEnabled,
      url: instagramUrl,
      bgColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      shadowColor: 'hover:shadow-pink-600/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      enabled: telegramEnabled,
      url: telegramUrl,
      bgColor: 'bg-[#24A1DE]',
      shadowColor: 'hover:shadow-sky-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current -translate-x-0.5" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl pb-20">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <span>Admin Panel</span>
            <span>/</span>
            <span>Website Settings</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Social Media Links</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Social Media Follow Links</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your official YouTube, Facebook, Instagram, and Telegram channels displayed directly below the homepage banner.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Fill Official Handles</span>
          </button>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Homepage</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Database Status */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/20 dark:via-[#0f172a] dark:to-slate-900 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Super Admin Protected: {adminUser.full_name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Verified
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              URLs are validated and synced with Supabase PostgreSQL <code>site_settings</code> table.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {supabaseConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              <span>Supabase DB Sync Ready</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>Local Storage (Supabase Offline)</span>
            </span>
          )}
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. Bilingual Section Title & Subtitle */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Section Headings & Bilingual Text</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Section Heading (English)
              </label>
              <input
                type="text"
                required
                value={sectionTitleEn}
                onChange={e => setSectionTitleEn(e.target.value)}
                placeholder="Follow DigiSeekho"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
                Section Heading (Hindi - हिंदी)
              </label>
              <input
                type="text"
                required
                value={sectionTitleHi}
                onChange={e => setSectionTitleHi(e.target.value)}
                placeholder="DigiSeekho को फॉलो करें"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subtitle (English)
              </label>
              <input
                type="text"
                required
                value={sectionSubtitleEn}
                onChange={e => setSectionSubtitleEn(e.target.value)}
                placeholder="Stay connected with us for the latest AI, Technology and Digital Updates."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
                Subtitle (Hindi - हिंदी)
              </label>
              <input
                type="text"
                required
                value={sectionSubtitleHi}
                onChange={e => setSectionSubtitleHi(e.target.value)}
                placeholder="नवीनतम एआई, तकनीक और डिजिटल अपडेट के लिए हमसे जुड़े रहें।"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* 2. Four Social Media Channel Configurations */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Official Social Channels & URLs
            </div>
            <span className="text-[11px] text-slate-400">
              Disabled or empty channels will be automatically hidden from the homepage.
            </span>
          </div>

          <div className="space-y-4">
            
            {/* 1. YouTube */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-md shadow-red-600/30">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">YouTube</h3>
                  <p className="text-[11px] text-slate-400">Video tutorials & AI Guides</p>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@digiseekho"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setYoutubeEnabled(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    youtubeEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {youtubeEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{youtubeEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            </div>

            {/* 2. Facebook */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Facebook</h3>
                  <p className="text-[11px] text-slate-400">Community & Page</p>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={e => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/digiseekho"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setFacebookEnabled(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    facebookEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {facebookEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{facebookEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            </div>

            {/* 3. Instagram */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md shadow-pink-600/30">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Instagram</h3>
                  <p className="text-[11px] text-slate-400">Reels & Tech Carousels</p>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/digiseekho"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-pink-500 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setInstagramEnabled(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    instagramEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {instagramEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{instagramEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            </div>

            {/* 4. Telegram */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                  <svg className="w-5 h-5 fill-current -translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Telegram</h3>
                  <p className="text-[11px] text-slate-400">Direct Broadcast Channel</p>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={e => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/digiseekho"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setTelegramEnabled(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    telegramEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {telegramEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{telegramEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Live Interactive Preview */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Homepage Section Live Preview</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Renders exactly as visitors will see it on the public homepage.
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-[#080d1a] rounded-xl border border-slate-800">
            <div className="overflow-hidden rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
                <div className="max-w-xl">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      {sectionTitleEn || 'Follow DigiSeekho'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 font-normal">
                    {sectionSubtitleEn || 'Stay connected with us for the latest AI, Technology and Digital Updates.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {previewPlatforms
                    .filter(p => p.enabled && p.url && p.url.trim().length > 0)
                    .map(platform => (
                      <div
                        key={platform.id}
                        className={`flex items-center justify-center w-11 h-11 rounded-full text-white ${platform.bgColor} shadow-lg shadow-black/30 cursor-pointer transform hover:scale-110 transition-transform`}
                        title={platform.name}
                      >
                        {platform.icon}
                      </div>
                    ))}
                  {previewPlatforms.filter(p => p.enabled && p.url && p.url.trim().length > 0).length === 0 && (
                    <span className="text-xs text-slate-500 italic">
                      All social icons are disabled or URLs are empty. Section will be hidden.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Clicking "Save Social Media Links" updates the homepage instantly and syncs to Supabase.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveStatus}</span>
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Social Media Links'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
