import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { useApp } from '../../context/AppContext';
import { AdminBannerManager } from './AdminBannerManager';
import { AdminSocialLinksManager } from './AdminSocialLinksManager';
import { AdminAdsManager } from './AdminAdsManager';
import { authService, AUTHORIZED_ADMIN_EMAIL } from '../../lib/authService';
import {
  Save,
  Globe,
  Share2,
  Mail,
  Layout,
  Image as ImageIcon,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

interface AdminSettingsProps {
  initialTab?: 'banner' | 'general' | 'social' | 'ads' | 'security' | 'footer';
  onNavigateHome?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ initialTab = 'banner', onNavigateHome }) => {
  const { showToast } = useApp();
  const settings = dataService.getSettings();

  const [activeTab, setActiveTab] = useState<'banner' | 'general' | 'social' | 'ads' | 'security' | 'footer'>(initialTab);

  const [siteName, setSiteName] = useState(settings.website_name);
  const [taglineEn, setTaglineEn] = useState(settings.tagline_en);
  const [taglineHi, setTaglineHi] = useState(settings.tagline_hi);
  const [contactEmail, setContactEmail] = useState(settings.contact_email);
  const [footerEn, setFooterEn] = useState(settings.footer_text_en);
  const [footerHi, setFooterHi] = useState(settings.footer_text_hi);

  // Security password state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

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

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Admin Security & Password</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-full font-mono">
            Protected
          </span>
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

      {/* Tab Content: 4. Admin Security & Password Manager */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 rounded-2xl border border-indigo-700/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Authorized Super Admin</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  {AUTHORIZED_ADMIN_EMAIL}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/60 space-y-1">
              <div>Session Token: <span className="font-mono text-emerald-400">{authService.getCurrentSession()?.token.slice(0, 18)}...</span></div>
              <div>Provider: <span className="font-semibold text-white capitalize">{authService.getCurrentSession()?.provider || 'Password'}</span></div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  <span>Update Admin Password</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Change the master authentication password for {AUTHORIZED_ADMIN_EMAIL}
                </p>
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                setPwdMsg(null);
                if (newPassword !== confirmPassword) {
                  setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
                  return;
                }
                const res = authService.changePassword(currPassword, newPassword);
                if (res.success) {
                  setPwdMsg({ text: 'Admin password successfully updated!', type: 'success' });
                  setCurrPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  showToast('Admin password updated successfully', 'success');
                } else {
                  setPwdMsg({ text: res.error || 'Failed to update password.', type: 'error' });
                }
              }}
              className="space-y-4 max-w-md"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currPassword}
                    onChange={e => setCurrPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save New Password</span>
              </button>
            </form>
          </div>

          {/* Security Rules Checklist */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Active Security Safeguards</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Strict Single Admin Whitelist</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Only <span className="font-mono text-indigo-500">{AUTHORIZED_ADMIN_EMAIL}</span> can access the Admin Panel. Any other email is rejected immediately.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Public Registration Disabled</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Self-signup is completely blocked on both frontend and backend PostgreSQL database triggers.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">PostgreSQL RLS is_authorized_admin()</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Database tables reject any non-admin JWT payloads with PostgreSQL security-definer execution.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Google OAuth Account Filter</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Google Sign-In triggers immediate session revocation if the authenticated email is not {AUTHORIZED_ADMIN_EMAIL}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 5-6 General & Footer Form */}
      {activeTab !== 'banner' && activeTab !== 'social' && activeTab !== 'ads' && activeTab !== 'security' && (
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
