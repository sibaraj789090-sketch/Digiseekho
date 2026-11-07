import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { Comment } from '../../types';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Check, X, Trash2, Filter } from 'lucide-react';

export const AdminComments: React.FC = () => {
  const { showToast } = useApp();
  const [comments, setComments] = useState<Comment[]>(() => dataService.getComments());
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const filteredComments = comments.filter(c => filter === 'all' || c.status === filter);

  const handleUpdateStatus = (id: string, status: 'approved' | 'pending' | 'rejected') => {
    dataService.updateCommentStatus(id, status);
    setComments(dataService.getComments());
    showToast(`Comment marked as ${status}`, 'info');
  };

  const handleDelete = (id: string) => {
    dataService.deleteComment(id);
    setComments(dataService.getComments());
    showToast('Comment deleted', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Comments Moderation ({comments.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, or reject public feedback submitted by readers
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          {(['all', 'approved', 'pending', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map(c => {
            const post = dataService.getPostById(c.post_id);
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.author_name}
                    </span>
                    <span className="text-slate-400">({c.author_email})</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      c.status === 'approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : c.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {c.content}
                  </p>

                  {post && (
                    <div className="text-[11px] text-slate-400 pt-1">
                      On article:{' '}
                      <a
                        href={`/blog/${post.translations.en.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {post.translations.en.title}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {c.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'approved')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'rejected')}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No comments found in this category.
          </div>
        )}
      </div>

    </div>
  );
};
