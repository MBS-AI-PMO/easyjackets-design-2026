// People -> Security Events: security events of every account, customers included (backend
// models/securityEvent.js): wrong and locked sign-ins, password resets and changes, email changes, refused admin
// access, rate limits. The Activity Log covers what admins did; this is where an attack on any
// account shows. Read only; events are kept 180 days.
import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Refresh, Search, Shield } from '@mui/icons-material';
import moment from 'moment';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const LABELS = {
    'login-failed': 'Wrong password',
    'login-locked': 'Sign-in locked',
    'password-reset-requested': 'Reset email asked for',
    'password-reset': 'Password reset',
    'password-changed': 'Password changed',
    'email-changed': 'Email changed',
    'admin-denied': 'Refused admin access',
    'session-revoked-use': 'Ended session used',
    'rate-limited': 'Slowed by a limit',
    'webhook-signature-failed': 'Fake payment notice refused',
    'admin-change': 'Sensitive admin change',
    'ledger-broken': 'Activity log check failed',
};
const SERIOUS = new Set(['login-locked', 'admin-denied', 'session-revoked-use', 'webhook-signature-failed', 'ledger-broken']);
const headCellSx = { fontWeight: 700, color: '#555', bgcolor: '#fafbfc', whiteSpace: 'nowrap' };
const fieldSx = { '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2, bgcolor: '#fafbfc' } };

const describe = (details = {}) => Object.entries(details)
    .map(([key, value]) => `${key}: ${typeof value === 'boolean' ? (value ? 'yes' : 'no') : value}`)
    .join(' · ');

function SecurityEvents() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [lastDay, setLastDay] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [type, setType] = useState('');
    const [q, setQ] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            if (type) params.type = type;
            if (search) params.q = search;
            const { data } = await instance.get('/admin-logs/security-events', { params });
            setRows(data.events || []);
            setTotal(data.total || 0);
            setLastDay(data.lastDay || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not load the security events');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, type, search]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        const timer = setTimeout(() => { setPage(0); setSearch(q.trim()); }, 400);
        return () => clearTimeout(timer);
    }, [q]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)', color: 'white', borderRadius: 3 }}>
                <CardContent sx={{ py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}><Shield sx={{ fontSize: 32 }} /></Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h5" fontWeight="bold">Security Events</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Sign-ins, resets and refused access for every account. Serious ones are also emailed to the admin address.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#667085', mb: 1 }}>Last 24 hours</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {lastDay.length ? lastDay.map((row) => (
                        <Chip
                            key={row.type}
                            label={`${LABELS[row.type] || row.type}: ${row.count}`}
                            color={SERIOUS.has(row.type) ? 'warning' : 'default'}
                            variant={type === row.type ? 'filled' : 'outlined'}
                            onClick={() => { setPage(0); setType(type === row.type ? '' : row.type); }}
                        />
                    )) : <Typography variant="body2" color="text.secondary">Nothing in the last 24 hours.</Typography>}
                </Box>
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                        select size="small" label="Kind" value={type} sx={{ ...fieldSx, minWidth: 220 }}
                        onChange={(e) => { setPage(0); setType(e.target.value); }}
                    >
                        <MenuItem value="">Every kind</MenuItem>
                        {Object.entries(LABELS).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                    </TextField>
                    <TextField
                        size="small" placeholder="Email or IP address" value={q} onChange={(e) => setQ(e.target.value)} sx={{ ...fieldSx, minWidth: 240 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    />
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Refresh"><span><IconButton onClick={load} disabled={loading}><Refresh /></IconButton></span></Tooltip>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headCellSx}>When</TableCell>
                                <TableCell sx={headCellSx}>What</TableCell>
                                <TableCell sx={headCellSx}>Account</TableCell>
                                <TableCell sx={headCellSx}>IP address</TableCell>
                                <TableCell sx={headCellSx}>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                            ) : rows.length ? rows.map((row) => (
                                <TableRow key={row._id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Tooltip title={moment(row.at).format('YYYY-MM-DD HH:mm:ss')}><span>{moment(row.at).fromNow()}</span></Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="small" label={LABELS[row.type] || row.type} color={SERIOUS.has(row.type) ? 'warning' : 'default'} variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={{ wordBreak: 'break-all' }}>
                                        {row.email || '—'}{row.admin ? <Chip size="small" label="admin" sx={{ ml: 1 }} /> : null}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{row.ip || '—'}</TableCell>
                                    <TableCell sx={{ color: '#667085', fontSize: 13 }}>
                                        <Tooltip title={row.userAgent || ''}><span>{describe(row.details) || '—'}</span></Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#98a2b3' }}>No security events for this filter.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div" count={total} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[25, 50, 100]}
                    onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Paper>
        </Box>
    );
}

export default SecurityEvents;
