// People -> Activity Log: everything each admin did, in order (the backend's admin activity ledger,
// helpers/adminLedger.js). Entries can't be changed or deleted, and each one is chained to the one before by
// its hash, so the "Ledger check" shows if anyone altered the stored log outside the admin.
// Read only: one card per admin (click to filter), filters, CSV export, and a table whose rows open to show
// what was sent (secrets and images are never stored).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Collapse, IconButton, InputAdornment, MenuItem,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip,
    Typography,
} from '@mui/material';
import {
    Download, GppBad, KeyboardArrowDown, KeyboardArrowUp, ManageHistory, Refresh, Search, VerifiedUser,
} from '@mui/icons-material';
import moment from 'moment';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const NO_FILTERS = { admin: '', area: '', ok: '', from: '', to: '' };

// The filters as the API takes them; a day picked here runs from local midnight to the end of that local day.
const toParams = (filters, q) => {
    const params = {};
    if (filters.admin) params.admin = filters.admin;
    if (filters.area) params.area = filters.area;
    if (filters.ok) params.ok = filters.ok;
    if (filters.from) params.from = new Date(`${filters.from}T00:00:00`).toISOString();
    if (filters.to) params.to = new Date(`${filters.to}T23:59:59.999`).toISOString();
    if (q) params.q = q;
    return params;
};

