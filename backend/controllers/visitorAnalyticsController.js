// controllers/visitorAnalyticsController.js
import mongoose from 'mongoose';
import VisitorSession from '../models/visitorSessionModel.js';
import PageView from '../models/pageViewModel.js';

// A session counts as "live" while it has been seen inside this window. The
// storefront heartbeats every 30s while the tab is visible, so this tolerates
// six missed beats before a visitor drops off the live list.
const LIVE_WINDOW_MS = 3 * 60 * 1000;

const RANGES = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

const rangeStart = (range = '7d') => {
  if (range === 'all') return new Date(0);
  const span = RANGES[range] || RANGES['7d'];
  return new Date(Date.now() - span);
};

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);

// ── User-agent parsing ───────────────────────────────────────────────────────
// Deliberately small and dependency-free. It only has to be good enough to
// segment traffic in the dashboard, not to be a full UA database.

const BOT_PATTERN = /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|axios|node-fetch|postman/i;

const parseBrowser = (ua) => {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\/|crios/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  if (/msie|trident/i.test(ua)) return 'Internet Explorer';
  return 'Unknown';
};

const parseOs = (ua) => {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
};

const parseDevice = (ua) => {
  if (BOT_PATTERN.test(ua)) return 'bot';
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
};

// ── Referrer classification ──────────────────────────────────────────────────

const SEARCH_HOSTS = /google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|baidu\.|ecosia\.|brave\./i;
const SOCIAL_HOSTS = /facebook\.|instagram\.|twitter\.|x\.com|linkedin\.|pinterest\.|tiktok\.|reddit\.|youtube\.|t\.co|snapchat\./i;

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
};

const classifySource = (referrerHost, utm, siteHost) => {
  if (utm?.source) return 'campaign';
  if (!referrerHost) return 'direct';
  if (siteHost && referrerHost === siteHost) return 'direct';
  if (SEARCH_HOSTS.test(referrerHost)) return 'search';
  if (SOCIAL_HOSTS.test(referrerHost)) return 'social';
  return 'referral';
};

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
};

// ── Collection (public) ──────────────────────────────────────────────────────

/**
 * POST /api/v1/visitor-analytics/collect
 *
 * Accepts three event types from the storefront tracker:
 *   pageview   — a route was opened
 *   heartbeat  — the tab is still open and visible
 *   leave      — the tab is closing (sent via sendBeacon, so it may be lost)
 *   identify   — the visitor just became known (signed in, or an email was
 *                captured from a form). Names the current session and every
 *                earlier anonymous session from the same browser.
 *
 * Always replies 204 with no body. Tracking must never surface an error to a
 * shopper, and a failed beacon is not worth a retry.
 */
