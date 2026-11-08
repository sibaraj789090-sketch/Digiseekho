import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface VisitorRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  path: string;
  title: string;
  referrer: string;
  referrerType: 'direct' | 'google' | 'social' | 'referral';
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  language: 'en' | 'hi';
  screenResolution: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
}

export interface DailyVisitorStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "07 Nov", "Today"
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
}

export interface AnalyticsSummary {
  // Primary KPI metrics requested by user
  totalVisitors: number; // Real unique visitors all-time
  totalPageviews: number; // Real total pageviews all-time
  
  dailyVisitors: number; // Real unique visitors today
  dailyPageviews: number; // Real pageviews today
  yesterdayVisitors: number;
  yesterdayPageviews: number;
  
  weeklyVisitors: number; // Real unique visitors last 7 days
  weeklyPageviews: number; // Real pageviews last 7 days
  previousWeekVisitors: number;
  
  monthlyVisitors: number; // Real unique visitors last 30 days
  monthlyPageviews: number; // Real pageviews last 30 days
  previousMonthVisitors: number;

  // Visual & breakdown data
  dailyStats: DailyVisitorStat[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  referrerBreakdown: { type: string; label: string; count: number; percentage: number }[];
  languageBreakdown: { language: string; count: number; percentage: number }[];
  topPages: { path: string; title: string; views: number; uniqueVisitors: number }[];
  recentVisits: VisitorRecord[];
  
  activeNow: number; // Active in last 15 minutes
  firstTrackedAt: string | null;
  lastTrackedAt: string | null;
}

const STORAGE_KEYS = {
  VISITOR_ID: 'dg_visitor_uuid_v1',
  SESSION_ID: 'dg_session_uuid_v1',
  ANALYTICS_DATA: 'digiseekho_real_analytics_v1',
};

// Internal store structure in localStorage
interface StoredAnalytics {
  visits: VisitorRecord[]; // Rolling log of latest visits (up to 1500)
  dailyAggregates: Record<string, {
    pageviews: number;
    uniqueVisitorIds: string[];
    sessionIds: string[];
  }>;
  allTimeUniqueVisitors: string[]; // List of unique visitor UUIDs
  totalPageviewsCount: number;
  firstTrackedAt: string;
  lastTrackedAt: string;
}

function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() - offsetDays);
  }
  return d.toISOString().split('T')[0];
}

function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString(0);
  const yesterday = getTodayDateString(1);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
    return `${parts[2]} ${month}`;
  }
  return dateStr;
}

class AnalyticsService {
  private lastTrackedPath: string = '';
  private lastTrackedTime: number = 0;

  /**
   * Retrieves or initializes a persistent unique visitor ID (UUID)
   */
  getVisitorId(): string {
    try {
      let id = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
      if (!id) {
        id = `vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, id);
      }
      return id;
    } catch {
      return `temp_vis_${Date.now()}`;
    }
  }

  /**
   * Retrieves or initializes a session ID (persists until browser tab/session closes)
   */
  getSessionId(): string {
    try {
      let id = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!id) {
        id = `ses_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
      }
      return id;
    } catch {
      return `temp_ses_${Date.now()}`;
    }
  }

