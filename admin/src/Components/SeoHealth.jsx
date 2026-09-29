import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, IconButton, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  LinearProgress, MenuItem, Tooltip, Collapse, Divider, InputAdornment,
  FormControlLabel, Switch, TablePagination, Checkbox,
} from '@mui/material';
import {
  TrendingUp, Search, Refresh, PlayArrow, Assessment, Edit,
  CheckCircle, Warning, ErrorOutline, Info, ExpandMore, ExpandLess,
  Close, AutoFixHigh, Language, CloudUpload, VisibilityOff, Inventory2,
} from '@mui/icons-material';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

import { uploadUrl } from '../constant/url';
const ACCENT = '#37a6ff';

const GRADE_COLORS = {
  excellent: { main: '#2e7d32', soft: '#e8f5e9' },
  good: { main: '#0288d1', soft: '#e1f5fe' },
  'needs-work': { main: '#ed6c02', soft: '#fff4e5' },
  poor: { main: '#d32f2f', soft: '#fdecea' },
};

const STATUS_META = {
  pass: { icon: <CheckCircle fontSize="small" />, color: '#2e7d32', soft: '#e8f5e9', label: 'Passed' },
  warn: { icon: <Warning fontSize="small" />, color: '#ed6c02', soft: '#fff4e5', label: 'Could be better' },
  fail: { icon: <ErrorOutline fontSize="small" />, color: '#d32f2f', soft: '#fdecea', label: 'Needs attention' },
  info: { icon: <Info fontSize="small" />, color: '#0288d1', soft: '#e1f5fe', label: 'Info' },
};

const gradeColor = (grade) => GRADE_COLORS[grade] || GRADE_COLORS.poor;

const scoreColor = (score) => {
  if (score === null || score === undefined) return '#9aa8b5';
  if (score >= 90) return GRADE_COLORS.excellent.main;
  if (score >= 75) return GRADE_COLORS.good.main;
  if (score >= 50) return GRADE_COLORS['needs-work'].main;
  return GRADE_COLORS.poor.main;
};

const relativeTime = (value) => {
  if (!value) return 'Never';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
};

const CHANGEFREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

