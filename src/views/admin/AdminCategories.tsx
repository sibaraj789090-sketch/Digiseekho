import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Edit3, Trash2, ArrowUpDown, FolderTree, Check } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<Category[]>(() => dataService.getCategories());
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [slugEn, setSlugEn] = useState('');
  const [slugHi, setSlugHi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descHi, setDescHi] = useState('');

  const openNewModal = () => {
    setEditingCat(null);
    setNameEn('');
    setNameHi('');
    setSlugEn('');
    setSlugHi('');
    setDescEn('');
    setDescHi('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setNameEn(cat.translations.en.name);
    setNameHi(cat.translations.hi.name);
    setSlugEn(cat.translations.en.slug);
    setSlugHi(cat.translations.hi.slug);
    setDescEn(cat.translations.en.description);
    setDescHi(cat.translations.hi.description);
    setIsModalOpen(true);
  };

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!editingCat && !slugEn) {
      setSlugEn(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleNameHiChange = (val: string) => {
    setNameHi(val);
    if (!editingCat && !slugHi) {
      setSlugHi(val.trim().replace(/\s+/g, '-').toLowerCase());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameHi) {
      showToast('Please provide both English and Hindi names.', 'error');
      return;
    }

    const saved = dataService.saveCategory({
      id: editingCat?.id,
      translations: {
        en: {
          name: nameEn,
          slug: slugEn || `category-${Date.now()}`,
          description: descEn
        },
        hi: {
          name: nameHi,
          slug: slugHi || `category-hi-${Date.now()}`,
          description: descHi
        }
      }
    });

    setCategories(dataService.getCategories());
    setIsModalOpen(false);
    showToast(`Category ${editingCat ? 'updated' : 'created'} successfully!`, 'success');
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      showToast('Cannot delete the last category.', 'error');
      return;
    }
    dataService.deleteCategory(id);
    setCategories(dataService.getCategories());
    showToast('Category deleted successfully.', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Categories ({categories.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize article taxonomies with bilingual URLs and descriptions
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">English Name & Slug</th>
                <th className="py-3 px-4">Hindi Name & Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {cat.translations.en.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      /category/{cat.translations.en.slug}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white font-sans">
                      {cat.translations.hi.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      /hi/category/{cat.translations.hi.slug}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-500 line-clamp-1">
                    {cat.translations.en.description}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Edit Category"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        title="Delete Category"
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingCat ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={e => handleNameEnChange(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    English URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slugEn}
                    onChange={e => setSlugEn(e.target.value)}
                    placeholder="artificial-intelligence"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hindi Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameHi}
                    onChange={e => handleNameHiChange(e.target.value)}
                    placeholder="उदा. आर्टिफिशियल इंटेलिजेंस"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hindi URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slugHi}
                    onChange={e => setSlugHi(e.target.value)}
                    placeholder="artificial-intelligence"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  English Description
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={e => setDescEn(e.target.value)}
                  placeholder="Summary of this category for hub page and meta description..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hindi Description
                </label>
                <textarea
                  rows={2}
                  value={descHi}
                  onChange={e => setDescHi(e.target.value)}
                  placeholder="इस श्रेणी का हिंदी विवरण..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