  /**
   * Detects real device type, browser, and operating system from browser navigator
   */
  detectClientDetails(): {
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    resolution: string;
  } {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    // 1. Device Type
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)) {
      device = 'tablet';
    } else if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo)/i.test(ua)) {
      device = 'mobile';
    }

    // 2. Browser
    let browser = 'Browser';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';

    // 3. Operating System
    let os = 'OS';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    // 4. Resolution
    const resolution = typeof window !== 'undefined' && window.screen 
      ? `${window.screen.width}x${window.screen.height}` 
      : 'Unknown';

    return { device, browser, os, resolution };
  }

  /**
   * Categorizes referrer URL
   */
  detectReferrerType(refUrl: string): 'direct' | 'google' | 'social' | 'referral' {
    if (!refUrl || refUrl === 'Direct') return 'direct';
    const lower = refUrl.toLowerCase();
    
    // Internal referrers (same domain)
    if (typeof window !== 'undefined' && lower.includes(window.location.hostname.toLowerCase())) {
      return 'direct';
    }
    
    if (lower.includes('google.') || lower.includes('bing.') || lower.includes('duckduckgo.') || lower.includes('yahoo.')) {
      return 'google';
    }
    
    if (
      lower.includes('twitter.com') || lower.includes('t.co') || lower.includes('x.com') ||
      lower.includes('facebook.com') || lower.includes('instagram.com') ||
      lower.includes('linkedin.com') || lower.includes('youtube.com') ||
      lower.includes('reddit.com') || lower.includes('whatsapp.com') ||
      lower.includes('wa.me') || lower.includes('telegram.org') || lower.includes('t.me')
    ) {
      return 'social';
    }
    
    return 'referral';
  }

  /**
   * Loads raw stored analytics from localStorage
   */
  private getStoredAnalytics(): StoredAnalytics {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ANALYTICS_DATA);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse analytics storage:', e);
    }

    const now = new Date().toISOString();
    return {
      visits: [],
      dailyAggregates: {},
      allTimeUniqueVisitors: [],
      totalPageviewsCount: 0,
      firstTrackedAt: now,
      lastTrackedAt: now,
    };
  }

  /**
   * Saves updated analytics store
   */
  private saveStoredAnalytics(data: StoredAnalytics): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS_DATA, JSON.stringify(data));
      // Notify active admin tabs in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digiseekho:analytics_update'));
      }
    } catch (e) {
      console.error('Failed to save analytics storage:', e);
    }
  }

  /**
   * Real Pageview Tracker:
   * Called whenever a real visitor views a public page.
   * Completely ignores /admin routes to avoid polluting real visitor metrics.
   */
  trackPageView(path: string, pageTitle?: string, language?: 'en' | 'hi'): void {
    // 1. Guard against admin panel paths
    if (!path || path.startsWith('/admin') || path.startsWith('/api') || path === '/robots.txt' || path === '/sitemap.xml') {
      return;
    }

    // 2. Debounce duplicate requests (same path within 1.5s on rapid re-renders)
    const nowMs = Date.now();
    if (this.lastTrackedPath === path && nowMs - this.lastTrackedTime < 1500) {
      return;
    }
    this.lastTrackedPath = path;
    this.lastTrackedTime = nowMs;

    const visitorId = this.getVisitorId();
    const sessionId = this.getSessionId();
    const { device, browser, os, resolution } = this.detectClientDetails();
    
    const referrerRaw = typeof document !== 'undefined' && document.referrer ? document.referrer : 'Direct';
    const referrerType = this.detectReferrerType(referrerRaw);
    const resolvedLanguage = language || (path.startsWith('/hi') ? 'hi' : 'en');
    const resolvedTitle = pageTitle || (typeof document !== 'undefined' ? document.title : path);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const record: VisitorRecord = {
      id: `rec_${nowMs}_${Math.random().toString(36).substring(2, 6)}`,
      visitorId,
      sessionId,
      path,
      title: resolvedTitle,
      referrer: referrerRaw,
      referrerType,
      device,
      browser,
      os,
      language: resolvedLanguage,
      screenResolution: resolution,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr
    };

    // 3. Update Local Storage Analytics
    const store = this.getStoredAnalytics();
    
    // Add to visits list (capped at 1500)
    store.visits.unshift(record);
    if (store.visits.length > 1500) {
      store.visits = store.visits.slice(0, 1500);
    }

    // Increment all-time count
    store.totalPageviewsCount = (store.totalPageviewsCount || 0) + 1;
    if (!store.allTimeUniqueVisitors) {
      store.allTimeUniqueVisitors = [];
    }
    if (!store.allTimeUniqueVisitors.includes(visitorId)) {
      store.allTimeUniqueVisitors.push(visitorId);
    }

    // Update daily aggregate
    if (!store.dailyAggregates) {
      store.dailyAggregates = {};
    }
    if (!store.dailyAggregates[dateStr]) {
      store.dailyAggregates[dateStr] = {
        pageviews: 0,
        uniqueVisitorIds: [],
        sessionIds: []
      };
    }
    const dayStat = store.dailyAggregates[dateStr];
    dayStat.pageviews += 1;
    if (!dayStat.uniqueVisitorIds.includes(visitorId)) {
      dayStat.uniqueVisitorIds.push(visitorId);
    }
    if (!dayStat.sessionIds.includes(sessionId)) {
      dayStat.sessionIds.push(sessionId);
    }

    store.lastTrackedAt = now.toISOString();
    this.saveStoredAnalytics(store);

    // 4. If Supabase is connected, asynchronously record to Cloud PostgreSQL
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      const supabaseInsertPromise = supabase.from('page_visits').insert({
        visitor_id: visitorId,
        session_id: sessionId,
        path,
        title: resolvedTitle,
        referrer: referrerRaw,
        referrer_type: referrerType,
        device,
        browser,
        os,
        language: resolvedLanguage
      });
      Promise.resolve(supabaseInsertPromise)
        .then(result => {
          if (result && result.error) {
            console.debug('Supabase visitor log note:', result.error.message);
          }
        })
        .catch(() => {
          // Ignore offline network errors
        });
    }
  }

  /**
   * Computes clean, real analytics statistics for Total, Daily, Weekly, and Monthly
   */
  getAnalyticsSummary(): AnalyticsSummary {
    const store = this.getStoredAnalytics();
    const today = getTodayDateString(0);
    const yesterday = getTodayDateString(1);

    const now = Date.now();
    const fifteenMinAgo = now - 15 * 60 * 1000;

    // 1. All-Time Metrics
    const totalVisitors = store.allTimeUniqueVisitors ? store.allTimeUniqueVisitors.length : 0;
    const totalPageviews = store.totalPageviewsCount || store.visits.length;

    // 2. Daily (Today) Metrics
    const todayAgg = store.dailyAggregates[today];
    const dailyVisitors = todayAgg ? todayAgg.uniqueVisitorIds.length : 0;
    const dailyPageviews = todayAgg ? todayAgg.pageviews : 0;

    const yesterdayAgg = store.dailyAggregates[yesterday];
    const yesterdayVisitors = yesterdayAgg ? yesterdayAgg.uniqueVisitorIds.length : 0;
    const yesterdayPageviews = yesterdayAgg ? yesterdayAgg.pageviews : 0;

    // 3. Weekly (Last 7 Days) Metrics
    const last7DaysDates: string[] = [];
    const prev7DaysDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      last7DaysDates.push(getTodayDateString(i));
    }
    for (let i = 7; i < 14; i++) {
      prev7DaysDates.push(getTodayDateString(i));
    }

    const weeklyVisitorSet = new Set<string>();
    let weeklyPageviews = 0;
    last7DaysDates.forEach(d => {
      const agg = store.dailyAggregates[d];
      if (agg) {
        weeklyPageviews += agg.pageviews;
        agg.uniqueVisitorIds.forEach(id => weeklyVisitorSet.add(id));
      }
    });
    const weeklyVisitors = weeklyVisitorSet.size;

    const prevWeekVisitorSet = new Set<string>();
    prev7DaysDates.forEach(d => {
      const agg = store.dailyAggregates[d];
      if (agg) {
        agg.uniqueVisitorIds.forEach(id => prevWeekVisitorSet.add(id));
      }
    });
    const previousWeekVisitors = prevWeekVisitorSet.size;

    // 4. Monthly (Last 30 Days) Metrics
    const last30DaysDates: string[] = [];
    const prev30DaysDates: string[] = [];
    for (let i = 0; i < 30; i++) {
      last30DaysDates.push(getTodayDateString(i));
    }
    for (let i = 30; i < 60; i++) {
      prev30DaysDates.push(getTodayDateString(i));
    }

    const monthlyVisitorSet = new Set<string>();
    let monthlyPageviews = 0;
    last30DaysDates.forEach(d => {
      const agg = store.dailyAggregates[d];
      if (agg) {
        monthlyPageviews += agg.pageviews;
        agg.uniqueVisitorIds.forEach(id => monthlyVisitorSet.add(id));
      }
    });
    const monthlyVisitors = monthlyVisitorSet.size;

    const prevMonthVisitorSet = new Set<string>();
    prev30DaysDates.forEach(d => {
      const agg = store.dailyAggregates[d];
      if (agg) {
        agg.uniqueVisitorIds.forEach(id => prevMonthVisitorSet.add(id));
      }
    });
    const previousMonthVisitors = prevMonthVisitorSet.size;

    // 5. Daily Series for Chart (last 14 days, chronological)
    const dailyStats: DailyVisitorStat[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = getTodayDateString(i);
      const agg = store.dailyAggregates[d];
      dailyStats.push({
        date: d,
        dayLabel: formatDateLabel(d),
        pageviews: agg ? agg.pageviews : 0,
        uniqueVisitors: agg ? agg.uniqueVisitorIds.length : 0,
        sessions: agg ? agg.sessionIds.length : 0
      });
    }

    // 6. Device Breakdown
    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    store.visits.forEach(v => {
      if (deviceCounts[v.device] !== undefined) {
        deviceCounts[v.device]++;
      } else {
        deviceCounts.desktop++;
      }
    });
    const totalTrackedVisits = store.visits.length || 1;
    const deviceBreakdown = [
      {
        device: 'Desktop',
        count: deviceCounts.desktop,
        percentage: Math.round((deviceCounts.desktop / totalTrackedVisits) * 100)
      },
      {
        device: 'Mobile',
        count: deviceCounts.mobile,
        percentage: Math.round((deviceCounts.mobile / totalTrackedVisits) * 100)
      },
      {
        device: 'Tablet',
        count: deviceCounts.tablet,
        percentage: Math.round((deviceCounts.tablet / totalTrackedVisits) * 100)
      }
    ];

    // 7. Referrer Breakdown
    const refCounts: Record<string, number> = { direct: 0, google: 0, social: 0, referral: 0 };
    store.visits.forEach(v => {
      if (refCounts[v.referrerType] !== undefined) {
        refCounts[v.referrerType]++;
      } else {
        refCounts.direct++;
      }
    });
    const referrerBreakdown = [
      { type: 'direct', label: 'Direct / Bookmarks', count: refCounts.direct, percentage: Math.round((refCounts.direct / totalTrackedVisits) * 100) },
      { type: 'google', label: 'Google Search', count: refCounts.google, percentage: Math.round((refCounts.google / totalTrackedVisits) * 100) },
      { type: 'social', label: 'Social Media', count: refCounts.social, percentage: Math.round((refCounts.social / totalTrackedVisits) * 100) },
      { type: 'referral', label: 'Referral Sites', count: refCounts.referral, percentage: Math.round((refCounts.referral / totalTrackedVisits) * 100) }
    ];

    // 8. Language Breakdown (English vs Hindi readers)
    let enCount = 0;
    let hiCount = 0;
    store.visits.forEach(v => {
      if (v.language === 'hi') hiCount++;
      else enCount++;
    });
    const languageBreakdown = [
      { language: 'English Readers', count: enCount, percentage: Math.round((enCount / totalTrackedVisits) * 100) },
      { language: 'Hindi Readers (हिन्दी)', count: hiCount, percentage: Math.round((hiCount / totalTrackedVisits) * 100) }
    ];

    // 9. Top Pages
    const pageMap: Record<string, { title: string; views: number; visitorIds: Set<string> }> = {};
    store.visits.forEach(v => {
      if (!pageMap[v.path]) {
        pageMap[v.path] = {
          title: v.title || v.path,
          views: 0,
          visitorIds: new Set<string>()
        };
      }
      pageMap[v.path].views++;
      pageMap[v.path].visitorIds.add(v.visitorId);
    });

    const topPages = Object.entries(pageMap)
      .map(([path, data]) => ({
        path,
        title: data.title,
        views: data.views,
        uniqueVisitors: data.visitorIds.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 10. Active in last 15 minutes
    const activeVisitorsSet = new Set<string>();
    store.visits.forEach(v => {
      const vTime = new Date(v.timestamp).getTime();
      if (vTime >= fifteenMinAgo) {
        activeVisitorsSet.add(v.visitorId);
      }
    });

    return {
      totalVisitors,
      totalPageviews,
      dailyVisitors,
      dailyPageviews,
      yesterdayVisitors,
      yesterdayPageviews,
      weeklyVisitors,
      weeklyPageviews,
      previousWeekVisitors,
      monthlyVisitors,
      monthlyPageviews,
      previousMonthVisitors,
      dailyStats,
      deviceBreakdown,
      referrerBreakdown,
      languageBreakdown,
      topPages,
      recentVisits: store.visits.slice(0, 40),
      activeNow: activeVisitorsSet.size,
      firstTrackedAt: store.firstTrackedAt || null,
      lastTrackedAt: store.lastTrackedAt || null
    };
  }

  /**
   * Resets all analytics data (clears test visits)
   */
  clearAnalyticsData(): void {
    const now = new Date().toISOString();
    const fresh: StoredAnalytics = {
      visits: [],
      dailyAggregates: {},
      allTimeUniqueVisitors: [],
      totalPageviewsCount: 0,
      firstTrackedAt: now,
      lastTrackedAt: now
    };
    this.saveStoredAnalytics(fresh);
  }

  /**
   * Generates and downloads a CSV export of all recorded real visits
   */
  exportAnalyticsCSV(): void {
    const store = this.getStoredAnalytics();
    if (!store.visits || store.visits.length === 0) {
      alert('No real visitor records found to export yet.');
      return;
    }

    const headers = ['Visit ID', 'Visitor UUID', 'Session ID', 'Date', 'Time', 'Page Path', 'Page Title', 'Language', 'Device', 'Browser', 'OS', 'Resolution', 'Referrer Type', 'Referrer URL'];
    const rows = store.visits.map(v => [
      v.id,
      v.visitorId,
      v.sessionId,
      v.date,
      v.time,
      `"${(v.path || '').replace(/"/g, '""')}"`,
      `"${(v.title || '').replace(/"/g, '""')}"`,
      v.language,
      v.device,
      v.browser,
      v.os,
      v.screenResolution,
      v.referrerType,
      `"${(v.referrer || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digiseekho_real_visitors_${getTodayDateString(0)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const analyticsService = new AnalyticsService();
