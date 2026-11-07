import React, { useState } from 'react';
import { dataService } from '../../lib/dataService';
import { NewsletterSubscriber } from '../../types';
import { useApp } from '../../context/AppContext';
import { Mail, Download, Search, CheckCircle2, XCircle } from 'lucide-react';

export const AdminSubscribers: React.FC = () => {
  const { showToast } = useApp();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => dataService.getSubscribers());
  const [search, setSearch] = useState('');

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  const handleExportCSV = () => {
    const headers = 'Email,Edition,Status,Subscribed Date\n';
    const rows = subscribers
      .map(s => `${s.email},${s.language},${s.is_active ? 'Active' : 'Unsubscribed'},${s.subscribed_at}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digiseekho_subscribers_${Date.now()}.csv`;
    a.click();
    showToast('Subscribers exported to CSV', 'success');
  };

  const handleToggleStatus = (id: string) => {
    dataService.unsubscribe(id);
    setSubscribers(dataService.getSubscribers());
    showToast('Subscription status updated', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Newsletter Subscribers ({subscribers.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered readers receiving weekly DigiSeekho editorial dispatches
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscribers by email..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Edition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {sub.email}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-mono">
                    {sub.language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      sub.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {sub.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(sub.subscribed_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sub.is_active && (
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className="text-slate-400 hover:text-rose-600 text-[11px] underline"
                      >
                        Unsubscribe
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