export const collectVisitorEvent = async (req, res) => {
  // Respond immediately — the write happens after, and its outcome does not
  // change what the browser sees.
  res.status(204).end();

  try {
    const {
      type = 'pageview',
      sessionId,
      visitorId,
      path,
      title,
      referrer,
      userId,
      name,
      email,
      screen,
      language,
      timezone,
      utm,
      isReturning,
      secondsOnPage,
    } = req.body || {};

    if (!sessionId || !visitorId) return;

    const userAgent = clean(req.headers['user-agent'] || '', 400);
    const device = parseDevice(userAgent);
    const now = new Date();

    if (type === 'identify') {
      const identity = {};
      if (name) identity.name = clean(name, 120);
      if (email) identity.email = clean(email, 160);
      if (mongoose.isValidObjectId(userId)) identity.userId = userId;
      if (!Object.keys(identity).length) return;

      // Name this session outright...
      await VisitorSession.updateOne({ sessionId }, { $set: identity });

      // ...and back-fill the visitor's earlier sessions, which were recorded
      // before anyone knew who they were. Only sessions with no identity yet,
      // so a shared browser never overwrites a different person's name.
      await VisitorSession.updateMany(
        { visitorId, sessionId: { $ne: sessionId }, name: '' },
        { $set: identity }
      );
      return;
    }

    if (type === 'heartbeat' || type === 'leave') {
      const session = await VisitorSession.findOne({ sessionId });
      if (!session) return;

      session.lastSeenAt = now;
      session.durationSeconds = Math.max(0, Math.round((now - session.startedAt) / 1000));
      if (path) {
        session.currentPage = clean(path, 300);
        session.exitPage = clean(path, 300);
      }
      await session.save();

      if (type === 'leave' && Number(secondsOnPage) > 0) {
        const last = await PageView.findOne({ sessionId }).sort({ viewedAt: -1 });
        if (last && !last.secondsOnPage) {
          last.secondsOnPage = Math.min(3600, Math.round(Number(secondsOnPage)));
          await last.save();
        }
      }
      return;
    }

    // ── pageview ──
    const safePath = clean(path || '/', 300);
    const referrerUrl = clean(referrer || '', 500);
    const referrerHost = hostOf(referrerUrl);
    const siteHost = hostOf(req.headers.origin || req.headers.referer || '');

    let session = await VisitorSession.findOne({ sessionId });

    if (!session) {
      session = new VisitorSession({
        sessionId: clean(sessionId, 100),
        visitorId: clean(visitorId, 100),
        userId: mongoose.isValidObjectId(userId) ? userId : null,
        name: clean(name, 120),
        email: clean(email, 160),
        startedAt: now,
        lastSeenAt: now,
        entryPage: safePath,
        currentPage: safePath,
        exitPage: safePath,
        referrer: referrerHost && referrerHost !== siteHost ? referrerUrl : '',
        referrerHost: referrerHost === siteHost ? '' : referrerHost,
        landingSource: classifySource(referrerHost, utm, siteHost),
        utm: {
          source: clean(utm?.source, 120),
          medium: clean(utm?.medium, 120),
          campaign: clean(utm?.campaign, 120),
        },
        userAgent,
        browser: parseBrowser(userAgent),
        os: parseOs(userAgent),
        device,
        screen: clean(screen, 40),
        language: clean(language, 40),
        timezone: clean(timezone, 80),
        ip: clean(clientIp(req), 60),
        isBot: device === 'bot',
        isReturning: Boolean(isReturning),
        pageCount: 0,
      });
    }

    // Close out the previous page's time before recording the new one.
    const previous = await PageView.findOne({ sessionId }).sort({ viewedAt: -1 });
    if (previous && !previous.secondsOnPage) {
      previous.secondsOnPage = Math.min(3600, Math.max(0, Math.round((now - previous.viewedAt) / 1000)));
      await previous.save();
    }

    session.pageCount += 1;
    session.currentPage = safePath;
    session.exitPage = safePath;
    session.lastSeenAt = now;
    session.durationSeconds = Math.max(0, Math.round((now - session.startedAt) / 1000));

    // A visitor can sign in mid-session — adopt the identity when it appears.
    if (name && !session.name) session.name = clean(name, 120);
    if (email && !session.email) session.email = clean(email, 160);
    if (!session.userId && mongoose.isValidObjectId(userId)) session.userId = userId;

    await session.save();

    await PageView.create({
      sessionId: session.sessionId,
      visitorId: session.visitorId,
      path: safePath,
      title: clean(title, 250),
      referrer: referrerUrl,
      viewedAt: now,
      sequence: session.pageCount,
      isBot: session.isBot,
    });
  } catch (error) {
    console.error('Visitor analytics collect error:', error.message);
  }
};

// ── Reporting (admin) ────────────────────────────────────────────────────────

const baseFilter = (req) => {
  const filter = { startedAt: { $gte: rangeStart(req.query.range) } };
  if (req.query.includeBots !== 'true') filter.isBot = false;
  return filter;
};

