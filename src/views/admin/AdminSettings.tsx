import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { useApp } from '../../context/AppContext';
import { AdminBannerManager } from './AdminBannerManager';
import { AdminSocialLinksManager } from './AdminSocialLinksManager';
import { AdminAdsManager } from './AdminAdsManager';
import { Save, Globe, Share2, Mail, Layout, Image as ImageIcon, Sparkles, DollarSign } from 'lucide-react';

interface AdminSettingsProps {
  initialTab?: 'banner' | 'general' | 'social' | 'ads' | 'footer';
  onNavigateHome?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ initialTab = 'banner', onNavigateHome }) => {
  const { showToast } = useApp();
  const settings = dataService.getSettings();

  const [activeTab, setActiveTab] = useState<'banner' | 'general' | 'social' | 'ads' | 'footer'>(initialTab);

  const [siteName, setSiteName] = useState(settings.website_name);
  const [taglineEn, setTaglineEn] = useState(settings.tagline_en);
  const [taglineHi, setTaglineHi] = useState(settings.tagline_hi);
  const [contactEmail, setContactEmail] = useState(settings.contact_email);
  const [footerEn, setFooterEn] = useState(settings.footer_text_en);
  const [footerHi, setFooterHi] = useState(settings.footer_text_hi);

  const [twitter, setTwitter] = useState(settings.social_links.twitter || '');
  const [youtube, setYoutube] = useState(settings.social_links.youtube || '');
  const [linkedin, setLinkedin] = useState(settings.social_links.linkedin || '');
  const [github, setGithub] = useState(settings.social_links.github || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings({
      website_name: siteName,
      tagline_en: taglineEn,
      tagline_hi: taglineHi,
      contact_email: contactEmail,
      footer_text_en: footerEn,
      footer_text_hi: footerHi,
      social_links: {
        twitter,
        youtube,
        linkedin,
        github
      }
    });
    showToast('Website settings updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      
      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('banner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'banner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Homepage Banner</span>
          {settings.homepage_banner?.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'social'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Social Media Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ads'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Website Ads & AdSense</span>
          {settings.ads?.global_enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>General & Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'footer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Footer & Disclaimer</span>
        </button>
      </div>

      {/* Tab Content: 1. Homepage Banner Manager */}
      {activeTab === 'banner' && (
        <AdminBannerManager onNavigateHome={onNavigateHome} />
      )}

      {/* Tab Content: 2. Social Media Links Manager */}
      {activeTab === 'social' && (
        <AdminSocialLinksManager onNavigateHome={onNavigateHome} />
      )}

      {/* Tab Content: 3. Website Ads & AdSense Manager */}
      {activeTab === 'ads' && (
        <AdminAdsManager onNavigateHome={onNavigateHome} />
      )}

      {/* Tab Content: 4-5 General & Footer Form */}
      {activeTab !== 'banner' && activeTab !== 'social' && activeTab !== 'ads' && (
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Brand Identity
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website Name
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    English Tagline
                  </label>
                  <input
                    type="text"
                    required
                    value={taglineEn}
                    onChange={e => setTaglineEn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
                    Hindi Tagline (हिंदी टैगलाइन)
                  </label>
                  <input
                    type="text"
                    required
                    value={taglineHi}
                    onChange={e => setTaglineHi(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Footer Copyright & Disclaimer
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Footer Note (English)
                </label>
                <textarea
                  rows={2}
                  value={footerEn}
                  onChange={e => setFooterEn(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
                  Footer Note (Hindi)
                </label>
                <textarea
                  rows={2}
                  value={footerHi}
                  onChange={e => setFooterHi(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