// Where a page's SEO is stored, which decides where an edit is written back to.
const SOURCE_META = {
  product: { label: 'Product', color: '#6a1b9a', soft: '#f3e5f5' },
  metadata: { label: 'Configured', color: '#00695c', soft: '#e0f2f1' },
  discovered: { label: 'Discovered', color: '#ef6c00', soft: '#fff3e0' },
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

// ── Small presentational pieces ──────────────────────────────────────────────

const StatCard = ({ label, value, caption, color, icon }) => (
  <Card sx={{ flex: '1 1 200px', minWidth: 190, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
      <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: `${color}14`, color, display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="body2" fontWeight={600} color="#37474f" noWrap>{label}</Typography>
        {caption && <Typography variant="caption" color="text.secondary" noWrap>{caption}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const ScoreRing = ({ score, size = 72 }) => {
  const color = scoreColor(score);
  const value = score ?? 0;
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke="#eceff1" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * (size / 2 - 6)}
          strokeDashoffset={2 * Math.PI * (size / 2 - 6) * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color, lineHeight: 1 }}>
          {score === null || score === undefined ? '—' : score}
        </Typography>
      </Box>
    </Box>
  );
};

const CheckRow = ({ check }) => {
  const meta = STATUS_META[check.status] || STATUS_META.info;
  return (
    <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: 2, bgcolor: meta.soft, mb: 1.25 }}>
      <Box sx={{ color: meta.color, mt: '2px' }}>{meta.icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#263238">{check.label}</Typography>
          <Chip
            size="small"
            label={`${check.earned}/${check.weight}`}
            sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#fff', color: meta.color, border: `1px solid ${meta.color}33` }}
          />
        </Box>
        <Typography variant="body2" color="#455a64" sx={{ lineHeight: 1.65 }}>{check.message}</Typography>
        {check.value && check.value !== '—' && (
          <Typography
            variant="caption"
            sx={{
              display: 'block', mt: 0.75, px: 1, py: 0.5, borderRadius: 1,
              bgcolor: 'rgba(255,255,255,.75)', color: '#546e7a',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              wordBreak: 'break-word',
            }}
          >
            {check.value}
          </Typography>
        )}
        {check.fix && (
          <Box sx={{ display: 'flex', gap: 0.75, mt: 1, alignItems: 'flex-start' }}>
            <AutoFixHigh sx={{ fontSize: 15, color: meta.color, mt: '2px' }} />
            <Typography variant="body2" sx={{ color: meta.color, fontWeight: 600, lineHeight: 1.6 }}>
              {check.fix}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const SeoHealth = () => {
  const [pages, setPages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditingRoute, setAuditingRoute] = useState('');
  const [auditingAll, setAuditingAll] = useState(false);

  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [selected, setSelected] = useState([]);
  const [togglingRoute, setTogglingRoute] = useState('');
  const [bulkWorking, setBulkWorking] = useState(false);

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showPassed, setShowPassed] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchPages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await instance.get('/seo-health/pages');
      setPages(data.pages || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error loading SEO pages:', error);
      toast.error(error?.response?.data?.message || 'Error loading SEO pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const runAudit = async (route) => {
    setAuditingRoute(route);
    try {
      const { data } = await instance.post('/seo-health/audit', { route });
      toast.success(`${route} scored ${data.report.score}/100`);
      await fetchPages(true);
      return data.report;
    } catch (error) {
      console.error('Error auditing route:', error);
      toast.error(error?.response?.data?.message || 'Audit failed');
      return null;
    } finally {
      setAuditingRoute('');
    }
  };

  const runAuditAll = async () => {
    setAuditingAll(true);
    try {
      const { data } = await instance.post('/seo-health/audit-all');
      toast.success(`${data.message} — site average ${data.averageScore}/100`);
      await fetchPages(true);
    } catch (error) {
      console.error('Error running site audit:', error);
      toast.error(error?.response?.data?.message || 'Site audit failed');
    } finally {
      setAuditingAll(false);
    }
  };

  const toggleIndexing = async (row) => {
    const noIndex = !row.noIndex;
    setTogglingRoute(row.route);
    try {
      // The backend decides whether this lands on the product document or on a
      // metadata row — the UI never has to know which store owns the page.
      const { data } = await instance.put('/seo-health/indexing', { route: row.route, noIndex });
      toast.success(data.message);
      await fetchPages(true);
    } catch (error) {
      console.error('Error updating indexing:', error);
      toast.error(error?.response?.data?.message || 'Could not update indexing');
    } finally {
      setTogglingRoute('');
    }
  };

  const bulkIndexing = async (noIndex) => {
    if (!selected.length) return;
    setBulkWorking(true);
    try {
      const { data } = await instance.put('/seo-health/indexing/bulk', { routes: selected, noIndex });
      toast.success(data.message);
      setSelected([]);
      await fetchPages(true);
    } catch (error) {
      console.error('Error updating indexing:', error);
      toast.error(error?.response?.data?.message || 'Could not update indexing');
    } finally {
      setBulkWorking(false);
    }
  };

  const openReport = async (route) => {
    setReportLoading(true);
    setShowPassed(false);
    setReport({ route, loading: true });
    try {
      const { data } = await instance.get('/seo-health/report', { params: { route } });
      setReport(data.report);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error(error?.response?.data?.message || 'Could not load report');
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const openEditor = (row) => {
    setEditTarget(row);
    setEditForm({
      route: row.route,
      title: row.title || row.suggested?.title || '',
      description: row.description || row.suggested?.description || '',
      keywords: row.keywords || row.suggested?.keywords || '',
      ogImage: row.ogImage || '',
      sitemapEnabled: row.sitemapEnabled !== false,
      sitemapOrder: row.sitemapOrder ?? 100,
      sitemapPriority: row.sitemapPriority ?? 0.5,
      sitemapChangefreq: row.sitemapChangefreq || 'monthly',
    });
  };

  const uploadOgImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const body = new FormData();
    body.append('image', file);

    setUploadingImage(true);
    try {
      // Not /metadata/upload — that one converts to WebP, which WhatsApp will
      // not render in a link preview. This endpoint emits JPEG at 1200×630.
      const { data } = await instance.post('/seo-health/upload-social-image', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditForm((form) => ({ ...form, ogImage: data.url }));
      toast.success('Image uploaded — save to apply it');
    } catch (error) {
      console.error('Error uploading share image:', error);
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
      // Allow re-selecting the same file after a failure.
      event.target.value = '';
    }
  };

  const saveEditor = async () => {
    if (!editForm?.title?.trim()) {
      toast.error('A meta title is required');
      return;
    }
    setSaving(true);
    try {
      // Upsert by route-in-body. A route is a path, not a path segment — "/"
      // has no segment at all, and nested filter routes would need %2F to
      // survive every proxy in front of the API.
      await instance.put('/seo-health/metadata', editForm);
      toast.success('SEO metadata saved');
      setEditTarget(null);
      setEditForm(null);
      // Re-audit immediately so the score on screen reflects the edit.
      await runAudit(editForm.route);
      await fetchPages(true);
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error(error?.response?.data?.message || 'Could not save metadata');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pages.filter((row) => {
      if (term && !(
        row.route.toLowerCase().includes(term) ||
        (row.title || '').toLowerCase().includes(term) ||
        (row.keywords || '').toLowerCase().includes(term)
      )) return false;

      if (sourceFilter !== 'all' && row.source !== sourceFilter) return false;

      switch (healthFilter) {
        case 'strong': return row.score !== null && row.score >= 75;
        case 'needs-work': return row.score !== null && row.score < 75;
        case 'not-audited': return row.score === null;
        case 'no-metadata': return !row.hasMetadata;
        case 'stale': return row.stale;
        case 'hidden': return row.noIndex;
        default: return true;
      }
    });
  }, [pages, search, healthFilter, sourceFilter]);

  useEffect(() => { setPageIndex(0); setSelected([]); }, [search, healthFilter, sourceFilter]);

  const visible = filtered.slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage);

  // Select-all acts on the visible page only. Ticking a header box and silently
  // arming 200 rows across pages is how people accidentally deindex a whole site.
  const visibleRoutes = visible.map((row) => row.route);
  const allVisibleSelected = visibleRoutes.length > 0 && visibleRoutes.every((route) => selected.includes(route));
  const someVisibleSelected = visibleRoutes.some((route) => selected.includes(route));

  const toggleSelectAll = () => {
    setSelected((current) => (allVisibleSelected
      ? current.filter((route) => !visibleRoutes.includes(route))
      : [...new Set([...current, ...visibleRoutes])]));
  };

  const toggleSelectRow = (route) => {
    setSelected((current) => (current.includes(route)
      ? current.filter((item) => item !== route)
      : [...current, route]));
  };

  const sourceCounts = useMemo(() => pages.reduce((acc, row) => {
    acc[row.source] = (acc[row.source] || 0) + 1;
    return acc;
  }, {}), [pages]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

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
                <TrendingUp sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">SEO Health</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Every page on the site — static, filter, and product — audited, scored,
                  and indexable on a switch. New products appear here automatically.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => fetchPages()}
                disabled={loading}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,.1)' } }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={auditingAll ? <CircularProgress size={18} sx={{ color: ACCENT }} /> : <PlayArrow />}
                onClick={runAuditAll}
                disabled={auditingAll}
                sx={{ bgcolor: 'white', color: ACCENT, px: 3, py: 1.4, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', '&:hover': { bgcolor: '#f0f0f0' } }}
              >
                {auditingAll ? 'Auditing…' : 'Audit All Pages'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <StatCard
          label="Average SEO Score"
          value={summary ? `${summary.averageScore}` : '—'}
          caption={summary ? `${summary.averageGrade} across ${summary.indexablePages ?? summary.totalPages} indexable pages` : ' '}
          color={scoreColor(summary?.averageScore ?? null)}
          icon={<Assessment />}
        />
        <StatCard
          label="Strong Pages"
          value={summary?.strongPages ?? '—'}
          caption="Scoring 75 or above"
          color={GRADE_COLORS.excellent.main}
          icon={<CheckCircle />}
        />
        <StatCard
          label="Need Improvement"
          value={summary?.needImprovement ?? '—'}
          caption={summary ? `${summary.totalIssues} issues found` : ' '}
          color={GRADE_COLORS['needs-work'].main}
          icon={<Warning />}
        />
        <StatCard
          label="Not Audited"
          value={summary?.notAudited ?? '—'}
          caption={summary?.missingMetadata ? `${summary.missingMetadata} without metadata` : 'All pages have metadata'}
          color="#78909c"
          icon={<ErrorOutline />}
        />
        <StatCard
          label="Hidden from Search"
          value={summary?.noIndexPages ?? '—'}
          caption={summary ? `of ${summary.totalPages} total pages` : ' '}
          color="#455a64"
          icon={<VisibilityOff />}
        />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', py: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search by URL, title, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...textFieldStyle, flex: '1 1 300px' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#90a4ae' }} /></InputAdornment> }}
          />
          <TextField
            select size="small" label="Health" value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            sx={{ ...textFieldStyle, minWidth: 200 }}
          >
            <MenuItem value="all">All pages ({pages.length})</MenuItem>
            <MenuItem value="strong">Strong (75+)</MenuItem>
            <MenuItem value="needs-work">Needs improvement</MenuItem>
            <MenuItem value="not-audited">Not audited</MenuItem>
            <MenuItem value="no-metadata">Missing metadata</MenuItem>
            <MenuItem value="stale">Changed since audit</MenuItem>
            <MenuItem value="hidden">Hidden from search</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Page type" value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            sx={{ ...textFieldStyle, minWidth: 200 }}
          >
            <MenuItem value="all">Every type ({pages.length})</MenuItem>
            <MenuItem value="product">Product pages ({sourceCounts.product || 0})</MenuItem>
            <MenuItem value="metadata">Configured pages ({sourceCounts.metadata || 0})</MenuItem>
            <MenuItem value="discovered">Discovered, no metadata ({sourceCounts.discovered || 0})</MenuItem>
          </TextField>
          {summary?.staleAudits > 0 && (
            <Chip
              size="small"
              label={`${summary.staleAudits} page${summary.staleAudits === 1 ? '' : 's'} edited since last audit`}
              onClick={() => setHealthFilter('stale')}
              sx={{ bgcolor: '#fff4e5', color: '#ed6c02', fontWeight: 700, cursor: 'pointer' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Bulk index actions — only rendered when something is actually selected */}
      <Collapse in={selected.length > 0}>
        <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${ACCENT}44`, bgcolor: '#f2f9ff', boxShadow: 'none' }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="body2" fontWeight={700} color="#0d47a1">
              {selected.length} page{selected.length === 1 ? '' : 's'} selected
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small" variant="outlined" disabled={bulkWorking}
              startIcon={bulkWorking ? <CircularProgress size={14} /> : <VisibilityOff />}
              onClick={() => bulkIndexing(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#d32f2f', borderColor: '#ef9a9a' }}
            >
              Hide from search
            </Button>
            <Button
              size="small" variant="outlined" disabled={bulkWorking}
              startIcon={bulkWorking ? <CircularProgress size={14} /> : <CheckCircle />}
              onClick={() => bulkIndexing(false)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#2e7d32', borderColor: '#a5d6a7' }}
            >
              Allow indexing
            </Button>
            <Button size="small" onClick={() => setSelected([])} sx={{ textTransform: 'none', color: '#78909c' }}>
              Clear
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#f8f9fa' }}>
                <Checkbox
                  size="small"
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected && !allVisibleSelected}
                  onChange={toggleSelectAll}
                  sx={{ color: '#b0bec5', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: ACCENT } }}
                />
              </TableCell>
              {['Page', 'Score', 'Health', 'Improvements', 'Indexed', 'Last Audit', 'Actions'].map((head, index) => (
                <TableCell
                  key={head}
                  sx={{
                    bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold',
                    textAlign: index === 0 ? 'left' : 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((row) => {
              const colors = gradeColor(row.grade);
              const source = SOURCE_META[row.source] || SOURCE_META.discovered;
              const isSelected = selected.includes(row.route);
              return (
                <TableRow
                  key={row.route}
                  hover
                  selected={isSelected}
                  sx={{
                    '&:hover': { bgcolor: '#fcfdfe !important' },
                    // A hidden page is still listed, just visibly demoted — you
                    // need to see what you have hidden to undo it later.
                    opacity: row.noIndex ? 0.62 : 1,
                  }}
                >
                  <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(row.route)}
                      sx={{ color: '#b0bec5', '&.Mui-checked': { color: ACCENT } }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', maxWidth: 380 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: ACCENT, wordBreak: 'break-all' }}>
                      {row.route}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#78909c', display: 'block' }} noWrap>
                      {row.title || <em>No meta title set</em>}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={row.source === 'product' ? <Inventory2 sx={{ fontSize: 12 }} /> : undefined}
                        label={source.label}
                        sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: source.soft, color: source.color, '& .MuiChip-icon': { color: source.color, ml: '5px' } }}
                      />
                      {row.noIndex && (
                        <Chip size="small" label="Hidden from search" sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: '#eceff1', color: '#455a64' }} />
                      )}
                      {!row.hasMetadata && !row.noIndex && (
                        <Chip size="small" label="No metadata" sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: '#fdecea', color: '#d32f2f' }} />
                      )}
                      {row.keywordsDerived && (
                        <Tooltip title="Keywords are derived from this product's colour, material, and category. Set your own under Edit SEO.">
                          <Chip size="small" label="Auto keywords" sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: '#ede7f6', color: '#5e35b1' }} />
                        </Tooltip>
                      )}
                      {row.stale && (
                        <Chip size="small" label="Edited since audit" sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: '#fff4e5', color: '#ed6c02' }} />
                      )}
                      {row.sitemapEnabled === false && !row.noIndex && (
                        <Chip size="small" label="Not in sitemap" sx={{ height: 19, fontSize: 10, fontWeight: 700, bgcolor: '#eceff1', color: '#607d8b' }} />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', width: 110 }}>
                    {row.score === null ? (
                      <Typography variant="body2" sx={{ color: '#b0bec5', fontWeight: 700 }}>—</Typography>
                    ) : (
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: scoreColor(row.score), lineHeight: 1.2 }}>
                          {row.score}
                        </Typography>
                        <LinearProgress
                          variant="determinate" value={row.score}
                          sx={{
                            height: 5, borderRadius: 3, bgcolor: '#eceff1',
                            '& .MuiLinearProgress-bar': { bgcolor: scoreColor(row.score), borderRadius: 3 },
                          }}
                        />
                      </Box>
                    )}
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <Chip
                      size="small"
                      label={row.healthLabel || 'Not audited'}
                      sx={{
                        fontWeight: 700,
                        bgcolor: row.score === null ? '#eceff1' : colors.soft,
                        color: row.score === null ? '#78909c' : colors.main,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    {row.improvements === null ? (
                      <Typography variant="body2" sx={{ color: '#b0bec5' }}>—</Typography>
                    ) : row.improvements === 0 ? (
                      <Chip size="small" label="All clear" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
                    ) : (
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="#455a64">
                          {row.improvements} to fix
                        </Typography>
                        <Typography variant="caption" color="#90a4ae">
                          {row.counts?.failed || 0} critical · {row.counts?.warnings || 0} minor
                        </Typography>
                      </Box>
                    )}
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', width: 120 }}>
                    <Tooltip title={row.noIndex
                      ? 'Hidden from Google. Click to allow indexing and put it back in the sitemap.'
                      : 'Visible to Google. Click to hide this page from search and remove it from the sitemap.'}
                    >
                      <span>
                        <Switch
                          size="small"
                          checked={!row.noIndex}
                          disabled={togglingRoute === row.route}
                          onChange={() => toggleIndexing(row)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#2e7d32' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#66bb6a' },
                          }}
                        />
                      </span>
                    </Tooltip>
                    <Typography variant="caption" display="block" sx={{ color: row.noIndex ? '#90a4ae' : '#2e7d32', fontWeight: 700 }}>
                      {row.noIndex ? 'Hidden' : 'Indexed'}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <Typography variant="body2" color="#78909c">{relativeTime(row.auditedAt)}</Typography>
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        size="small" variant="contained" disableElevation
                        startIcon={auditingRoute === row.route ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PlayArrow />}
                        onClick={() => runAudit(row.route)}
                        disabled={auditingRoute === row.route}
                        sx={{ bgcolor: ACCENT, textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#1e88e5' } }}
                      >
                        Audit Now
                      </Button>
                      <Button
                        size="small" variant="outlined"
                        startIcon={<Assessment />}
                        onClick={() => openReport(row.route)}
                        sx={{ color: '#546e7a', borderColor: '#cfd8dc', textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', '&:hover': { borderColor: ACCENT, color: ACCENT } }}
                      >
                        View Report
                      </Button>
                      <Tooltip title={row.hasMetadata ? 'Edit SEO metadata' : 'Create SEO metadata for this page'}>
                        <Button
                          size="small" variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => openEditor(row)}
                          sx={{ color: '#546e7a', borderColor: '#cfd8dc', textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', '&:hover': { borderColor: ACCENT, color: ACCENT } }}
                        >
                          Edit SEO
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {!visible.length && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                  <Language sx={{ fontSize: 56, opacity: 0.25, mb: 1 }} />
                  <Typography variant="h6" color="#90a4ae">
                    {pages.length ? 'No pages match these filters' : 'No pages found'}
                  </Typography>
                  <Typography variant="body2" color="#b0bec5">
                    {pages.length ? 'Try clearing the search or health filter.' : 'Add routes under Meta Data and they will appear here.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={pageIndex}
            onPageChange={(_, next) => setPageIndex(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPageIndex(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        )}
      </TableContainer>

      {/* ── Report dialog ── */}
      <Dialog
        open={Boolean(report)}
        onClose={() => setReport(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#fafbfc' } }}
      >
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #1e88e5 100%)`, color: 'white', py: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight="bold">SEO Report</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, wordBreak: 'break-all' }}>{report?.route}</Typography>
            </Box>
            <IconButton onClick={() => setReport(null)} sx={{ color: 'white' }}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {reportLoading || report?.loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress sx={{ color: ACCENT }} />
              <Typography variant="body2" color="text.secondary" mt={2}>Analysing page…</Typography>
            </Box>
          ) : report ? (
            <>
              {/* Score header */}
              <Card sx={{ borderRadius: 3, mb: 3, boxShadow: 'none', border: '1px solid #e3e8ee' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <ScoreRing score={report.score} size={86} />
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Chip
                      label={report.label}
                      sx={{ fontWeight: 700, mb: 1, bgcolor: gradeColor(report.grade).soft, color: gradeColor(report.grade).main }}
                    />
                    <Typography variant="body2" color="#546e7a">
                      Scored {report.totalEarned} of {report.totalWeight} available points across {report.counts.total} checks.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                        {report.counts.passed} passed
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ed6c02', fontWeight: 700 }}>
                        {report.counts.warnings} could improve
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                        {report.counts.failed} need attention
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Category breakdown */}
              <Typography variant="subtitle2" fontWeight={800} color="#37474f" sx={{ mb: 1.5, letterSpacing: '.02em' }}>
                CATEGORY BREAKDOWN
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                {report.groups.map((group) => (
                  <Card key={group.id} sx={{ flex: '1 1 150px', minWidth: 140, borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e8ee' }}>
                    <CardContent sx={{ py: 1.75, '&:last-child': { pb: 1.75 } }}>
                      <Typography variant="caption" color="#78909c" fontWeight={700} noWrap>{group.label}</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: scoreColor(group.score), lineHeight: 1.3 }}>
                        {group.earned}/{group.weight}
                      </Typography>
                      <LinearProgress
                        variant="determinate" value={group.score}
                        sx={{ height: 4, borderRadius: 2, bgcolor: '#eceff1', '& .MuiLinearProgress-bar': { bgcolor: scoreColor(group.score), borderRadius: 2 } }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Issues, highest impact first */}
              {report.issues.length > 0 ? (
                <>
                  <Typography variant="subtitle2" fontWeight={800} color="#37474f" sx={{ mb: 1.5, letterSpacing: '.02em' }}>
                    NEEDS ATTENTION ({report.issues.length}) — HIGHEST IMPACT FIRST
                  </Typography>
                  {report.issues.map((check) => <CheckRow key={check.id} check={check} />)}
                </>
              ) : (
                <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#e8f5e9', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <CheckCircle sx={{ color: '#2e7d32' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#1b5e20">Every check passed</Typography>
                    <Typography variant="body2" color="#2e7d32">
                      There is nothing to fix on this page right now.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Passed checks, collapsed */}
              {report.passed.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    onClick={() => setShowPassed((value) => !value)}
                    endIcon={showPassed ? <ExpandLess /> : <ExpandMore />}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#546e7a' }}
                  >
                    {showPassed ? 'Hide' : 'Show'} {report.passed.length} passed check{report.passed.length === 1 ? '' : 's'}
                  </Button>
                  <Collapse in={showPassed}>
                    <Box sx={{ mt: 1.5 }}>
                      {report.passed.map((check) => <CheckRow key={check.id} check={check} />)}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e3e8ee', bgcolor: '#fff' }}>
          <Button onClick={() => setReport(null)} sx={{ color: '#78909c', textTransform: 'none' }}>Close</Button>
          {report && !report.loading && (
            <>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {
                  const row = pages.find((item) => item.route === report.route);
                  if (row) { setReport(null); openEditor(row); }
                }}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#546e7a', borderColor: '#cfd8dc' }}
              >
                Edit SEO
              </Button>
              <Button
                variant="contained" disableElevation
                startIcon={auditingRoute === report.route ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlayArrow />}
                disabled={auditingRoute === report.route}
                onClick={async () => {
                  const fresh = await runAudit(report.route);
                  if (fresh) setReport(fresh);
                }}
                sx={{ bgcolor: ACCENT, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
              >
                Re-run Audit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Edit SEO dialog ── */}
      <Dialog
        open={Boolean(editTarget)}
        onClose={() => { setEditTarget(null); setEditForm(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #1e88e5 100%)`, color: 'white', fontWeight: 'bold', py: 2 }}>
          {editTarget?.hasMetadata ? 'Edit SEO Metadata' : 'Create SEO Metadata'}
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400, wordBreak: 'break-all' }}>
            {editTarget?.route}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {editForm && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              {editTarget.source === 'product' && editTarget.saveTarget === 'product' && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f3e5f5', display: 'flex', gap: 1.5 }}>
                  <Inventory2 sx={{ color: '#6a1b9a' }} fontSize="small" />
                  <Typography variant="body2" color="#4a148c">
                    This is a product page. Saving writes to the product itself, so the
                    same copy shows in the product editor — there is only ever one version.
                    {editTarget.keywordsDerived && ' The keywords below were derived from the product\'s colour, material, and category; replace them to set your own.'}
                  </Typography>
                </Box>
              )}
              {!editTarget.hasMetadata && editTarget.suggested?.title && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#e1f5fe', display: 'flex', gap: 1.5 }}>
                  <Info sx={{ color: '#0288d1' }} fontSize="small" />
                  <Typography variant="body2" color="#01579b">
                    This page has no metadata yet. The fields below are pre-filled with the
                    site's suggested defaults — review them and save to create the record.
                  </Typography>
                </Box>
              )}
              <TextField
                label="Browser Tab Title" value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                fullWidth sx={textFieldStyle}
                helperText={`${editForm.title.length} characters — aim for 30–60. " | Easy Jackets" is appended automatically.`}
                error={editForm.title.length > 60}
              />
              <TextField
                label="Meta Description" value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                fullWidth multiline rows={3} sx={textFieldStyle}
                helperText={`${editForm.description.length} characters — aim for 70–160.`}
                error={editForm.description.length > 160}
              />
              <TextField
                label="Target Keywords" value={editForm.keywords}
                placeholder="varsity jackets, custom letterman jackets, team jackets"
                onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                fullWidth sx={textFieldStyle}
                helperText="Comma separated. 3–8 keywords keeps the page focused."
              />
              {/* Social share image */}
              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e3e8ee', bgcolor: '#fafbfc' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#37474f" mb={0.5}>
                  Social Share Image
                </Typography>
                <Typography variant="caption" color="#78909c" display="block" mb={1.5}>
                  Shown when this page is shared on Facebook, WhatsApp, LinkedIn, or X.
                  Leave empty to use the site-wide default card. Ideal size 1200×630.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{
                    width: 128, height: 67, borderRadius: 1.5, flexShrink: 0,
                    border: '1px dashed #cfd8dc', bgcolor: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {editForm.ogImage ? (
                      <img
                        src={uploadUrl(editForm.ogImage)} alt="Share preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="caption" color="#b0bec5">Site default</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      component="label" size="small" variant="outlined" disabled={uploadingImage}
                      startIcon={uploadingImage ? <CircularProgress size={14} /> : <CloudUpload />}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      {uploadingImage ? 'Uploading…' : 'Upload image'}
                      <input type="file" hidden accept="image/*" onChange={uploadOgImage} />
                    </Button>
                    {editForm.ogImage && (
                      <Button
                        size="small" color="error"
                        onClick={() => setEditForm({ ...editForm, ogImage: '' })}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Product pages live in product-sitemap.xml, which is generated straight
                  from the catalogue — there is no per-product order or priority to set,
                  so showing these controls would imply a setting that does nothing. */}
              {editTarget.saveTarget !== 'product' && (
              <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Sitemap Order" type="number" value={editForm.sitemapOrder}
                  onChange={(e) => setEditForm({ ...editForm, sitemapOrder: e.target.value })}
                  sx={textFieldStyle}
                />
                <TextField
                  label="Priority" type="number" value={editForm.sitemapPriority}
                  onChange={(e) => setEditForm({ ...editForm, sitemapPriority: e.target.value })}
                  inputProps={{ min: 0, max: 1, step: 0.1 }} sx={textFieldStyle}
                />
                <TextField
                  select label="Change Frequency" value={editForm.sitemapChangefreq}
                  onChange={(e) => setEditForm({ ...editForm, sitemapChangefreq: e.target.value })}
                  sx={textFieldStyle}
                >
                  {CHANGEFREQ_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(editForm.sitemapEnabled)}
                    onChange={(e) => setEditForm({ ...editForm, sitemapEnabled: e.target.checked })}
                    color="primary"
                  />
                }
                label="Include this route in sitemap"
              />
              </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button onClick={() => { setEditTarget(null); setEditForm(null); }} sx={{ color: '#888', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={saveEditor} variant="contained" disabled={saving}
            startIcon={!saving && <CheckCircle />}
            sx={{ bgcolor: ACCENT, px: 5, borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Save & Re-audit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeoHealth;
