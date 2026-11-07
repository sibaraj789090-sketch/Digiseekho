import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { useApp } from '../../context/AppContext';
import { Save, Globe, Share2, Mail, Layout } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useApp();
  const settings = dataService.getSettings();

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
    <div className="space-y-8 max-w-4xl pb-20">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Website Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize platform branding, bilingual taglines, social links, and contact channels
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Branding */}
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

        {/* Social Media Profiles */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Social Media Handles
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                X / Twitter URL
              </label>
              <input
                type="text"
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="text"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Page
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                GitHub Repository / Org
              </label>
              <input
                type="text"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Text */}
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

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
