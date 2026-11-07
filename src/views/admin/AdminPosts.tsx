import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { Post, Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';

interface AdminPostsProps {
  onSelectSection: (section: string, param?: string) => void;
  onNavigateHome: () => void;
}

export const AdminPosts: React.FC<AdminPostsProps> = ({ onSelectSection, onNavigateHome }) => {
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const posts = dataService.getPosts();
  const categories = dataService.getCategories();

  const filteredPosts = posts.filter(p => {
    const matchesSearch = !searchTerm || (
      p.translations.en.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.translations.hi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.translations.en.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (id: string) => {
    dataService.deletePost(id);
    setDeleteConfirmId(null);
    showToast('Article deleted successfully', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            All Articles ({posts.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage, edit, schedule, and review bilingual publications
          </p>
        </div>

        <button
          onClick={() => onSelectSection('new-post')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, keywords or slug..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.translations.en.name}
            </option>
          ))}
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => {
                  const cat = categories.find(c => c.id === post.category_id);
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-sm">
                          {post.translations.en.title}
                        </div>
                        <div className="text-slate-400 line-clamp-1 max-w-sm font-sans mt-0.5">
                          {post.translations.hi.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          /blog/{post.translations.en.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {cat ? cat.translations.en.name : 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          post.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {post.views_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectSection('edit-post', post.id)}
                            title="Edit Article"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/blog/${post.translations.en.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Public Link"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            title="Delete Article"
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No articles found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Article</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete this article and all of its translations? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
