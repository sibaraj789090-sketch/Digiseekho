import React, { useState, useEffect } from 'react';
import { adService, INITIAL_NETWORKS, INITIAL_PLACEMENTS, INITIAL_AD_SETTINGS } from '../../lib/adService';
import { useApp } from '../../context/AppContext';
import {
  AdNetwork,
  AdPlacement,
  AdUnit,
  AdSystemSettings,
  AdAnalyticsSummary,
  AdPlacementGroup,
  AdDeviceVisibility,
  AdType
} from '../../types';
import { AdBanner } from '../../components/AdBanner';
import {
  LayoutDashboard,
  Network,
  Code2,
  MapPin,
  Home,
  FileText,
  Sidebar as SidebarIcon,
  Smartphone,
  Monitor,
  BarChart3,
  Settings,
  PlusCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  DollarSign,
  Shield,
  Layers,
  Database
} from 'lucide-react';

type SubSection =
  | 'dashboard'
  | 'networks'
  | 'codes'
  | 'placements'
  | 'homepage'
  | 'article'
  | 'sidebar'
  | 'mobile'
  | 'desktop'
  | 'analytics'
  | 'settings';

interface AdminAdsManagerProps {
  onNavigateHome?: () => void;
}

export const AdminAdsManager: React.FC<AdminAdsManagerProps> = ({ onNavigateHome }) => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<SubSection>('dashboard');
  const [settings, setSettings] = useState<AdSystemSettings>(() => adService.getSettings());
  const [networks, setNetworks] = useState<AdNetwork[]>(() => adService.getNetworks());
  const [placements, setPlacements] = useState<AdPlacement[]>(() => adService.getPlacements());
  const [units, setUnits] = useState<AdUnit[]>(() => adService.getUnits());
  const [analytics, setAnalytics] = useState<AdAnalyticsSummary>(() => adService.getAnalytics());

  // Editing state for placement modal / inline
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<AdNetwork | null>(null);
  const [editingUnit, setEditingUnit] = useState<AdUnit | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh data on update
  const refreshAll = () => {
    setSettings(adService.getSettings());
    setNetworks(adService.getNetworks());
    setPlacements(adService.getPlacements());
    setUnits(adService.getUnits());
    setAnalytics(adService.getAnalytics());
  };

  useEffect(() => {
    const handleUpdate = () => refreshAll();
    window.addEventListener('digiseekho_ad_system_changed', handleUpdate);
    return () => window.removeEventListener('digiseekho_ad_system_changed', handleUpdate);
  }, []);

  // --- ACTIONS ---
  const handleToggleGlobal = () => {
    const updated = adService.saveSettings({ global_enabled: !settings.global_enabled });
    setSettings(updated);
    showToast(
      updated.global_enabled
        ? 'All website advertisements are now ENABLED globally.'
        : 'All website advertisements are now PAUSED globally.',
      'info'
    );
  };

  const handleToggleDesktop = () => {
    const updated = adService.saveSettings({ enable_desktop: !settings.enable_desktop });
    setSettings(updated);
    showToast(`Desktop ads ${updated.enable_desktop ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleToggleMobile = () => {
    const updated = adService.saveSettings({ enable_mobile: !settings.enable_mobile });
    setSettings(updated);
    showToast(`Mobile ads ${updated.enable_mobile ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleTogglePlacement = (id: string) => {
    const newState = adService.togglePlacement(id);
    refreshAll();
    showToast(`Placement "${id}" is now ${newState ? 'Active' : 'Disabled'}.`, 'info');
  };

  const handleSavePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlacement) return;
    adService.savePlacement(editingPlacement);
    refreshAll();
    setEditingPlacement(null);
    showToast(`Placement "${editingPlacement.name}" saved successfully!`, 'success');
  };

  const handleSaveNetwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNetwork) return;
    adService.saveNetwork(editingNetwork);
    refreshAll();
    setEditingNetwork(null);
    showToast(`Ad Network "${editingNetwork.name}" updated successfully!`, 'success');
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    adService.saveUnit(editingUnit);
    refreshAll();
    setEditingUnit(null);
    showToast(`Ad Unit Code "${editingUnit.name}" saved!`, 'success');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adService.saveSettings(settings);
    showToast('Global ad settings saved & synced to Supabase!', 'success');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(adService.getSupabaseSQLSchema());
    setCopiedSql(true);
    showToast('Supabase SQL Migration script copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Sub-sections menu items
  const subSections: { id: SubSection; label: string; icon: any }[] = [
    { id: 'dashboard', label: '1. Ads Dashboard', icon: LayoutDashboard },
    { id: 'networks', label: '2. Ad Networks', icon: Network },
    { id: 'codes', label: '3. Ad Codes', icon: Code2 },
    { id: 'placements', label: '4. Ad Placements', icon: MapPin },
    { id: 'homepage', label: '5. Homepage Ads', icon: Home },
    { id: 'article', label: '6. Article Ads', icon: FileText },
    { id: 'sidebar', label: '7. Sidebar Ads', icon: SidebarIcon },
    { id: 'mobile', label: '8. Mobile Ads', icon: Smartphone },
    { id: 'desktop', label: '9. Desktop Ads', icon: Monitor },
    { id: 'analytics', label: '10. Ad Analytics', icon: BarChart3 },
    { id: 'settings', label: '11. Ads Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-7xl pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Top Main Banner with Master Switches */}
      <div className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-3 h-3 rounded-full ${
                settings.global_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Website-Wide Ad Management System
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control Google AdSense, Adsterra, Infolinks, HilltopAds, Monetag & Direct Sponsor banners dynamically without code changes.
          </p>
        </div>

        {/* Master Control Toggles */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {/* Global Master Switch */}
          <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200 dark:border-slate-800">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Master Ads:
            </span>
            <button
              type="button"
              onClick={handleToggleGlobal}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                settings.global_enabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {settings.global_enabled ? 'ON (ACTIVE)' : 'OFF (PAUSED)'}
            </button>
          </div>

          {/* Desktop Toggle */}
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={handleToggleDesktop}
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                settings.enable_desktop
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              Desktop: {settings.enable_desktop ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={handleToggleMobile}
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                settings.enable_mobile
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              Mobile: {settings.enable_mobile ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* 11 Sub-sections Horizontal Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-thin">
        {subSections.map(sub => {
          const Icon = sub.icon;
          const isActive = activeTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveTab(sub.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 1: ADS DASHBOARD
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Networks</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {networks.filter(n => n.enabled).length} / {networks.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Google, Adsterra, Custom</span>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Placements</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {placements.filter(p => p.enabled).length} / {placements.length}
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Across Site</span>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recorded Impressions</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.total_impressions.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Real tracked views</span>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Ad Clicks</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.total_clicks.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Real engagement</span>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average CTR</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {analytics.ctr.toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-500">Clicks per 100 views</span>
            </div>
          </div>

          {/* Quick Placements Health Grid */}
          <div className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Quick Placements Control
                </h3>
                <p className="text-xs text-slate-400">Toggle any ad placement on or off with 1-click:</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('placements')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All 18 Placements →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {placements.slice(0, 9).map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {p.network_id.toUpperCase()} · {p.dimensions_label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePlacement(p.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      p.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {p.enabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('networks')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] hover:border-indigo-500 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Network className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Configure 5+ Ad Networks
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Manage Google AdSense, Adsterra, Infolinks, HilltopAds, Monetag & Direct Affiliates.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('homepage')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] hover:border-indigo-500 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Home className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Homepage Ad Positions
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Customize banners below header, hero banner, category navigation, and above newsletter.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('article')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] hover:border-indigo-500 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                In-Article Reading Ads
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Inject fluid ads after paragraph 1, paragraph 3, mid-content, and sticky desktop sidebar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: AD NETWORKS (Google AdSense, Adsterra, Infolinks, HilltopAds, Monetag, Custom)
          ========================================================================= */}
      {activeTab === 'networks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Supported Advertising Networks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your publisher credentials, header verification scripts, and default network ad codes.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingNetwork({
                  id: `net-${Date.now()}`,
                  name: 'New Custom Network',
                  slug: 'new-network',
                  publisher_id: '',
                  header_code: '',
                  default_ad_code: '',
                  website_url: '',
                  enabled: true,
                  is_custom: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom Network</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {networks.map(net => {
              const assignedPlacements = placements.filter(p => p.network_id === net.id);
              return (
                <div
                  key={net.id}
                  className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                          {net.name.slice(0, 2)}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {net.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          adService.saveNetwork({ ...net, enabled: !net.enabled });
                          refreshAll();
                          showToast(`${net.name} ${!net.enabled ? 'Enabled' : 'Disabled'}`, 'info');
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          net.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {net.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Publisher ID:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                          {net.publisher_id || 'Not Set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Assigned Placements:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {assignedPlacements.length} slots
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNetwork(net)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Configure / Edit
                    </button>

                    {net.website_url && (
                      <a
                        href={net.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Network Editor Modal */}
          {editingNetwork && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0c1427] max-w-xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Configure Network: {editingNetwork.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingNetwork(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveNetwork} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Network Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingNetwork.name}
                      onChange={e => setEditingNetwork({ ...editingNetwork, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Publisher / Client ID
                    </label>
                    <input
                      type="text"
                      value={editingNetwork.publisher_id || ''}
                      onChange={e => setEditingNetwork({ ...editingNetwork, publisher_id: e.target.value })}
                      placeholder="e.g. ca-pub-9842104820194820"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Header / Verification Script Code (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={editingNetwork.header_code || ''}
                      onChange={e => setEditingNetwork({ ...editingNetwork, header_code: e.target.value })}
                      placeholder="<script async src='...'></script>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Ad Code Snippet
                    </label>
                    <textarea
                      rows={4}
                      value={editingNetwork.default_ad_code || ''}
                      onChange={e => setEditingNetwork({ ...editingNetwork, default_ad_code: e.target.value })}
                      placeholder="<ins class='adsbygoogle' ...></ins>"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {editingNetwork.is_custom && (
                      <button
                        type="button"
                        onClick={() => {
                          adService.deleteNetwork(editingNetwork.id);
                          refreshAll();
                          setEditingNetwork(null);
                          showToast('Custom network deleted', 'info');
                        }}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Network</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setEditingNetwork(null)}
                        className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Save Network
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 3: AD CODES (Library of reusable ad units)
          ========================================================================= */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Ad Codes & Creative Snippets Library
              </h3>
              <p className="text-xs text-slate-400">
                Store and reuse verified responsive HTML / AdSense scripts across multiple placements.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingUnit({
                  id: `unit-${Date.now()}`,
                  name: 'New Responsive Ad Unit',
                  network_id: 'adsense',
                  format: 'responsive',
                  code: '',
                  notes: '',
                  created_at: new Date().toISOString()
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Ad Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map(unit => (
              <div
                key={unit.id}
                className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{unit.name}</h4>
                    <span className="text-[10px] uppercase font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      Format: {unit.format} · Network: {unit.network_id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(unit.code);
                      showToast('Code copied to clipboard!', 'success');
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl overflow-x-auto max-h-36">
                  <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                    {unit.code}
                  </pre>
                </div>

                {unit.notes && (
                  <p className="text-xs text-slate-400 italic">{unit.notes}</p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUnit(unit)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      adService.deleteUnit(unit.id);
                      refreshAll();
                      showToast('Ad code unit removed', 'info');
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Unit Editor Modal */}
          {editingUnit && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0c1427] max-w-xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Ad Unit Code
                </h3>
                <form onSubmit={handleSaveUnit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Unit Name</label>
                    <input
                      type="text"
                      required
                      value={editingUnit.name}
                      onChange={e => setEditingUnit({ ...editingUnit, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Network</label>
                      <select
                        value={editingUnit.network_id}
                        onChange={e => setEditingUnit({ ...editingUnit, network_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                      >
                        {networks.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Format</label>
                      <select
                        value={editingUnit.format}
                        onChange={e => setEditingUnit({ ...editingUnit, format: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                      >
                        <option value="leaderboard">Leaderboard (728x90)</option>
                        <option value="rectangle">Medium Rectangle (300x250)</option>
                        <option value="billboard">Billboard (970x250)</option>
                        <option value="mobile_banner">Mobile Banner (320x100)</option>
                        <option value="in_article">In-Article Fluid</option>
                        <option value="responsive">Responsive Auto</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">HTML / AdSense Code</label>
                    <textarea
                      rows={5}
                      required
                      value={editingUnit.code}
                      onChange={e => setEditingUnit({ ...editingUnit, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Internal Notes</label>
                    <input
                      type="text"
                      value={editingUnit.notes || ''}
                      onChange={e => setEditingUnit({ ...editingUnit, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUnit(null)}
                      className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
                    >
                      Save Ad Code
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 4, 5, 6, 7, 8, 9: PLACEMENTS VIEW (Granular Placement Filters)
          ========================================================================= */}
      {(['placements', 'homepage', 'article', 'sidebar', 'mobile', 'desktop'].includes(activeTab)) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                {activeTab === 'placements' && 'All 18 Ad Placements'}
                {activeTab === 'homepage' && 'Homepage Ad Placements (7 Slots)'}
                {activeTab === 'article' && 'Article Page Ad Placements (8 Slots)'}
                {activeTab === 'sidebar' && 'Sidebar Ad Placements'}
                {activeTab === 'mobile' && 'Mobile View Ad Placements'}
                {activeTab === 'desktop' && 'Desktop View Ad Placements'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure network source, custom banner image, destination link, or raw AdSense script for each slot.
              </p>
            </div>
          </div>

          {/* Placements Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements
              .filter(p => {
                if (activeTab === 'homepage') return p.group === 'homepage';
                if (activeTab === 'article') return p.group === 'article';
                if (activeTab === 'sidebar') return p.group === 'sidebar';
                if (activeTab === 'mobile') return p.device_visibility === 'all' || p.device_visibility === 'mobile_only';
                if (activeTab === 'desktop') return p.device_visibility === 'all' || p.device_visibility === 'desktop_only';
                return true;
              })
              .map(p => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.enabled && settings.global_enabled ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {p.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{p.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePlacement(p.id)}
                      className={`text-xs font-bold px-3 py-1 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        p.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p.enabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="block text-slate-400">Network:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{p.network_id}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Format:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.ad_type}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Dimensions:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{p.dimensions_label}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Visibility:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.device_visibility}</span>
                    </div>
                  </div>

                  {/* Inline Live Preview Miniature */}
                  <div className="p-2 bg-slate-100/60 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <AdBanner placementId={p.id} forceShowForPreview={true} />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingPlacement(p)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configure Placement</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Placement Editor Modal */}
          {editingPlacement && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-[#0c1427] max-w-2xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 my-8">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                      ID: {editingPlacement.id}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {editingPlacement.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPlacement(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePlacement} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Ad Network</label>
                      <select
                        value={editingPlacement.network_id}
                        onChange={e => setEditingPlacement({ ...editingPlacement, network_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        {networks.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Creative Type</label>
                      <select
                        value={editingPlacement.ad_type}
                        onChange={e => setEditingPlacement({ ...editingPlacement, ad_type: e.target.value as AdType })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <option value="custom_banner">Custom Banner Image (with Link)</option>
                        <option value="code">Google AdSense / Network Script Code</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Device Visibility</label>
                      <select
                        value={editingPlacement.device_visibility}
                        onChange={e => setEditingPlacement({ ...editingPlacement, device_visibility: e.target.value as AdDeviceVisibility })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <option value="all">Both Desktop & Mobile</option>
                        <option value="desktop_only">Desktop Only</option>
                        <option value="mobile_only">Mobile Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Slot Dimensions Label</label>
                      <input
                        type="text"
                        value={editingPlacement.dimensions_label}
                        onChange={e => setEditingPlacement({ ...editingPlacement, dimensions_label: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  {editingPlacement.ad_type === 'custom_banner' ? (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block font-semibold mb-1">Desktop Image URL</label>
                        <input
                          type="url"
                          value={editingPlacement.desktop_image_url || ''}
                          onChange={e => setEditingPlacement({ ...editingPlacement, desktop_image_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Mobile Image URL (Optional)</label>
                        <input
                          type="url"
                          value={editingPlacement.mobile_image_url || ''}
                          onChange={e => setEditingPlacement({ ...editingPlacement, mobile_image_url: e.target.value })}
                          placeholder="Optional separate mobile banner"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1">Destination Target Link</label>
                          <input
                            type="text"
                            value={editingPlacement.link_url || ''}
                            onChange={e => setEditingPlacement({ ...editingPlacement, link_url: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Alt Text</label>
                          <input
                            type="text"
                            value={editingPlacement.alt_text || ''}
                            onChange={e => setEditingPlacement({ ...editingPlacement, alt_text: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="edit_open_tab"
                          checked={!!editingPlacement.open_in_new_tab}
                          onChange={e => setEditingPlacement({ ...editingPlacement, open_in_new_tab: e.target.checked })}
                        />
                        <label htmlFor="edit_open_tab" className="cursor-pointer">
                          Open link in new tab (target="_blank" rel="sponsored")
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold mb-1">Network HTML / AdSense Script Code</label>
                      <textarea
                        rows={6}
                        value={editingPlacement.code || ''}
                        onChange={e => setEditingPlacement({ ...editingPlacement, code: e.target.value })}
                        placeholder="<ins class='adsbygoogle' ...></ins>"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 font-mono"
                      />
                    </div>
                  )}

                  {/* Active Switch */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="edit_active"
                      checked={editingPlacement.enabled}
                      onChange={e => setEditingPlacement({ ...editingPlacement, enabled: e.target.checked })}
                    />
                    <label htmlFor="edit_active" className="font-bold cursor-pointer">
                      Enable this placement on website
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlacement(null)}
                      className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
                    >
                      Save Placement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 10: AD ANALYTICS
          ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Real Advertising Performance Analytics
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Real impressions and clicks tracked across DigiSeekho pages (Local & Supabase telemetry).
            </p>

            {/* Device Performance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase mb-2">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop Performance</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Impressions</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {analytics.by_device.desktop.impressions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Clicks</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {analytics.by_device.desktop.clicks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CTR</span>
                    <span className="font-bold text-emerald-600 text-base">
                      {analytics.by_device.desktop.ctr.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Performance</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Impressions</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {analytics.by_device.mobile.impressions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Clicks</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {analytics.by_device.mobile.clicks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CTR</span>
                    <span className="font-bold text-emerald-600 text-base">
                      {analytics.by_device.mobile.ctr.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance by Placement Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5">Placement Name</th>
                    <th className="py-2.5">Impressions</th>
                    <th className="py-2.5">Clicks</th>
                    <th className="py-2.5">CTR (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {Object.keys(analytics.by_placement).map(key => {
                    const row = analytics.by_placement[key];
                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                          {row.name}
                        </td>
                        <td className="py-2.5 font-mono">{row.impressions}</td>
                        <td className="py-2.5 font-mono">{row.clicks}</td>
                        <td className="py-2.5 font-mono font-bold text-emerald-600">
                          {row.ctr.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 11: ADS SETTINGS & SUPABASE INTEGRATION
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Global Advertisement Configuration
              </h3>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={settings.adsense_publisher_id || ''}
                  onChange={e => setSettings({ ...settings, adsense_publisher_id: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Ad Micro-Label (English)
                </label>
                <input
                  type="text"
                  value={settings.ad_label_en}
                  onChange={e => setSettings({ ...settings, ad_label_en: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Ad Micro-Label (Hindi / हिन्दी)
                </label>
                <input
                  type="text"
                  value={settings.ad_label_hi}
                  onChange={e => setSettings({ ...settings, ad_label_hi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_ads_enabled}
                    onChange={e => setSettings({ ...settings, auto_ads_enabled: e.target.checked })}
                  />
                  <span className="font-bold">Enable Google Auto-Ads</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Injects Google AdSense auto-placement script in document head
                </span>
              </div>
            </div>
          </form>

          {/* Supabase Database Provisioning & Migration Card */}
          <div className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Supabase PostgreSQL Database Tables
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tables: ad_networks, ad_placements, ad_units, ad_settings, ad_events with RLS.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl overflow-x-auto max-h-60 border border-slate-800">
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                {adService.getSupabaseSQLSchema().slice(0, 1100)}...
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
