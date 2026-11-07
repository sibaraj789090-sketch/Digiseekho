import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Tag as TagIcon,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Search,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Database,
  Moon,
  Sun,
  Shield,
  Layers,
  Share2,
  DollarSign
} from 'lucide-react';

interface AdminLayoutProps {
  currentSection: string;
  onSelectSection: (section: string, param?: string) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onNavigateHome,
  children
}) => {
  const { logoutAdmin, adminUser, theme, toggleTheme } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'All Posts', icon: FileText },
    { id: 'new-post', label: 'Add New Post', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'tags', label: 'Tags', icon: TagIcon },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'seo', label: 'SEO Settings', icon: Search },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'banner', label: 'Homepage Banner', icon: ImageIcon },
    { id: 'social', label: 'Social Media Links', icon: Share2 },
    { id: 'ads', label: 'Ads Management', icon: DollarSign },
    { id: 'navigation', label: 'Navigation Menu', icon: Layers },
    { id: 'supabase', label: 'Supabase Database', icon: Database },
  ];

  const handleSelect = (id: string) => {
    onSelectSection(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => handleSelect('dashboard')}
          className="font-extrabold text-lg text-slate-900 dark:text-white"
        >
          DigiSeekho <span className="text-indigo-600 text-xs uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-200 dark:border-indigo-800">Admin</span>
        </button>
        <button
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white dark:bg-[#0b1329] border-r border-slate-200 dark:border-slate-800 shrink-0 md:min-h-screen flex flex-col justify-between`}
      >
        <div>
          {/* Brand & Status */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                DigiSeekho
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                PRO CMS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Bilingual Publishing Suite</p>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={adminUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                alt={adminUser.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {adminUser.full_name || 'Raj Siba'}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate max-w-[120px]" title={adminUser.email}>
                  {adminUser.email}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={onNavigateHome}
              className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Live Site</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-2.5 py-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
