import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, TextField, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, LinearProgress, MenuItem, Tooltip, Switch, Collapse,
  InputAdornment, TablePagination, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import {
  Search, Refresh, VisibilityOff, Visibility, CheckCircle, Inventory2,
  Language, Policy,
} from '@mui/icons-material';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

const ACCENT = '#37a6ff';

// Same three sources SEO Health uses. This screen is a second view over exactly
// the same page list and the same endpoints — there is no separate index store.
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

const IndexControl = () => {
  const [pages, setPages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [selected, setSelected] = useState([]);
  const [togglingRoute, setTogglingRoute] = useState('');
  const [bulkWorking, setBulkWorking] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);

  const fetchPages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await instance.get('/seo-health/pages');
      setPages(data.pages || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error(error?.response?.data?.message || 'Error loading pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const toggleIndexing = async (row) => {
    const noIndex = !row.noIndex;
    setTogglingRoute(row.route);
    try {
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
      setConfirmHide(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pages.filter((row) => {
      if (term && !(
        row.route.toLowerCase().includes(term) ||
        (row.title || '').toLowerCase().includes(term)
      )) return false;
      if (sourceFilter !== 'all' && row.source !== sourceFilter) return false;
      if (statusFilter === 'indexed') return !row.noIndex;
      if (statusFilter === 'hidden') return row.noIndex;
      return true;
    });
  }, [pages, search, statusFilter, sourceFilter]);

  useEffect(() => { setPageIndex(0); setSelected([]); }, [search, statusFilter, sourceFilter]);

  const visible = filtered.slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage);
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

      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #455a64 0%, #263238 100%)',
        color: 'white', borderRadius: 3, boxShadow: '0 8px 24px rgba(38, 50, 56, 0.2)',
      }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
                <Policy sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">Index Control</Typography>
                <Typography variant="body1" sx={{ opacity: 0.85 }}>
                  Choose which pages Google is allowed to show. Hiding a page adds a
                  noindex tag and removes it from the sitemap in one step.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchPages()}
              disabled={loading}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,.1)' } }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <StatCard
          label="Visible to Google"
          value={summary?.indexablePages ?? '—'}
          caption="Indexed and in the sitemap"
          color="#2e7d32"
          icon={<Visibility />}
        />
        <StatCard
          label="Hidden from Search"
          value={summary?.noIndexPages ?? '—'}
          caption="noindex + excluded from sitemap"
          color="#455a64"
          icon={<VisibilityOff />}
        />
        <StatCard
          label="Product Pages"
          value={sourceCounts.product ?? '—'}
          caption="One per live product"
          color="#6a1b9a"
          icon={<Inventory2 />}
        />
        <StatCard
          label="Total Pages"
          value={summary?.totalPages ?? '—'}
          caption="Rebuilt from live data"
          color={ACCENT}
          icon={<Language />}
        />
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', py: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search by URL or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...textFieldStyle, flex: '1 1 300px' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#90a4ae' }} /></InputAdornment> }}
          />
          <TextField
            select size="small" label="Status" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ ...textFieldStyle, minWidth: 190 }}
          >
            <MenuItem value="all">All statuses ({pages.length})</MenuItem>
            <MenuItem value="indexed">Visible to Google ({summary?.indexablePages ?? 0})</MenuItem>
            <MenuItem value="hidden">Hidden from search ({summary?.noIndexPages ?? 0})</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Page type" value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            sx={{ ...textFieldStyle, minWidth: 200 }}
          >
            <MenuItem value="all">Every type ({pages.length})</MenuItem>
            <MenuItem value="product">Product pages ({sourceCounts.product || 0})</MenuItem>
            <MenuItem value="metadata">Configured pages ({sourceCounts.metadata || 0})</MenuItem>
            <MenuItem value="discovered">Discovered ({sourceCounts.discovered || 0})</MenuItem>
          </TextField>
        </CardContent>
      </Card>

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
              onClick={() => setConfirmHide(true)}
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

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table size="small">
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
              {['Page', 'Type', 'In Sitemap', 'Search Visibility'].map((head, index) => (
                <TableCell
                  key={head}
                  sx={{
                    bgcolor: '#f8f9fa', color: '#546e7a', fontWeight: 'bold',
                    fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
                    textAlign: index === 0 ? 'left' : 'center', whiteSpace: 'nowrap',
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((row) => {
              const source = SOURCE_META[row.source] || SOURCE_META.discovered;
              const isSelected = selected.includes(row.route);
              const inSitemap = !row.noIndex && row.sitemapEnabled !== false;
              return (
                <TableRow
                  key={row.route}
                  hover
                  selected={isSelected}
                  sx={{ bgcolor: row.noIndex ? '#fafafa' : 'inherit' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(row.route)}
                      sx={{ color: '#b0bec5', '&.Mui-checked': { color: ACCENT } }}
                    />
                  </TableCell>

                  <TableCell sx={{ maxWidth: 460 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: row.noIndex ? '#90a4ae' : ACCENT, wordBreak: 'break-all' }}
                    >
                      {row.route}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#90a4ae', display: 'block' }} noWrap>
                      {row.title || <em>No meta title set</em>}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={source.label}
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: source.soft, color: source.color }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {inSitemap ? (
                      <Chip size="small" label="Listed" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                    ) : (
                      <Tooltip title={row.noIndex
                        ? 'Removed automatically because the page is hidden from search.'
                        : 'Excluded by the sitemap switch under Edit SEO.'}
                      >
                        <Chip size="small" label="Excluded" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#eceff1', color: '#607d8b' }} />
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell align="center" sx={{ width: 190 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: row.noIndex ? '#90a4ae' : '#2e7d32', minWidth: 58, textAlign: 'left' }}
                      >
                        {row.noIndex ? 'Hidden' : 'Visible'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {!visible.length && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8, color: '#b0bec5' }}>
                  <Language sx={{ fontSize: 56, opacity: 0.25, mb: 1 }} />
                  <Typography variant="h6" color="#90a4ae">
                    {pages.length ? 'No pages match these filters' : 'No pages found'}
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
            rowsPerPageOptions={[25, 50, 100, 200]}
          />
        )}
      </TableContainer>

      {/* Hiding pages loses search traffic and takes weeks to undo once Google has
          dropped them, so bulk hide confirms first. Bulk un-hide does not — it is
          the safe direction. */}
      <Dialog open={confirmHide} onClose={() => setConfirmHide(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Hide {selected.length} page{selected.length === 1 ? '' : 's'} from Google?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#546e7a' }}>
            These pages will render a <strong>noindex</strong> tag and drop out of every
            sitemap. Google usually removes them within a few days, but getting them back
            into the results afterwards can take considerably longer. You can reverse this
            at any time with the Allow indexing button.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmHide(false)} sx={{ color: '#78909c', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" color="error" disableElevation disabled={bulkWorking}
            onClick={() => bulkIndexing(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {bulkWorking ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Hide from search'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndexControl;