// GET /api/v1/visitor-analytics/overview?range=7d
export const getVisitorOverview = async (req, res) => {
  try {
    const filter = baseFilter(req);
    const liveSince = new Date(Date.now() - LIVE_WINDOW_MS);

    const [totals, liveCount, uniqueVisitors, deviceSplit, sourceSplit, topPages, timeseries] = await Promise.all([
      VisitorSession.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            sessions: { $sum: 1 },
            pageViews: { $sum: '$pageCount' },
            totalDuration: { $sum: '$durationSeconds' },
            bounces: { $sum: { $cond: [{ $lte: ['$pageCount', 1] }, 1, 0] } },
            returning: { $sum: { $cond: ['$isReturning', 1, 0] } },
          },
        },
      ]),
      VisitorSession.countDocuments({ lastSeenAt: { $gte: liveSince }, isBot: false }),
      VisitorSession.distinct('visitorId', filter),
      VisitorSession.aggregate([
        { $match: filter },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      VisitorSession.aggregate([
        { $match: filter },
        { $group: { _id: '$landingSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PageView.aggregate([
        {
          $match: {
            viewedAt: { $gte: rangeStart(req.query.range) },
            ...(req.query.includeBots === 'true' ? {} : { isBot: false }),
          },
        },
        {
          $group: {
            _id: '$path',
            views: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
            avgSeconds: { $avg: '$secondsOnPage' },
          },
        },
        { $project: { path: '$_id', views: 1, visitors: { $size: '$visitors' }, avgSeconds: 1, _id: 0 } },
        { $sort: { views: -1 } },
        { $limit: 12 },
      ]),
      VisitorSession.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
            sessions: { $sum: 1 },
            pageViews: { $sum: '$pageCount' },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { date: '$_id', sessions: 1, pageViews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
    ]);

    const agg = totals[0] || { sessions: 0, pageViews: 0, totalDuration: 0, bounces: 0, returning: 0 };

    res.status(200).json({
      success: true,
      range: req.query.range || '7d',
      overview: {
        liveVisitors: liveCount,
        sessions: agg.sessions,
        uniqueVisitors: uniqueVisitors.length,
        pageViews: agg.pageViews,
        avgPagesPerSession: agg.sessions ? Number((agg.pageViews / agg.sessions).toFixed(2)) : 0,
        avgSessionSeconds: agg.sessions ? Math.round(agg.totalDuration / agg.sessions) : 0,
        bounceRate: agg.sessions ? Math.round((agg.bounces / agg.sessions) * 100) : 0,
        returningRate: agg.sessions ? Math.round((agg.returning / agg.sessions) * 100) : 0,
      },
      devices: deviceSplit.map((item) => ({ label: item._id || 'unknown', count: item.count })),
      sources: sourceSplit.map((item) => ({ label: item._id || 'direct', count: item.count })),
      topPages,
      timeseries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading visitor overview', error: error.message });
  }
};

// GET /api/v1/visitor-analytics/live
export const getLiveVisitors = async (req, res) => {
  try {
    const liveSince = new Date(Date.now() - LIVE_WINDOW_MS);
    const sessions = await VisitorSession.find({ lastSeenAt: { $gte: liveSince }, isBot: false })
      .sort({ lastSeenAt: -1 })
      .limit(200)
      .lean();

    const enriched = await Promise.all(sessions.map(async (session) => {
      const journey = await PageView.find({ sessionId: session.sessionId })
        .sort({ viewedAt: -1 })
        .limit(5)
        .select('path title viewedAt')
        .lean();
      return { ...session, recentPages: journey.reverse() };
    }));

    res.status(200).json({
      success: true,
      liveWindowMinutes: LIVE_WINDOW_MS / 60000,
      count: enriched.length,
      visitors: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading live visitors', error: error.message });
  }
};

// GET /api/v1/visitor-analytics/sessions?range=7d&page=1&limit=25&search=&device=&source=
export const getVisitorSessions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 25));
    const filter = baseFilter(req);

    const search = clean(req.query.search, 120);
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: rx }, { email: rx }, { visitorId: rx },
        { entryPage: rx }, { currentPage: rx }, { referrerHost: rx },
      ];
    }
    if (req.query.device) filter.device = clean(req.query.device, 20);
    if (req.query.source) filter.landingSource = clean(req.query.source, 20);

    const [sessions, total] = await Promise.all([
      VisitorSession.find(filter)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VisitorSession.countDocuments(filter),
    ]);

    const liveSince = Date.now() - LIVE_WINDOW_MS;

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      sessions: sessions.map((session) => ({
        ...session,
        isLive: new Date(session.lastSeenAt).getTime() >= liveSince,
        displayName: session.name || (session.isReturning ? 'Returning visitor' : 'Anonymous visitor'),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading visitor sessions', error: error.message });
  }
};

// GET /api/v1/visitor-analytics/sessions/:sessionId
export const getVisitorSessionDetail = async (req, res) => {
  try {
    const sessionId = clean(req.params.sessionId, 100);
    const session = await VisitorSession.findOne({ sessionId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const [journey, otherSessions] = await Promise.all([
      PageView.find({ sessionId }).sort({ viewedAt: 1 }).lean(),
      VisitorSession.countDocuments({ visitorId: session.visitorId }),
    ]);

    res.status(200).json({
      success: true,
      session: {
        ...session,
        isLive: new Date(session.lastSeenAt).getTime() >= Date.now() - LIVE_WINDOW_MS,
        displayName: session.name || (session.isReturning ? 'Returning visitor' : 'Anonymous visitor'),
        totalSessionsByVisitor: otherSessions,
      },
      journey,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading session detail', error: error.message });
  }
};

// Matches google.com and every regional variant (google.co.uk, google.co.in,
// google.com.au) plus subdomains like news.google.com, while refusing lookalikes
// such as "notgoogle.com" or "google.evil.net".
const GOOGLE_HOST = /(^|\.)google\.[a-z.]{2,6}$/i;

/**
 * GET /api/v1/visitor-analytics/google?range=7d
 *
 * Everything that arrived from Google: which page they landed on, everything they
 * went on to view, and how the traffic trends. Scoped by session rather than by
 * page-view referrer, because after the first click a single-page app reports its
 * own URL as the referrer — only the session remembers where the visit came from.
 */
export const getGoogleTraffic = async (req, res) => {
  try {
    const start = rangeStart(req.query.range);
    const sessionFilter = {
      startedAt: { $gte: start },
      referrerHost: GOOGLE_HOST,
      ...(req.query.includeBots === 'true' ? {} : { isBot: false }),
    };

    const sessions = await VisitorSession.find(sessionFilter)
      .sort({ startedAt: -1 })
      .lean();

    const sessionIds = sessions.map((session) => session.sessionId);

    // A page-view lookup keyed on the session list. Denormalising referrerHost onto
    // PageView would avoid the $in, but it would only describe traffic recorded
    // after the change — this reads correctly against everything already stored.
    const [landingPages, allPages, timeseries] = await Promise.all([
      VisitorSession.aggregate([
        { $match: sessionFilter },
        {
          $group: {
            _id: '$entryPage',
            sessions: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
            bounces: { $sum: { $cond: [{ $lte: ['$pageCount', 1] }, 1, 0] } },
            avgSeconds: { $avg: '$durationSeconds' },
          },
        },
        {
          $project: {
            path: '$_id', sessions: 1, bounces: 1, avgSeconds: 1,
            visitors: { $size: '$visitors' }, _id: 0,
          },
        },
        { $sort: { sessions: -1 } },
        { $limit: 50 },
      ]),
      sessionIds.length
        ? PageView.aggregate([
          { $match: { sessionId: { $in: sessionIds } } },
          {
            $group: {
              _id: '$path',
              views: { $sum: 1 },
              visitors: { $addToSet: '$visitorId' },
              avgSeconds: { $avg: '$secondsOnPage' },
              lastViewedAt: { $max: '$viewedAt' },
            },
          },
          {
            $project: {
              path: '$_id', views: 1, avgSeconds: 1, lastViewedAt: 1,
              visitors: { $size: '$visitors' }, _id: 0,
            },
          },
          { $sort: { views: -1 } },
          { $limit: 100 },
        ])
        : [],
      VisitorSession.aggregate([
        { $match: sessionFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
            sessions: { $sum: 1 },
            pageViews: { $sum: '$pageCount' },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { date: '$_id', sessions: 1, pageViews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
    ]);

    const pageViews = sessions.reduce((sum, session) => sum + (session.pageCount || 0), 0);
    const duration = sessions.reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
    const bounces = sessions.filter((session) => (session.pageCount || 0) <= 1).length;

    // One page, zero seconds, and a brand-new visitor id is not how a person reads a
    // product page. Reported rather than filtered, because the call on whether it is
    // a crawler, a scraper, or a genuine instant bounce belongs to whoever is looking.
    const automated = sessions.filter((session) =>
      (session.pageCount || 0) <= 1
      && (session.durationSeconds || 0) === 0
      && !session.isReturning);

    const byHost = sessions.reduce((acc, session) => {
      const host = session.referrerHost || 'google.com';
      acc[host] = (acc[host] || 0) + 1;
      return acc;
    }, {});

    const liveSince = Date.now() - LIVE_WINDOW_MS;

    res.status(200).json({
      success: true,
      range: req.query.range || '7d',
      summary: {
        sessions: sessions.length,
        uniqueVisitors: new Set(sessions.map((session) => session.visitorId)).size,
        pageViews,
        landingPages: landingPages.length,
        pagesViewed: allPages.length,
        avgPagesPerSession: sessions.length ? Number((pageViews / sessions.length).toFixed(2)) : 0,
        avgSessionSeconds: sessions.length ? Math.round(duration / sessions.length) : 0,
        bounceRate: sessions.length ? Math.round((bounces / sessions.length) * 100) : 0,
        automatedLooking: automated.length,
        automatedRate: sessions.length ? Math.round((automated.length / sessions.length) * 100) : 0,
      },
      hosts: Object.entries(byHost)
        .map(([host, count]) => ({ host, count }))
        .sort((a, b) => b.count - a.count),
      landingPages,
      pages: allPages,
      timeseries,
      recentSessions: sessions.slice(0, 100).map((session) => ({
        sessionId: session.sessionId,
        visitorId: session.visitorId,
        displayName: session.name || (session.isReturning ? 'Returning visitor' : 'Anonymous visitor'),
        email: session.email,
        entryPage: session.entryPage,
        exitPage: session.exitPage,
        pageCount: session.pageCount,
        durationSeconds: session.durationSeconds,
        device: session.device,
        browser: session.browser,
        os: session.os,
        referrerHost: session.referrerHost,
        startedAt: session.startedAt,
        lastSeenAt: session.lastSeenAt,
        isLive: new Date(session.lastSeenAt).getTime() >= liveSince,
        looksAutomated: (session.pageCount || 0) <= 1
          && (session.durationSeconds || 0) === 0
          && !session.isReturning,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading Google traffic', error: error.message });
  }
};

// DELETE /api/v1/visitor-analytics/purge?days=90
export const purgeVisitorData = async (req, res) => {
  try {
    const days = Math.max(1, parseInt(req.query.days, 10) || 90);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [sessions, views] = await Promise.all([
      VisitorSession.deleteMany({ startedAt: { $lt: cutoff } }),
      PageView.deleteMany({ viewedAt: { $lt: cutoff } }),
    ]);

    res.status(200).json({
      success: true,
      message: `Removed visitor data older than ${days} days`,
      deletedSessions: sessions.deletedCount,
      deletedPageViews: views.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error purging visitor data', error: error.message });
  }
};
