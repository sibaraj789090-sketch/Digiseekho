import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../lib/dataService';
import { HomepageBanner } from '../../types';
import {
  isSupabaseConfigured,
  getSupabaseClient
} from '../../lib/supabase';
import {
  uploadBannerImage,
  syncExistingBannerToSupabase
} from '../../lib/supabaseStorage';
import { normalizeImageUrl } from '../../lib/imageUtils';
import {
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  ExternalLink,
  RotateCcw,
  Cloud,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info,
  Link as LinkIcon
} from 'lucide-react';

const OFFICIAL_BANNER_URL = '/assets/aistudio/file_0000000058e88211828c5103c84bb209_aa3cdfea.png';

interface AdminBannerManagerProps {
  onNavigateHome?: () => void;
}

export const AdminBannerManager: React.FC<AdminBannerManagerProps> = ({ onNavigateHome }) => {
  const { showToast, adminUser } = useApp();
  const isSuperAdmin = adminUser.role === 'admin';

  // Current saved banner in storage
  const [currentBanner, setCurrentBanner] = useState<HomepageBanner>(() => dataService.getBanner());

  // Form draft state
  const [enabled, setEnabled] = useState(currentBanner.enabled);
  const [desktopImageUrl, setDesktopImageUrl] = useState(currentBanner.desktop_image_url || OFFICIAL_BANNER_URL);
  const [mobileImageUrl, setMobileImageUrl] = useState(currentBanner.mobile_image_url || '');
  const [altText, setAltText] = useState(currentBanner.alt_text || 'DigiSeekho – Learn Technology. Discover AI. Grow Digitally.');
  const [linkUrl, setLinkUrl] = useState(currentBanner.link_url || '');
  const [openInNewTab, setOpenInNewTab] = useState(Boolean(currentBanner.open_in_new_tab));

  // UI state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [desktopUploadProgress, setDesktopUploadProgress] = useState<number | null>(null);
  const [mobileUploadProgress, setMobileUploadProgress] = useState<number | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const supabaseConnected = isSupabaseConfigured();

  // Listen to banner updates
  useEffect(() => {
    const handleUpdate = () => {
      const updated = dataService.getBanner();
      setCurrentBanner(updated);
    };
    window.addEventListener('digiseekho_banner_changed', handleUpdate);
    return () => window.removeEventListener('digiseekho_banner_changed', handleUpdate);
  }, []);

  // Handle Desktop File Upload
  const handleDesktopFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setDesktopUploadProgress(10);
      const result = await uploadBannerImage(file, 'desktop', percent => {
        setDesktopUploadProgress(percent);
      });

      setDesktopImageUrl(result.url);
      setDesktopUploadProgress(null);
      showToast(
        result.source === 'supabase'
          ? 'Desktop banner uploaded directly to Supabase Storage!'
          : 'Desktop banner saved and ready to publish.',
        'success'
      );
    } catch (err: any) {
      setDesktopUploadProgress(null);
      showToast(err?.message || 'Failed to upload desktop banner', 'error');
    } finally {
      if (desktopFileInputRef.current) desktopFileInputRef.current.value = '';
    }
  };

  // Handle Mobile File Upload
  const handleMobileFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMobileUploadProgress(10);
      const result = await uploadBannerImage(file, 'mobile', percent => {
        setMobileUploadProgress(percent);
      });

      setMobileImageUrl(result.url);
      setMobileUploadProgress(null);
      showToast(
        result.source === 'supabase'
          ? 'Mobile banner uploaded directly to Supabase Storage!'
          : 'Mobile banner saved and ready to publish.',
        'success'
      );
    } catch (err: any) {
      setMobileUploadProgress(null);
      showToast(err?.message || 'Failed to upload mobile banner', 'error');
    } finally {
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  // Restore Official Custom Banner
  const handleRestoreOfficialBanner = () => {
    setDesktopImageUrl(OFFICIAL_BANNER_URL);
    setAltText('DigiSeekho – Learn Technology. Discover AI. Grow Digitally. Your Complete Tech Learning Hub');
    showToast('Loaded official DigiSeekho banner image. Click "Save & Publish" to activate.', 'info');
  };

  // Sync active banner into Supabase Storage
  const handleSyncToSupabaseStorage = async () => {
    if (!supabaseConnected) {
      showToast('Please configure your Supabase URL & Anon Key in the "Supabase Database" tab first.', 'error');
      return;
    }

    try {
      setIsSyncingSupabase(true);
      const syncedUrl = await syncExistingBannerToSupabase(desktopImageUrl);
      if (syncedUrl) {
        setDesktopImageUrl(syncedUrl);
        // Save immediately
        dataService.saveBanner({
          enabled,
          desktop_image_url: syncedUrl,
          mobile_image_url: mobileImageUrl,
          alt_text: altText,
          link_url: linkUrl,
          open_in_new_tab: openInNewTab
        });
        showToast('Banner successfully uploaded and synced to your Supabase Storage bucket!', 'success');
      } else {
        showToast('Could not sync to Supabase. Check bucket permissions for "banners" or "article-images".', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Supabase storage sync failed', 'error');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Delete / Remove current banner
  const handleDeleteBanner = () => {
    const emptyBanner: HomepageBanner = {
      enabled: false,
      desktop_image_url: '',
      mobile_image_url: '',
      alt_text: '',
      link_url: '',
      open_in_new_tab: false
    };

    dataService.saveBanner(emptyBanner);
    setEnabled(false);
    setDesktopImageUrl('');
    setMobileImageUrl('');
    setAltText('');
    setLinkUrl('');
    setShowDeleteConfirm(false);
    showToast('Homepage banner deleted and disabled successfully.', 'info');
  };

  // Save and Publish Changes
  const handleSaveAndPublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admins can publish website banner changes.', 'error');
      return;
    }

    if (enabled && !desktopImageUrl.trim()) {
      showToast('Please upload or provide a desktop banner image URL before enabling.', 'error');
      return;
    }

    const updatedBanner: HomepageBanner = {
      enabled,
      desktop_image_url: desktopImageUrl.trim(),
      mobile_image_url: mobileImageUrl.trim() || undefined,
      alt_text: altText.trim(),
      link_url: linkUrl.trim() || undefined,
      open_in_new_tab: openInNewTab
    };

    dataService.saveBanner(updatedBanner);
    setCurrentBanner(updatedBanner);
    setSaveStatus('Banner settings saved and published to homepage!');
    showToast('Homepage banner published successfully! The public homepage is updated in real-time.', 'success');

    setTimeout(() => {
      setSaveStatus(null);
    }, 4000);
  };

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
            <span className="text-slate-900 dark:text-white">Homepage Banner</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Homepage Banner Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control the visual hero banner displayed on DigiSeekho's homepage, with responsive mobile overrides and Supabase Storage integration.
          </p>
        </div>

        {/* Live Homepage Preview Button */}
        <div className="flex items-center gap-2">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Homepage</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Role Verification Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/20 dark:via-[#0f172a] dark:to-slate-900 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Authorized Administrator: {adminUser.full_name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Super Admin
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Secure RBAC enforced. Database changes and Supabase Storage uploads authenticated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {supabaseConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              <span>Supabase Storage Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>Persistent Local Storage (Supabase Offline)</span>
            </span>
          )}
        </div>
      </div>

      {/* Current Active Banner Status Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Live Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${currentBanner.enabled && currentBanner.desktop_image_url ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentBanner.enabled && currentBanner.desktop_image_url
                  ? 'Active on Homepage (Visible to all visitors)'
                  : 'Disabled / Hidden from Homepage'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEnabled(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {enabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{enabled ? 'Banner Enabled' : 'Banner Disabled'}</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Preview of Saved Active Banner */}
        {currentBanner.desktop_image_url ? (
          <div className="mt-4 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Active Desktop Banner Image:</span>
              <span className="font-mono text-[11px] text-slate-400">
                {currentBanner.desktop_image_url.includes('aistudio') ? 'Official Custom Asset' : currentBanner.desktop_image_url.startsWith('https://') ? 'Cloud Hosted' : 'Permanent Media'}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center">
              <img
                src={normalizeImageUrl(currentBanner.desktop_image_url, '/assets/images/digiseekho_official_banner.png')}
                alt={currentBanner.alt_text}
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/digiseekho_official_banner.png';
                }}
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            No active banner currently saved. Upload an image below to publish.
          </div>
        )}
      </div>

      {/* Main Banner Form */}
      <form onSubmit={handleSaveAndPublish} className="space-y-6">
        
        {/* 1. Desktop Banner Upload & URL */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-600" />
                <span>1. Desktop & Default Banner (Primary)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-width responsive panoramic banner (Aspect Ratio: 8:3 or 16:9, recommended 2048 x 768 px).
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestoreOfficialBanner}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Use Provided DigiSeekho Banner</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => desktopFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/40 group flex flex-col items-center justify-center min-h-[160px]"
            >
              <input
                ref={desktopFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDesktopFileSelect}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop new desktop image
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PNG, JPEG, WebP, SVG (up to 10MB)
              </p>
              {desktopUploadProgress !== null && (
                <div className="w-full mt-3">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${desktopUploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                    Uploading: {desktopUploadProgress}%
                  </span>
                </div>
              )}
            </div>

            {/* Direct Image URL input */}
            <div className="flex flex-col justify-between space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Desktop Image URL / Path
                </label>
                <input
                  type="text"
                  value={desktopImageUrl}
                  onChange={e => setDesktopImageUrl(e.target.value)}
                  placeholder="/assets/aistudio/... or https://..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Points directly to your custom DigiSeekho panoramic asset or Supabase Storage file.
                </p>
              </div>

              {/* Supabase Storage Sync Trigger */}
              {supabaseConnected && desktopImageUrl && (
                <button
                  type="button"
                  disabled={isSyncingSupabase}
                  onClick={handleSyncToSupabaseStorage}
                  className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isSyncingSupabase ? 'Syncing to Supabase...' : 'Upload/Sync to Supabase Storage Bucket'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Optional Mobile Banner Override */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>2. Separate Mobile Banner (Optional Override)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Optimized for small smartphone screens (&le; 640px). If left blank, the responsive desktop banner automatically adapts.
              </p>
            </div>

            {mobileImageUrl && (
              <button
                type="button"
                onClick={() => setMobileImageUrl('')}
                className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Mobile Override</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => mobileFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/40 group flex flex-col items-center justify-center min-h-[130px]"
            >
              <input
                ref={mobileFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMobileFileSelect}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Upload Dedicated Mobile Image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recommended 1080 x 600 or 1080 x 1080
              </p>
              {mobileUploadProgress !== null && (
                <div className="w-full mt-2">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${mobileUploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
                    Uploading: {mobileUploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Mobile Image URL (Optional)
              </label>
              <input
                type="text"
                value={mobileImageUrl}
                onChange={e => setMobileImageUrl(e.target.value)}
                placeholder="Leave blank to use responsive desktop banner"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                {mobileImageUrl ? 'Active mobile override is set.' : 'Currently using responsive desktop banner on mobile.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Banner SEO & Click Link Settings */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            3. Banner Link Action & Accessibility (SEO)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image Alt Text (SEO & Accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                placeholder="DigiSeekho – Learn Technology. Discover AI. Grow Digitally."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Destination Click URL (Optional)
              </label>
              <div className="relative flex items-center">
                <LinkIcon className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="/category/ai-tools, #explore, or https://..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="openInNewTab"
              checked={openInNewTab}
              onChange={e => setOpenInNewTab(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="openInNewTab" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              Open destination link in a new browser tab (<code>target="_blank"</code>)
            </label>
          </div>
        </div>

        {/* 4. Live Interactive Preview Before Publishing */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>4. Live Preview Before Publishing</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect how the banner renders at native aspect ratios without distortion.
              </p>
            </div>

            {/* Viewport Device Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop View</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="p-4 sm:p-6 bg-slate-100 dark:bg-[#080d1a] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center items-center overflow-x-auto">
            {previewDevice === 'desktop' ? (
              <div className="w-full max-w-4xl">
                <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                  <span>DESKTOP PREVIEW (Full Width Container)</span>
                  <span>Aspect Ratio Preserved (Object-Contain)</span>
                </div>
                <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-950">
                  {desktopImageUrl ? (
                    <img
                      src={normalizeImageUrl(desktopImageUrl, '/assets/images/digiseekho_official_banner.png')}
                      alt={altText}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/digiseekho_official_banner.png';
                      }}
                      className="w-full h-auto object-contain block select-none"
                    />
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      No banner image selected.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-[375px] max-w-full">
                <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                  <span>MOBILE VIEW (375px Viewport)</span>
                  <span>{mobileImageUrl ? 'Dedicated Mobile Banner' : 'Responsive Desktop'}</span>
                </div>
                <div className="w-full rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 bg-slate-950">
                  <img
                    src={normalizeImageUrl(mobileImageUrl || desktopImageUrl, '/assets/images/digiseekho_official_banner.png')}
                    alt={altText}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/digiseekho_official_banner.png';
                    }}
                    className="w-full h-auto object-contain block select-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            {currentBanner.desktop_image_url && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete / Remove Banner</span>
              </button>
            )}
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Banner</span>
            </button>
          </div>
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Homepage Banner?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will remove the banner image and hide the hero banner from DigiSeekho's homepage. You can restore or re-upload a new banner at any time.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Yes, Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
