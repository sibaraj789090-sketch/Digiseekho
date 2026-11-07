import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { NavigationItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { Layers, PlusCircle, Trash2, Edit3, Save, Check } from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const { showToast } = useApp();
  const [navItems, setNavItems] = useState<NavigationItem[]>(() => dataService.getNavigation());
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Link State
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [urlEn, setUrlEn] = useState('');
  const [urlHi, setUrlHi] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !urlEn) {
      showToast('Please provide Title and URL', 'error');
      return;
    }

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      location: 'header',
      title_en: titleEn,
      title_hi: titleHi || titleEn,
      url_en: urlEn,
      url_hi: urlHi || urlEn,
      order_index: navItems.length + 1,
      is_active: true
    };

    const updated = [...navItems, newItem];
    setNavItems(updated);
    dataService.saveNavigation(updated);
    setTitleEn('');
    setTitleHi('');
    setUrlEn('');
    setUrlHi('');
    showToast('Navigation link added successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    const updated = navItems.filter(item => item.id !== id);
    setNavItems(updated);
    dataService.saveNavigation(updated);
    showToast('Navigation link removed', 'info');
  };

  const handleToggle = (id: string) => {
    const updated = navItems.map(item =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
    setNavItems(updated);
    dataService.saveNavigation(updated);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Navigation Menus
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage header and footer links with bilingual text and target routes
        </p>
      </div>

      {/* Existing Menu Items */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Header Navigation Links
        </div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold">{index + 1}.</span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white mr-2">
                    {item.title_en}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-sans">
                    ({item.title_hi})
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    EN: {item.url_en} · HI: {item.url_hi}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    item.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Link */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Add Navigation Link
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title (English) *
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              placeholder="e.g. AI News"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
              Title (Hindi)
            </label>
            <input
              type="text"
              value={titleHi}
              onChange={e => setTitleHi(e.target.value)}
              placeholder="उदा. एआई समाचार"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              URL (English) *
            </label>
            <input
              type="text"
              required
              value={urlEn}
              onChange={e => setUrlEn(e.target.value)}
              placeholder="/category/..."
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              URL (Hindi)
            </label>
            <input
              type="text"
              value={urlHi}
              onChange={e => setUrlHi(e.target.value)}
              placeholder="/hi/category/..."
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>
      </form>

    </div>
  );
};