const headCellSx = { fontWeight: 700, color: '#555', bgcolor: '#fafbfc', whiteSpace: 'nowrap' };
const fieldSx = { '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2, bgcolor: '#fafbfc' } };

// One value of an entry's details: text, a short list, or (two levels at most) a nested object.
const DetailValue = ({ value }) => {
    if (value === null || value === '') return <Box component="span" sx={{ color: '#98a2b3' }}>empty</Box>;
    if (value === '[hidden]') return <Box component="span" sx={{ color: '#98a2b3', fontStyle: 'italic' }}>hidden</Box>;
    if (typeof value === 'boolean') return value ? 'yes' : 'no';
    if (Array.isArray(value)) return value.length ? value.map((v) => String(v)).join(', ') : <Box component="span" sx={{ color: '#98a2b3' }}>none</Box>;
    if (typeof value === 'object') {
        return (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {Object.entries(value).map(([key, v]) => (
                    <li key={key}><Box component="span" sx={{ color: '#667085' }}>{key}:</Box> <DetailValue value={v} /></li>
                ))}
            </Box>
        );
    }
    return String(value);
};

const EntryDetails = ({ entry }) => {
    const fields = Object.entries(entry.details || {});
    const rows = [
        ...fields.map(([key, value]) => [key, <DetailValue value={value} />]),
        ['Request', <Box component="span" sx={{ fontFamily: 'monospace' }}>{entry.method} {entry.path}</Box>],
        ...(entry.target?.id ? [['Item id', <Box component="span" sx={{ fontFamily: 'monospace' }}>{entry.target.id}</Box>]] : []),
        ['Browser', entry.userAgent || '—'],
        ['Entry hash', (
            <Tooltip title={`Previous entry's hash: ${entry.prevHash}`}>
                <Box component="span" sx={{ fontFamily: 'monospace', color: '#667085', wordBreak: 'break-all' }}>{entry.hash}</Box>
            </Tooltip>
        )],
    ];
    return (
        <Box sx={{ px: { xs: 2, md: 7 }, py: 2, bgcolor: '#fafcff', borderBottom: '1px solid #eef1f5' }}>
            {!fields.length && (
                <Typography variant="body2" sx={{ color: '#98a2b3', mb: 1 }}>Nothing was sent with this request.</Typography>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(110px, max-content) 1fr', columnGap: 3, rowGap: 0.75, fontSize: 13 }}>
                {rows.map(([key, value], index) => (
                    <React.Fragment key={`${key}-${index}`}>
                        <Box sx={{ color: '#667085', fontWeight: 600 }}>{key}</Box>
                        <Box sx={{ color: '#344054', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</Box>
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

const EntryRow = ({ entry, open, onToggle, flagged }) => {
    const item = entry.target?.label || entry.target?.id || '';
    return (
        <>
            <TableRow
                hover
                onClick={onToggle}
                sx={{
                    cursor: 'pointer',
                    // the entry where the ledger check found the chain broken
                    ...(flagged ? { bgcolor: '#fdecea', boxShadow: 'inset 3px 0 0 #c62828' } : {}),
                    '& > td': { borderBottom: open ? 'none' : '1px solid #f0f0f0' },
                }}
            >
                <TableCell sx={{ width: 44, pr: 0 }}>
                    <IconButton size="small" aria-label={open ? 'Hide details' : 'Show details'}>
                        {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#667085' }}>{entry.seq}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {moment(entry.at).format('MMM D, YYYY')}
                    <Typography variant="caption" display="block" sx={{ color: '#667085' }}>{moment(entry.at).format('h:mm:ss a')}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#333' }}>{entry.admin?.name || '—'}</Typography>
                    <Typography variant="caption" noWrap display="block" sx={{ color: '#667085' }}>{entry.admin?.email}</Typography>
                </TableCell>
                <TableCell>
                    <Chip size="small" label={entry.area || '—'} sx={{ bgcolor: '#eef6ff', color: '#1e88e5', fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333' }}>{entry.action}</TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                    <Tooltip title={entry.target?.label && entry.target?.id ? entry.target.id : ''}>
                        <Typography variant="body2" noWrap sx={{ color: item ? '#555' : '#98a2b3', fontFamily: entry.target?.label ? 'inherit' : 'monospace' }}>
                            {item || '—'}
                        </Typography>
                    </Tooltip>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Box component="span" sx={{ fontWeight: 800, color: entry.ok ? '#2e7d32' : '#c62828', mr: 0.75 }}>{entry.ok ? '✓' : '✗'}</Box>
                    <Box component="span" sx={{ fontSize: 12, color: '#667085' }}>{entry.status}</Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: '#667085', whiteSpace: 'nowrap' }}>{entry.ip || '—'}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={9} sx={{ p: 0, borderBottom: open ? undefined : 'none' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <EntryDetails entry={entry} />
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const AdminCard = ({ admin, selected, onClick }) => (
    <Paper
        onClick={onClick}
        sx={{
            p: 2,
            borderRadius: 3,
            cursor: 'pointer',
            border: selected ? '2px solid #37a6ff' : '2px solid transparent',
            bgcolor: selected ? '#f0f8ff' : '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,.05)',
            transition: 'all .15s ease',
            '&:hover': { boxShadow: '0 4px 16px rgba(55,166,255,.18)', transform: 'translateY(-1px)' },
            opacity: admin.isAdmin ? 1 : 0.85,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{
                width: 40, height: 40, flexShrink: 0, borderRadius: '10px', bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
            }}>
                {(admin.name || admin.email || '?').charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#333' }}>{admin.name || '—'}</Typography>
                <Typography variant="caption" noWrap display="block" sx={{ color: '#667085' }}>{admin.email}</Typography>
            </Box>
            {!admin.isAdmin && (
                <Tooltip title="No longer an admin (deleted or demoted). Their entries stay in the log.">
                    <Chip size="small" label="Removed" variant="outlined" sx={{ color: '#667085', borderColor: '#d0d5dd' }} />
                </Tooltip>
            )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#344054', fontWeight: 700 }}>
                {admin.total} action{admin.total === 1 ? '' : 's'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#98a2b3' }}>·</Typography>
            <Tooltip title={admin.lastAt ? moment(admin.lastAt).format('MMM D, YYYY · h:mm:ss a') : ''}>
                <Typography variant="caption" sx={{ color: '#667085' }}>
                    {admin.lastAt ? `active ${moment(admin.lastAt).fromNow()}` : 'no activity yet'}
                </Typography>
            </Tooltip>
            {admin.failedSignIns > 0 && (
                <Tooltip title="Wrong passwords for this account in the last 30 days">
                    <Chip size="small" label={`${admin.failedSignIns} failed sign-in${admin.failedSignIns === 1 ? '' : 's'}`}
                        sx={{ bgcolor: '#fdecea', color: '#c62828', fontWeight: 700, height: 22 }} />
                </Tooltip>
            )}
        </Box>
    </Paper>
);

// The header's "Ledger check": the result of walking the whole hash chain on the server.
const LedgerBadge = ({ check, onRecheck }) => {
    let icon = <CircularProgress size={16} sx={{ color: '#37a6ff' }} />;
    let label = 'Checking the ledger…';
    let color = '#344054';
    if (!check.loading && check.error) {
        icon = <GppBad fontSize="small" />;
        label = 'Ledger check unavailable';
        color = '#b54708';
    } else if (!check.loading && check.intact) {
        icon = <VerifiedUser fontSize="small" />;
        label = `Intact — ${check.count} entr${check.count === 1 ? 'y' : 'ies'}`;
        color = '#2e7d32';
    } else if (!check.loading) {
        icon = <GppBad fontSize="small" />;
        label = `Broken at #${check.brokenAt}`;
        color = '#c62828';
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={!check.loading && check.intact === false && check.reason ? check.reason : 'Every entry is present, linked to the one before, and unchanged since it was written'}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', color, px: 1.5, py: 0.75, borderRadius: 2, fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                    {icon}
                    <span>{label}</span>
                </Box>
            </Tooltip>
            <Tooltip title="Check again">
                <span>
                    <IconButton size="small" onClick={onRecheck} disabled={check.loading} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,.18)', '&:hover': { bgcolor: 'rgba(255,255,255,.28)' } }}>
                        <Refresh fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

const ActivityLog = () => {
    const [admins, setAdmins] = useState([]);
    const [areas, setAreas] = useState([]);
    const [check, setCheck] = useState({ loading: true });
    const [filters, setFilters] = useState(NO_FILTERS);
    const [search, setSearch] = useState('');
    const [q, setQ] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [data, setData] = useState({ entries: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openSeq, setOpenSeq] = useState(null);
    const [exporting, setExporting] = useState(false);
    const latestRequest = useRef(0);

    const loadSummary = useCallback(async () => {
        try {
            const [adminsRes, areasRes] = await Promise.all([
                instance.get('/admin-logs/admins'),
                instance.get('/admin-logs/areas'),
            ]);
            setAdmins(adminsRes.data.admins || []);
            setAreas(areasRes.data.areas || []);
        } catch (err) {
            console.error('Error loading the activity summary:', err);
        }
    }, []);

    const runCheck = useCallback(async () => {
        setCheck({ loading: true });
        try {
            const { data: result } = await instance.get('/admin-logs/verify');
            setCheck({ loading: false, ...result });
        } catch (err) {
            setCheck({ loading: false, error: err?.response?.data?.message || 'Could not check the ledger' });
        }
    }, []);

    useEffect(() => { loadSummary(); runCheck(); }, [loadSummary, runCheck]);

    // search as you type, once typing pauses
    useEffect(() => {
        const timer = setTimeout(() => {
            setQ(search.trim().slice(0, 100));
            setPage(0);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const loadEntries = useCallback(async () => {
        const requestId = latestRequest.current + 1;
        latestRequest.current = requestId;
        setLoading(true);
        setError('');
        try {
            const { data: result } = await instance.get('/admin-logs', {
                params: { ...toParams(filters, q), page: page + 1, limit: rowsPerPage },
            });
            if (latestRequest.current !== requestId) return; // a newer filter's answer is on its way
            setData({ entries: result.entries || [], total: result.total || 0 });
        } catch (err) {
            if (latestRequest.current !== requestId) return;
            setError(err?.response?.data?.message || 'Could not load the activity log.');
        } finally {
            if (latestRequest.current === requestId) setLoading(false);
        }
    }, [filters, q, page, rowsPerPage]);

    useEffect(() => { loadEntries(); }, [loadEntries]);

    const setFilter = (name, value) => {
        setFilters((current) => ({ ...current, [name]: value }));
        setPage(0);
    };

    const refreshAll = () => {
        loadEntries();
        loadSummary();
        runCheck();
    };

    const hasFilters = useMemo(() => Boolean(q) || Object.keys(NO_FILTERS).some((key) => filters[key]), [filters, q]);
    const clearFilters = () => {
        setFilters(NO_FILTERS);
        setSearch('');
        setQ('');
        setPage(0);
    };

    // the CSV comes through the signed-in API (the token is a header, so a plain link would not work)
    const exportCsv = async () => {
        setExporting(true);
        try {
            const res = await instance.get('/admin-logs/export.csv', { params: toParams(filters, q), responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `easyjackets-admin-activity-${moment().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error('Error exporting the activity log:', err);
            toast.error('Could not export the activity log');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, background: 'linear-gradient(135deg,#37a6ff,#1e88e5)', color: '#fff', boxShadow: '0 8px 24px rgba(55,166,255,.25)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <ManageHistory sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Activity Log</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Everything each admin does, in order. Entries can't be edited or deleted, and each one is chained to the one
                            before it, so any tampering with the stored log shows up in the ledger check.
                        </Typography>
                    </Box>
                    <LedgerBadge check={check} onRecheck={runCheck} />
                </CardContent>
            </Card>

            {!check.loading && check.intact === false && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>The ledger check failed at entry #{check.brokenAt}.</strong> {check.reason}. The stored log was changed outside
                    the admin; entries before #{check.brokenAt} are still verified.
                </Alert>
            )}

            {/* one card per admin: click to see only their activity */}
            {admins.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                    {admins.map((admin) => (
                        <AdminCard
                            key={admin._id}
                            admin={admin}
                            selected={filters.admin === admin._id}
                            onClick={() => setFilter('admin', filters.admin === admin._id ? '' : admin._id)}
                        />
                    ))}
                </Box>
            )}

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 2, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', borderBottom: '1px solid #eef1f5' }}>
                    <TextField select size="small" label="Admin" value={filters.admin} onChange={(e) => setFilter('admin', e.target.value)} sx={{ ...fieldSx, minWidth: 170 }}>
                        <MenuItem value="">All admins</MenuItem>
                        {admins.map((admin) => (
                            <MenuItem key={admin._id} value={admin._id}>{admin.name || admin.email}{admin.isAdmin ? '' : ' (removed)'}</MenuItem>
                        ))}
                    </TextField>
                    <TextField select size="small" label="Area" value={filters.area} onChange={(e) => setFilter('area', e.target.value)} sx={{ ...fieldSx, minWidth: 150 }}>
                        <MenuItem value="">All areas</MenuItem>
                        {areas.map((area) => <MenuItem key={area} value={area}>{area}</MenuItem>)}
                    </TextField>
                    <TextField select size="small" label="Result" value={filters.ok} onChange={(e) => setFilter('ok', e.target.value)} sx={{ ...fieldSx, minWidth: 130 }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">Succeeded</MenuItem>
                        <MenuItem value="false">Failed</MenuItem>
                    </TextField>
                    <TextField type="date" size="small" label="From" value={filters.from} onChange={(e) => setFilter('from', e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ ...fieldSx, width: 160 }} />
                    <TextField type="date" size="small" label="To" value={filters.to} onChange={(e) => setFilter('to', e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ ...fieldSx, width: 160 }} />
                    <TextField
                        size="small"
                        placeholder="Search action, item, route, email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value.slice(0, 100))}
                        sx={{ ...fieldSx, flex: '1 1 220px', minWidth: 200 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#98a2b3' }} /></InputAdornment> }}
                    />
                    {hasFilters && (
                        <Button onClick={clearFilters} sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#667085' }}>
                            Clear
                        </Button>
                    )}
                    <Tooltip title="Reload">
                        <IconButton onClick={refreshAll} sx={{ border: '1px solid #d0d5dd', borderRadius: 2, width: 40, height: 40 }}>
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Button variant="contained" disableElevation startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <Download fontSize="small" />}
                        onClick={exportCsv} disabled={exporting || !data.total}
                        sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#37a6ff', '&:hover': { bgcolor: '#1e88e5' } }}>
                        Export CSV
                    </Button>
                </Box>

                <TableContainer>
                    <Table size="small" sx={{ minWidth: 960, '& td, & th': { px: 1.25 } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headCellSx} />
                                <TableCell sx={headCellSx}>#</TableCell>
                                <TableCell sx={headCellSx}>Date &amp; time</TableCell>
                                <TableCell sx={headCellSx}>Admin</TableCell>
                                <TableCell sx={headCellSx}>Area</TableCell>
                                <TableCell sx={headCellSx}>Action</TableCell>
                                <TableCell sx={headCellSx}>Item</TableCell>
                                <TableCell sx={headCellSx}>Result</TableCell>
                                <TableCell sx={headCellSx}>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {error ? (
                                <TableRow><TableCell colSpan={9} sx={{ py: 4 }}>
                                    <Alert severity="error" action={<Button onClick={loadEntries}>Retry</Button>}>{error}</Alert>
                                </TableCell></TableRow>
                            ) : loading && !data.entries.length ? (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                            ) : !data.entries.length ? (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: '#888' }}>
                                    {hasFilters
                                        ? 'No activity matches these filters.'
                                        : 'Nothing logged yet. Every change an admin makes, and every admin sign-in, will show up here.'}
                                </TableCell></TableRow>
                            ) : data.entries.map((entry) => (
                                <EntryRow
                                    key={entry.seq}
                                    entry={entry}
                                    open={openSeq === entry.seq}
                                    flagged={check.intact === false && check.brokenAt === entry.seq}
                                    onToggle={() => setOpenSeq((current) => (current === entry.seq ? null : entry.seq))}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', px: 1, borderTop: '1px solid #eef1f5' }}>
                    <Box sx={{ pl: 1.5, minHeight: 24 }}>
                        {loading && data.entries.length > 0 && <CircularProgress size={18} />}
                    </Box>
                    <TablePagination
                        component="div"
                        count={data.total}
                        page={data.total ? page : 0}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[25, 50, 100]}
                        onPageChange={(_, next) => setPage(next)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default ActivityLog;
