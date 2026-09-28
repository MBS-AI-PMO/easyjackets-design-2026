import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, IconButton, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  LinearProgress, MenuItem, Tooltip, InputAdornment, Avatar,
  TablePagination, Tabs, Tab, FormControlLabel, Switch,
} from '@mui/material';
import {
  People, Search, Refresh, Close, Visibility, Timer, TrendingUp,
  FiberManualRecord, Computer, PhoneAndroid, TabletMac, SmartToy,
  Language, Timeline, DeleteSweep, Person, Search as SearchIcon,
  WarningAmber, Login,
} from '@mui/icons-material';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

const ACCENT = '#37a6ff';
const LIVE_POLL_MS = 15000;

const RANGES = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const DEVICE_ICONS = {
  desktop: <Computer fontSize="small" />,
  mobile: <PhoneAndroid fontSize="small" />,
  tablet: <TabletMac fontSize="small" />,
  bot: <SmartToy fontSize="small" />,
};

const SOURCE_COLORS = {
  direct: '#607d8b',
  search: '#2e7d32',
  social: '#7b1fa2',
  referral: '#0288d1',
  campaign: '#ed6c02',
};

const formatDuration = (seconds) => {
  const value = Math.max(0, Math.round(seconds || 0));
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

const relativeTime = (value) => {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleString();
};

const exactTime = (value) => (value ? new Date(value).toLocaleString() : '—');

const initialsOf = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
};

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#ddd' },
    '&:hover fieldset': { borderColor: ACCENT },
    '&.Mui-focused fieldset': { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

// ── Presentational pieces ────────────────────────────────────────────────────

const StatCard = ({ label, value, caption, color, icon, pulse }) => (
  <Card sx={{ flex: '1 1 180px', minWidth: 170, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
      <Box sx={{
        p: 1.4, borderRadius: 2, bgcolor: `${color}14`, color, display: 'flex',
        ...(pulse ? { animation: 'ej-pulse 2s ease-in-out infinite' } : {}),
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="body2" fontWeight={600} color="#37474f" noWrap>{label}</Typography>
        {caption && <Typography variant="caption" color="text.secondary" noWrap>{caption}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const BreakdownBar = ({ title, items, colorFor }) => {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  return (
    <Card sx={{ flex: '1 1 300px', minWidth: 280, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={800} color="#37474f" mb={2}>{title}</Typography>
        {items.length === 0 && (
          <Typography variant="body2" color="#b0bec5">No data in this range yet.</Typography>
        )}
        {items.map((item) => {
          const percent = Math.round((item.count / total) * 100);
          const color = colorFor(item.label);
          return (
            <Box key={item.label} sx={{ mb: 1.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} color="#455a64" sx={{ textTransform: 'capitalize' }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="#78909c">
                  {item.count} · {percent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={percent}
                sx={{ height: 6, borderRadius: 3, bgcolor: '#eceff1', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

const TrafficChart = ({ data }) => {
  if (!data?.length) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <Timeline sx={{ fontSize: 48, color: '#cfd8dc' }} />
          <Typography variant="body2" color="#b0bec5" mt={1}>
            No traffic recorded in this range yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...data.map((item) => item.pageViews), 1);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#37474f">TRAFFIC OVER TIME</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ color: ACCENT, fontWeight: 700 }}>■ Page views</Typography>
            <Typography variant="caption" sx={{ color: '#b3e5fc', fontWeight: 700 }}>■ Sessions</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 180, overflowX: 'auto', pb: 1 }}>
          {data.map((item) => (
            <Tooltip
              key={item.date}
              arrow
              title={`${item.date} — ${item.pageViews} views, ${item.sessions} sessions, ${item.visitors} visitors`}
            >
              <Box sx={{ flex: '1 0 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 26 }}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: 150 }}>
                  <Box sx={{
                    width: '45%', bgcolor: ACCENT, borderRadius: '3px 3px 0 0',
                    height: `${Math.max(2, (item.pageViews / max) * 100)}%`,
                    transition: 'height .4s ease',
                  }} />
                  <Box sx={{
                    width: '45%', bgcolor: '#b3e5fc', borderRadius: '3px 3px 0 0',
                    height: `${Math.max(2, (item.sessions / max) * 100)}%`,
                    transition: 'height .4s ease',
                  }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#90a4ae', fontSize: 9, whiteSpace: 'nowrap' }}>
                  {item.date.slice(5)}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const VisitorIdentity = ({ session }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
    <Avatar sx={{
      width: 36, height: 36, fontSize: 13, fontWeight: 700,
      bgcolor: session.name ? ACCENT : '#cfd8dc',
      color: session.name ? '#fff' : '#546e7a',
    }}>
      {session.name ? initialsOf(session.name) : <Person fontSize="small" />}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant="body2" fontWeight={700} color="#263238" noWrap>
          {session.displayName}
        </Typography>
        {session.isLive && (
          <FiberManualRecord sx={{ fontSize: 9, color: '#2e7d32', animation: 'ej-pulse 1.6s ease-in-out infinite' }} />
        )}
      </Box>
      <Typography variant="caption" color="#90a4ae" noWrap sx={{ display: 'block' }}>
        {session.email || `Visitor ${session.visitorId.slice(0, 8)}`}
      </Typography>
    </Box>
  </Box>
);

// ── Main component ───────────────────────────────────────────────────────────

const VisitorAnalytics = () => {
  const [tab, setTab] = useState(0);
  const [range, setRange] = useState('7d');
  const [includeBots, setIncludeBots] = useState(false);

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [live, setLive] = useState({ visitors: [], count: 0, liveWindowMinutes: 3 });

  const [sessions, setSessions] = useState([]);
  const [sessionsMeta, setSessionsMeta] = useState({ total: 0, totalPages: 1 });
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [google, setGoogle] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleView, setGoogleView] = useState('landing');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const searchTimer = useRef(null);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const { data } = await instance.get('/visitor-analytics/overview', {
        params: { range, includeBots: includeBots ? 'true' : 'false' },
      });
      setOverview(data);
    } catch (error) {
      console.error('Error loading overview:', error);
      toast.error(error?.response?.data?.message || 'Error loading analytics');
    } finally {
      setOverviewLoading(false);
    }
  }, [range, includeBots]);

  const fetchLive = useCallback(async () => {
    try {
      const { data } = await instance.get('/visitor-analytics/live');
      setLive(data);
    } catch (error) {
      // Live polling runs on a timer — a transient failure should stay quiet.
      console.error('Error loading live visitors:', error);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const { data } = await instance.get('/visitor-analytics/sessions', {
        params: {
          range,
          includeBots: includeBots ? 'true' : 'false',
          page: pageIndex + 1,
          limit: rowsPerPage,
          search: search.trim(),
        },
      });
      setSessions(data.sessions || []);
      setSessionsMeta({ total: data.total || 0, totalPages: data.totalPages || 1 });
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error(error?.response?.data?.message || 'Error loading visitor sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, [range, includeBots, pageIndex, rowsPerPage, search]);

  const fetchGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const { data } = await instance.get('/visitor-analytics/google', {
        params: { range, includeBots: includeBots ? 'true' : 'false' },
      });
      setGoogle(data);
    } catch (error) {
      console.error('Error loading Google traffic:', error);
      toast.error(error?.response?.data?.message || 'Error loading Google traffic');
    } finally {
      setGoogleLoading(false);
    }
  }, [range, includeBots]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { fetchGoogle(); }, [fetchGoogle]);

  // Live list refreshes on its own cadence so "currently live" stays meaningful.
  useEffect(() => {
    fetchLive();
    const timer = window.setInterval(fetchLive, LIVE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [fetchLive]);

  const onSearchChange = (value) => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setSearch(value);
      setPageIndex(0);
    }, 350);
  };

  const openDetail = async (sessionId) => {
    setDetailLoading(true);
    setDetail({ loading: true });
    try {
      const { data } = await instance.get(`/visitor-analytics/sessions/${sessionId}`);
      setDetail(data);
    } catch (error) {
      console.error('Error loading session detail:', error);
      toast.error(error?.response?.data?.message || 'Could not load visitor journey');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const purgeOld = async () => {
    if (!window.confirm('Delete all visitor data older than 90 days? This cannot be undone.')) return;
    try {
      const { data } = await instance.delete('/visitor-analytics/purge', { params: { days: 90 } });
      toast.success(`${data.deletedSessions} sessions and ${data.deletedPageViews} page views removed`);
      fetchOverview();
      fetchSessions();
    } catch (error) {
      console.error('Error purging data:', error);
      toast.error(error?.response?.data?.message || 'Purge failed');
    }
  };

  const stats = overview?.overview;

  const hasAnyData = useMemo(
    () => Boolean(stats && (stats.sessions > 0 || live.count > 0)),
    [stats, live.count]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
      <style>{`
        @keyframes ej-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .35; }
        }
      `}</style>

      {/* Header */}
      <Card sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${ACCENT} 0%, #1e88e5 100%)`,
        color: 'white', borderRadius: 3, boxShadow: '0 8px 24px rgba(55, 166, 255, 0.2)',
      }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <People sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">Visitor Analytics</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Who is on the site right now, where they came from, and every page they opened.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select size="small" value={range}
                onChange={(e) => { setRange(e.target.value); setPageIndex(0); }}
                sx={{
                  minWidth: 165,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,.15)', color: 'white', borderRadius: 2,
                    '& fieldset': { borderColor: 'rgba(255,255,255,.4)' },
                    '&:hover fieldset': { borderColor: 'white' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiSvgIcon-root': { color: 'white' },
                }}
              >
                {RANGES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => { fetchOverview(); fetchSessions(); fetchLive(); }}
                sx={{ bgcolor: 'white', color: ACCENT, px: 3, py: 1.2, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', '&:hover': { bgcolor: '#f0f0f0' } }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Live banner */}
      <Card sx={{
        mb: 3, borderRadius: 3, border: `1px solid ${live.count ? '#a5d6a7' : '#e3e8ee'}`,
        boxShadow: 'none', bgcolor: live.count ? '#f1f8f2' : '#fff',
      }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', py: 2.5 }}>
          <FiberManualRecord sx={{
            color: live.count ? '#2e7d32' : '#b0bec5',
            fontSize: 14,
            animation: live.count ? 'ej-pulse 1.6s ease-in-out infinite' : 'none',
          }} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" fontWeight="bold" color={live.count ? '#1b5e20' : '#546e7a'}>
              {live.count} visitor{live.count === 1 ? '' : 's'} on the site right now
            </Typography>
            <Typography variant="caption" color="#78909c">
              Active within the last {live.liveWindowMinutes} minutes · refreshes every {LIVE_POLL_MS / 1000}s
            </Typography>
          </Box>
          {live.count > 0 && (
            <Button
              size="small" variant="outlined" onClick={() => setTab(1)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#2e7d32', borderColor: '#a5d6a7' }}
            >
              See who
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <StatCard label="Live Now" value={live.count} caption="Active this minute" color="#2e7d32" icon={<FiberManualRecord />} pulse={live.count > 0} />
        <StatCard label="Visitors" value={stats?.uniqueVisitors ?? '—'} caption="Unique people" color={ACCENT} icon={<People />} />
        <StatCard label="Sessions" value={stats?.sessions ?? '—'} caption={`${stats?.returningRate ?? 0}% returning`} color="#7b1fa2" icon={<TrendingUp />} />
        <StatCard label="Page Views" value={stats?.pageViews ?? '—'} caption={`${stats?.avgPagesPerSession ?? 0} pages per visit`} color="#0288d1" icon={<Visibility />} />
        <StatCard label="Avg. Visit" value={formatDuration(stats?.avgSessionSeconds)} caption={`${stats?.bounceRate ?? 0}% bounced`} color="#ed6c02" icon={<Timer />} />
      </Box>

      {overviewLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {!hasAnyData && !overviewLoading && (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 'none', border: '1px dashed #cfd8dc' }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Language sx={{ fontSize: 52, color: '#cfd8dc' }} />
            <Typography variant="h6" color="#546e7a" mt={1}>No visits recorded yet</Typography>
            <Typography variant="body2" color="#90a4ae" sx={{ maxWidth: 520, mx: 'auto', mt: 1 }}>
              Tracking starts the moment someone opens the storefront. If this stays empty after
              real traffic, confirm the storefront build includes the visitor tracker and that it
              can reach this API.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2, minHeight: 58,
            '& .MuiTabs-indicator': { bgcolor: ACCENT, height: 3 },
            '& .MuiTab-root': { minHeight: 58, textTransform: 'none', fontWeight: 700, color: '#546e7a' },
            '& .Mui-selected': { color: '#1e88e5 !important' },
          }}
        >
          <Tab label="Overview" />
          <Tab label={`Live Now (${live.count})`} />
          <Tab label={`All Visitors (${sessionsMeta.total})`} />
          <Tab
            icon={<SearchIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={`Google (${google?.summary?.sessions ?? 0})`}
          />
        </Tabs>
      </Card>

      {/* ── Overview tab ── */}
      {tab === 0 && (
        <>
          <TrafficChart data={overview?.timeseries} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <BreakdownBar
              title="TRAFFIC SOURCES"
              items={overview?.sources || []}
              colorFor={(label) => SOURCE_COLORS[label] || '#90a4ae'}
            />
            <BreakdownBar
              title="DEVICES"
              items={overview?.devices || []}
              colorFor={(label) => ({ desktop: ACCENT, mobile: '#7b1fa2', tablet: '#0288d1', bot: '#90a4ae' }[label] || '#90a4ae')}
            />
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #eceff1' }}>
              <Typography variant="subtitle2" fontWeight={800} color="#37474f">MOST VISITED PAGES</Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold' }}>Page</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', textAlign: 'center' }}>Views</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', textAlign: 'center' }}>Unique Visitors</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', textAlign: 'center' }}>Avg. Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(overview?.topPages || []).map((page) => (
                  <TableRow key={page.path} hover>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: ACCENT, fontWeight: 600, wordBreak: 'break-all' }}>
                      {page.path}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 700, color: '#37474f' }}>
                      {page.views}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#546e7a' }}>
                      {page.visitors}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#546e7a' }}>
                      {formatDuration(page.avgSeconds)}
                    </TableCell>
                  </TableRow>
                ))}
                {!overview?.topPages?.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#b0bec5' }}>
                      No page views in this range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* ── Live tab ── */}
      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Visitor', 'Currently On', 'Pages', 'On Site For', 'Device', 'Came From', ''].map((head) => (
                  <TableCell key={head} sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {live.visitors.map((session) => (
                <TableRow key={session.sessionId} hover>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <VisitorIdentity session={{ ...session, isLive: true, displayName: session.name || (session.isReturning ? 'Returning visitor' : 'Anonymous visitor') }} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: ACCENT, fontWeight: 600, maxWidth: 240, wordBreak: 'break-all' }}>
                    {session.currentPage}
                    <Typography variant="caption" color="#90a4ae" display="block">
                      seen {relativeTime(session.lastSeenAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 700, color: '#37474f' }}>
                    {session.pageCount}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#546e7a' }}>
                    {formatDuration(session.durationSeconds)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Chip
                      size="small" icon={DEVICE_ICONS[session.device]} label={`${session.browser} · ${session.os}`}
                      sx={{ bgcolor: '#eceff1', color: '#455a64', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Chip
                      size="small" label={session.referrerHost || session.landingSource}
                      sx={{ bgcolor: `${SOURCE_COLORS[session.landingSource] || '#90a4ae'}18`, color: SOURCE_COLORS[session.landingSource] || '#546e7a', fontWeight: 700, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Tooltip title="View full journey">
                      <IconButton onClick={() => openDetail(session.sessionId)} sx={{ color: ACCENT }}>
                        <Timeline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!live.visitors.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                    <People sx={{ fontSize: 52, opacity: 0.25, mb: 1 }} />
                    <Typography variant="h6" color="#90a4ae">Nobody on the site right now</Typography>
                    <Typography variant="body2" color="#b0bec5">
                      This list updates automatically every {LIVE_POLL_MS / 1000} seconds.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── All visitors tab ── */}
      {tab === 2 && (
        <>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', py: 2.5 }}>
              <TextField
                size="small"
                placeholder="Search by name, email, page, or referrer…"
                defaultValue={search}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ ...textFieldStyle, flex: '1 1 300px' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#90a4ae' }} /></InputAdornment> }}
              />
              <FormControlLabel
                control={<Switch checked={includeBots} onChange={(e) => { setIncludeBots(e.target.checked); setPageIndex(0); }} color="primary" />}
                label={<Typography variant="body2" color="#546e7a">Include bots</Typography>}
              />
              <Tooltip title="Delete visitor data older than 90 days">
                <Button
                  size="small" variant="outlined" startIcon={<DeleteSweep />} onClick={purgeOld}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#d32f2f', borderColor: '#ffcdd2' }}
                >
                  Purge old data
                </Button>
              </Tooltip>
            </CardContent>
          </Card>

          {sessionsLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Visitor', 'Visited', 'Pages', 'Duration', 'Landed On', 'Left From', 'Source', 'Device', ''].map((head) => (
                    <TableCell key={head} sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.sessionId} hover>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <VisitorIdentity session={session} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="#455a64">{relativeTime(session.startedAt)}</Typography>
                      <Typography variant="caption" color="#90a4ae">{exactTime(session.startedAt)}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 700, color: '#37474f' }}>
                      {session.pageCount}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#546e7a', whiteSpace: 'nowrap' }}>
                      {formatDuration(session.durationSeconds)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#546e7a', maxWidth: 170, wordBreak: 'break-all' }}>
                      {session.entryPage}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#546e7a', maxWidth: 170, wordBreak: 'break-all' }}>
                      {session.exitPage}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Chip
                        size="small" label={session.referrerHost || session.landingSource}
                        sx={{ bgcolor: `${SOURCE_COLORS[session.landingSource] || '#90a4ae'}18`, color: SOURCE_COLORS[session.landingSource] || '#546e7a', fontWeight: 700, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Chip
                        size="small" icon={DEVICE_ICONS[session.device]} label={session.browser}
                        sx={{ bgcolor: '#eceff1', color: '#455a64', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Tooltip title="View full journey">
                        <IconButton onClick={() => openDetail(session.sessionId)} sx={{ color: ACCENT }}>
                          <Timeline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!sessions.length && !sessionsLoading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                      <People sx={{ fontSize: 52, opacity: 0.25, mb: 1 }} />
                      <Typography variant="h6" color="#90a4ae">No visitors in this range</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={sessionsMeta.total}
              page={pageIndex}
              onPageChange={(_, next) => setPageIndex(next)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPageIndex(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </TableContainer>
        </>
      )}

      {/* ── Google tab ── */}
      {tab === 3 && (
        <>
          {googleLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <StatCard
              label="Visits from Google"
              value={google?.summary?.sessions ?? '—'}
              caption={google ? `${google.summary.uniqueVisitors} unique visitors` : ' '}
              color="#2e7d32"
              icon={<SearchIcon />}
            />
            <StatCard
              label="Pages Viewed"
              value={google?.summary?.pageViews ?? '—'}
              caption={google ? `${google.summary.avgPagesPerSession} per visit` : ' '}
              color={ACCENT}
              icon={<Visibility />}
            />
            <StatCard
              label="Landing Pages"
              value={google?.summary?.landingPages ?? '—'}
              caption="Pages Google sends traffic to"
              color="#7b1fa2"
              icon={<Login />}
            />
            <StatCard
              label="Avg. Time on Site"
              value={google ? formatDuration(google.summary.avgSessionSeconds) : '—'}
              caption={google ? `${google.summary.bounceRate}% bounce rate` : ' '}
              color="#ed6c02"
              icon={<Timer />}
            />
          </Box>

          {/* Traffic that reads as automated is called out rather than hidden — the
              numbers above are still true, they just are not all people. */}
          {google?.summary?.automatedLooking > 0 && (
            <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #ffcc80', bgcolor: '#fff8e1', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', gap: 1.5, py: 2.5 }}>
                <WarningAmber sx={{ color: '#ef6c00', mt: '2px' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#e65100">
                    {google.summary.automatedLooking} of {google.summary.sessions} visits
                    ({google.summary.automatedRate}%) look automated
                  </Typography>
                  <Typography variant="body2" color="#8d6e63" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                    These opened one page, stayed zero seconds, and arrived as a brand-new
                    visitor. That is the signature of a crawler or scraper rather than a
                    shopper. They are counted in the totals above and flagged in the visits
                    list below, so you can judge them yourself.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <TrafficChart data={google?.timeseries} />

          {google?.hosts?.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {google.hosts.map((item) => (
                <Chip
                  key={item.host}
                  size="small"
                  label={`${item.host} · ${item.count}`}
                  sx={{ fontWeight: 700, bgcolor: '#e8f5e9', color: '#2e7d32' }}
                />
              ))}
            </Box>
          )}

          <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', py: 2 }}>
              {[
                { id: 'landing', label: `Landing pages (${google?.landingPages?.length || 0})` },
                { id: 'pages', label: `All pages viewed (${google?.pages?.length || 0})` },
                { id: 'visits', label: `Individual visits (${google?.recentSessions?.length || 0})` },
              ].map((option) => (
                <Button
                  key={option.id}
                  size="small"
                  variant={googleView === option.id ? 'contained' : 'outlined'}
                  disableElevation
                  onClick={() => setGoogleView(option.id)}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: 2,
                    ...(googleView === option.id
                      ? { bgcolor: ACCENT, '&:hover': { bgcolor: '#1e88e5' } }
                      : { color: '#546e7a', borderColor: '#cfd8dc' }),
                  }}
                >
                  {option.label}
                </Button>
              ))}
              <Box sx={{ flex: 1 }} />
              <Button
                size="small" variant="outlined" startIcon={<Refresh />} onClick={fetchGoogle}
                disabled={googleLoading}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#546e7a', borderColor: '#cfd8dc' }}
              >
                Refresh
              </Button>
            </CardContent>
          </Card>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #eceff1' }}>
              <Typography variant="subtitle2" fontWeight={800} color="#37474f">
                {googleView === 'landing' && 'PAGES GOOGLE SENDS PEOPLE TO'}
                {googleView === 'pages' && 'EVERY PAGE VIEWED BY GOOGLE VISITORS'}
                {googleView === 'visits' && 'INDIVIDUAL VISITS FROM GOOGLE'}
              </Typography>
              <Typography variant="caption" color="#90a4ae">
                {googleView === 'landing' && 'The first page of each visit — what Google actually ranks.'}
                {googleView === 'pages' && 'Includes pages reached by clicking around after landing.'}
                {googleView === 'visits' && 'Most recent first. Click a row for the full journey.'}
              </Typography>
            </Box>

            {googleView !== 'visits' && (
              <Table>
                <TableHead>
                  <TableRow>
                    {['Page', googleView === 'landing' ? 'Visits' : 'Views', 'Unique Visitors',
                      googleView === 'landing' ? 'Bounced' : 'Avg. Time'].map((head, index) => (
                        <TableCell
                          key={head}
                          sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', textAlign: index === 0 ? 'left' : 'center' }}
                        >
                          {head}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(googleView === 'landing' ? google?.landingPages : google?.pages || []).map((page) => (
                    <TableRow key={page.path} hover>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: ACCENT, fontWeight: 600, wordBreak: 'break-all', maxWidth: 520 }}>
                        {page.path}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 700, color: '#37474f' }}>
                        {googleView === 'landing' ? page.sessions : page.views}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#546e7a' }}>
                        {page.visitors}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#546e7a' }}>
                        {googleView === 'landing'
                          ? `${page.sessions ? Math.round((page.bounces / page.sessions) * 100) : 0}%`
                          : formatDuration(page.avgSeconds)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!googleLoading && !(googleView === 'landing' ? google?.landingPages : google?.pages)?.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                        <SearchIcon sx={{ fontSize: 52, opacity: 0.25, mb: 1 }} />
                        <Typography variant="h6" color="#90a4ae">No Google traffic in this range</Typography>
                        <Typography variant="body2" color="#b0bec5">Try widening the date range above.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {googleView === 'visits' && (
              <Table>
                <TableHead>
                  <TableRow>
                    {['Visitor', 'Landed On', 'Left From', 'Pages', 'Time', 'Device', 'When'].map((head, index) => (
                      <TableCell
                        key={head}
                        sx={{ bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold', textAlign: index === 0 ? 'left' : 'center', whiteSpace: 'nowrap' }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(google?.recentSessions || []).map((session) => (
                    <TableRow
                      key={session.sessionId}
                      hover
                      onClick={() => openDetail(session.sessionId)}
                      sx={{ cursor: 'pointer', bgcolor: session.looksAutomated ? '#fffdf5' : 'inherit' }}
                    >
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <VisitorIdentity session={session} />
                        {session.looksAutomated && (
                          <Chip
                            size="small" label="Looks automated"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, mt: 0.5, bgcolor: '#fff3e0', color: '#e65100' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: ACCENT, fontWeight: 600, wordBreak: 'break-all', maxWidth: 240 }}>
                        {session.entryPage}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#78909c', wordBreak: 'break-all', maxWidth: 240 }}>
                        {session.exitPage}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 700, color: '#37474f' }}>
                        {session.pageCount}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#546e7a' }}>
                        {formatDuration(session.durationSeconds)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <Tooltip title={`${session.browser} on ${session.os}`}>
                          <Box sx={{ display: 'inline-flex', color: '#78909c' }}>
                            {DEVICE_ICONS[session.device] || <Computer fontSize="small" />}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <Tooltip title={exactTime(session.startedAt)}>
                          <Typography variant="body2" color="#78909c">{relativeTime(session.startedAt)}</Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!googleLoading && !google?.recentSessions?.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                        <SearchIcon sx={{ fontSize: 52, opacity: 0.25, mb: 1 }} />
                        <Typography variant="h6" color="#90a4ae">No Google traffic in this range</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      )}

      {/* ── Journey dialog ── */}
      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#fafbfc' } }}
      >
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #1e88e5 100%)`, color: 'white', py: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">Visitor Journey</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {detail?.session?.displayName || 'Loading…'}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetail(null)} sx={{ color: 'white' }}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {detailLoading || detail?.loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress sx={{ color: ACCENT }} />
            </Box>
          ) : detail?.session ? (
            <>
              {/* Facts */}
              <Card sx={{ borderRadius: 3, mb: 3, boxShadow: 'none', border: '1px solid #e3e8ee' }}>
                <CardContent>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                    {[
                      ['Name', detail.session.name || 'Not signed in'],
                      ['Email', detail.session.email || '—'],
                      ['Pages viewed', detail.session.pageCount],
                      ['Time on site', formatDuration(detail.session.durationSeconds)],
                      ['Started', exactTime(detail.session.startedAt)],
                      ['Last seen', relativeTime(detail.session.lastSeenAt)],
                      ['Device', `${detail.session.device} · ${detail.session.browser} · ${detail.session.os}`],
                      ['Screen', detail.session.screen || '—'],
                      ['Source', detail.session.landingSource],
                      ['Referrer', detail.session.referrerHost || 'Direct'],
                      ['Language', detail.session.language || '—'],
                      ['Timezone', detail.session.timezone || '—'],
                      ['Sessions by this visitor', detail.session.totalSessionsByVisitor],
                      ['Visitor ID', detail.session.visitorId.slice(0, 12)],
                      ['Campaign', detail.session.utm?.campaign || '—'],
                      ['Status', detail.session.isLive ? 'On the site now' : 'Session ended'],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="#90a4ae" fontWeight={700} display="block">
                          {label.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="#37474f" fontWeight={600} sx={{ wordBreak: 'break-word', textTransform: label === 'Source' || label === 'Device' ? 'capitalize' : 'none' }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Journey timeline */}
              <Typography variant="subtitle2" fontWeight={800} color="#37474f" sx={{ mb: 2 }}>
                PAGE-BY-PAGE JOURNEY ({detail.journey.length})
              </Typography>
              <Box sx={{ position: 'relative', pl: 3 }}>
                <Box sx={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, bgcolor: '#e3e8ee' }} />
                {detail.journey.map((view, index) => (
                  <Box key={`${view.path}-${view.viewedAt}-${index}`} sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{
                      position: 'absolute', left: -19, top: 14, width: 12, height: 12, borderRadius: '50%',
                      bgcolor: index === detail.journey.length - 1 && detail.session.isLive ? '#2e7d32' : ACCENT,
                      border: '2px solid #fff', boxShadow: '0 0 0 2px #e3e8ee',
                    }} />
                    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e8ee' }}>
                      <CardContent sx={{ py: 1.75, '&:last-child': { pb: 1.75 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: ACCENT, wordBreak: 'break-all' }}>
                              {view.path}
                            </Typography>
                            {view.title && (
                              <Typography variant="caption" color="#78909c" noWrap display="block">{view.title}</Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Typography variant="caption" color="#546e7a" fontWeight={700} display="block">
                              {new Date(view.viewedAt).toLocaleTimeString()}
                            </Typography>
                            <Typography variant="caption" color="#90a4ae">
                              {view.secondsOnPage ? formatDuration(view.secondsOnPage) : 'still open'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
                {!detail.journey.length && (
                  <Typography variant="body2" color="#b0bec5">No page views recorded for this session.</Typography>
                )}
              </Box>
            </>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e3e8ee', bgcolor: '#fff' }}>
          <Button onClick={() => setDetail(null)} sx={{ color: '#78909c', textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitorAnalytics;
