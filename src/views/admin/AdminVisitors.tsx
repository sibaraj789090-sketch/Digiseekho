import React, { useState, useEffect } from 'react';
import { analyticsService, AnalyticsSummary, VisitorRecord } from '../../lib/analyticsService';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  Eye, 
  ArrowUpRight, 
  CheckCircle2,
  AlertTriangle,
  Compass,
  Layers
} from 'lucide-react';

interface AdminVisitorsProps {
  onNavigateHome: () => void;
}

export const AdminVisitors: React.FC<AdminVisitorsProps> = ({ onNavigateHome }) => {
  const { showToast } = useApp();
  const [summary, setSummary] = useState<AnalyticsSummary>(() => analyticsService.getAnalyticsSummary());
  const [selectedChartMetric, setSelectedChartMetric] = useState<'visitors' | 'pageviews'>('visitors');
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'stream' | 'sources'>('overview');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    setSummary(analyticsService.getAnalyticsSummary());
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    // Listen for live pageview events in real-time
    const handleUpdate = () => {
      setSummary(analyticsService.getAnalyticsSummary());
    };
    window.addEventListener('digiseekho:analytics_update', handleUpdate);
    // Poll every 10 seconds for active visitor counts
    const interval = setInterval(loadData, 10000);
    return () => {
      window.removeEventListener('digiseekho:analytics_update', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleExport = () => {
    analyticsService.exportAnalyticsCSV();
    showToast('Real visitor analytics exported to CSV!', 'success');
  };

  const handleClear = () => {
    analyticsService.clearAnalyticsData();
    loadData();
    setClearConfirmOpen(false);
    showToast('Visitor analytics data cleared. Ready for new traffic tracking.', 'info');
  };

  const handleTestVisit = () => {
    window.open('/', '_blank');
    showToast('Opened public site in new tab. Your real visit will be recorded!', 'info');
  };

  // Find max value in daily chart for scale
  const maxChartVal = Math.max(
    ...summary.dailyStats.map(d => selectedChartMetric === 'visitors' ? d.uniqueVisitors : d.pageviews),
    5
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real Visitor Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real Traffic Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            100% authentic, verified human visitor telemetry • Zero bot simulations or fabricated statistics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 bg-white dark:bg-[#0f172a] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Refresh Real-time Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleTestVisit}
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Open blog in new tab to test live tracking"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Visit in New Tab</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setClearConfirmOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Reset / Clear Visitor Analytics"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Core KPI Cards: TOTAL, DAILY, WEEKLY, MONTHLY (Direct User Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Visitors */}
        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Real Visitors
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {summary.totalVisitors.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{summary.totalPageviews.toLocaleString()} Total Pageviews</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">All-Time</span>
          </div>
        </div>

        {/* Daily Visitors (Today) */}
        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none rounded-bl-full" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Visitors (Today)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {summary.dailyVisitors.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{summary.dailyPageviews.toLocaleString()} Views Today</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Yesterday: {summary.yesterdayVisitors}
            </span>
          </div>
        </div>

        {/* Weekly Visitors (Last 7 Days) */}
        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-bl-full" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Weekly Visitors (7 Days)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {summary.weeklyVisitors.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{summary.weeklyPageviews.toLocaleString()} Views This Week</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">7-Day Rolling</span>
          </div>
        </div>

        {/* Monthly Visitors (Last 30 Days) */}
        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Visitors (30 Days)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {summary.monthlyVisitors.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{summary.monthlyPageviews.toLocaleString()} Views (30d)</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">30-Day Total</span>
          </div>
        </div>

      </div>

      {/* 3. Real Traffic Trend: Visual Histogram / Bar Chart */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Real Visitor Activity (Past 14 Days)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unique device visitors and pageviews registered on public routes
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedChartMetric('visitors')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedChartMetric === 'visitors'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Unique Visitors
            </button>
            <button
              onClick={() => setSelectedChartMetric('pageviews')}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedChartMetric === 'pageviews'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Total Pageviews
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-200 dark:border-slate-800">
            {summary.dailyStats.map((stat, idx) => {
              const val = selectedChartMetric === 'visitors' ? stat.uniqueVisitors : stat.pageviews;
              const heightPercent = Math.max(8, Math.round((val / maxChartVal) * 100));
              const isToday = stat.dayLabel === 'Today';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-mono rounded px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap">
                    <div className="font-bold">{stat.date}</div>
                    <div>{val} {selectedChartMetric === 'visitors' ? 'Visitors' : 'Views'}</div>
                  </div>

                  {/* Value on top of bar if > 0 */}
                  <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </span>

                  {/* Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : val > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-cyan-400'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between gap-2 sm:gap-3 px-2 pt-2 text-[10px] text-slate-400 font-mono">
            {summary.dailyStats.map((stat, idx) => (
              <div key={idx} className="flex-1 text-center truncate">
                {stat.dayLabel}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Deep Insights: Device Breakdown, Top Visited Pages, and Traffic Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Breakdown */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span>Device Types</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {summary.totalPageviews} total
              </span>
            </div>

            <div className="space-y-4">
              {summary.deviceBreakdown.map(item => {
                const Icon = item.device === 'Mobile' ? Smartphone : item.device === 'Tablet' ? Tablet : Monitor;
                return (
                  <div key={item.device} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.device}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
                        <span>{item.count} visits</span>
                        <span className="font-bold text-slate-900 dark:text-white">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className={`h-full rounded-full ${
                          item.device === 'Mobile' 
                            ? 'bg-emerald-500' 
                            : item.device === 'Desktop' 
                            ? 'bg-indigo-600' 
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reader Language */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Reader Language</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {summary.languageBreakdown.map(l => (
                <div key={l.language} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{l.language}</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {l.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400">{l.count} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Visited Pages & Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Top Visited Pages & Articles</span>
              </h3>
              <span className="text-xs text-slate-400">Real unique view counts</span>
            </div>

            {summary.topPages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <tr>
                      <th className="py-2.5 px-3">Page Title & Path</th>
                      <th className="py-2.5 px-3 text-right">Views</th>
                      <th className="py-2.5 px-3 text-right">Unique</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {summary.topPages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-md">
                            {page.title}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 truncate max-w-sm">
                            {page.path}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {page.views}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {page.uniqueVisitors}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-indigo-600 inline-block"
                            title="Visit Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No page visits recorded yet. Open the website or articles in another tab to record traffic!
              </div>
            )}
          </div>

          {/* Traffic Sources Strip */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Traffic Sources Breakdown</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {summary.referrerBreakdown.map(ref => (
                <div key={ref.type} className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-[11px] text-slate-400 truncate">{ref.label}</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {ref.count} <span className="text-[10px] font-normal text-slate-400">({ref.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Live Real Visitor Stream Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Live Real Visitor Stream</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recent authentic page hits recorded chronologically
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-500">
              Showing {summary.recentVisits.length} latest real events
            </span>
          </div>
        </div>

        {summary.recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                <tr>
                  <th className="py-3 px-4">Timestamp & Date</th>
                  <th className="py-3 px-4">Page Visited</th>
                  <th className="py-3 px-4">Device & Client</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Traffic Source</th>
                  <th className="py-3 px-4 text-right">Visitor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {summary.recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {visit.time}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {visit.date}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-xs" title={visit.title}>
                        {visit.title}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                        {visit.path}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        {visit.device === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                        ) : visit.device === 'tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                        )}
                        <span className="capitalize">{visit.device}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span>{visit.browser}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {visit.os} • {visit.screenResolution}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        visit.language === 'hi'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {visit.language === 'hi' ? 'हिन्दी (HI)' : 'English (EN)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {visit.referrerType}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={visit.referrer}>
                        {visit.referrer}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {visit.visitorId.slice(0, 14)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No real visitor events recorded yet.</p>
            <p>Every time readers browse the blog or articles, visits are recorded here live.</p>
          </div>
        )}
      </div>

      {/* 6. Real Visitor Assurance Info Note */}
      <div className="p-5 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs border border-indigo-100 dark:border-indigo-800">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            How DigiSeekho Real Visitor Analytics Works
          </div>
          <p>
            This tracker operates exclusively on authentic user device navigation. Every entry corresponds to an actual human pageview, tracked using a privacy-compliant unique client identifier (`visitor_id`) with session deduplication.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Admin operations within <code>/admin/*</code> are automatically excluded to preserve data integrity. If Supabase is connected, records also synchronize to the <code>public.page_visits</code> database table.
          </p>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Clear Analytics Data?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This will reset all recorded real visitor logs and daily telemetry counters to start fresh. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClearConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
