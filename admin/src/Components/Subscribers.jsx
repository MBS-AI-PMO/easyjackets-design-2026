// People -> Subscribers: everyone who joined the newsletter from the storefront's footer form.
// Search, filter by status, unsubscribe / resubscribe, remove, export CSV, copy the addresses.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, InputAdornment, Paper, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { ContentCopy, Delete, Download, Email, MarkEmailRead, Search, Unsubscribe } from '@mui/icons-material';
import moment from 'moment';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const Subscribers = () => {
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });
    const [status, setStatus] = useState('subscribed');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await instance.get('/features/subscribers', { params: { status: status === 'all' ? undefined : status } });
            setRows(data.subscribers || []);
            setCounts(data.counts || { total: 0, subscribed: 0, unsubscribed: 0 });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not load subscribers');
        } finally {
            setLoading(false);
        }
    }, [status]);
    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? rows.filter((r) => r.email.includes(q)) : rows;
    }, [rows, search]);

    const setSubscribed = async (row, next) => {
        setBusy(row._id);
        try {
            await instance.put(`/features/subscribers/${row._id}`, { status: next });
            toast.success(next === 'subscribed' ? 'Subscribed again' : 'Unsubscribed');
            load();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not update');
        } finally {
            setBusy('');
        }
    };

    const remove = async (row) => {
        if (!window.confirm(`Remove ${row.email} from the list for good?\n\nTo stop emailing them but keep the record, use Unsubscribe instead.`)) return;
        setBusy(row._id);
        try {
            await instance.delete(`/features/subscribers/${row._id}`);
            toast.success('Removed');
            load();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not remove');
        } finally {
            setBusy('');
        }
    };

    const exportCsv = () => {
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [['Email', 'Status', 'Subscribed', 'Unsubscribed', 'Source'].join(',')]
            .concat(visible.map((r) => [r.email, r.status, r.subscribedAt ? moment(r.subscribedAt).format('YYYY-MM-DD HH:mm') : '', r.unsubscribedAt ? moment(r.unsubscribedAt).format('YYYY-MM-DD HH:mm') : '', r.source].map(esc).join(',')));
        const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `easyjackets-subscribers-${moment().format('YYYY-MM-DD')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyEmails = async () => {
        const list = visible.filter((r) => r.status === 'subscribed').map((r) => r.email);
        if (!list.length) { toast.info('No subscribed addresses in this view'); return; }
        try {
            await navigator.clipboard.writeText(list.join(', '));
            toast.success(`${list.length} address${list.length === 1 ? '' : 'es'} copied (paste into BCC)`);
        } catch {
            toast.error('Copy failed');
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, background: 'linear-gradient(135deg,#37a6ff,#1e88e5)', color: '#fff', boxShadow: '0 8px 24px rgba(55,166,255,.25)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <MarkEmailRead sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Newsletter Subscribers</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Everyone who joined from the website footer. New sign-ups appear here and you get an email for each.</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{counts.subscribed}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, letterSpacing: '.06em', textTransform: 'uppercase' }}>on the list</Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* one card: filter tabs + search + actions on top, the list below */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eef1f5' }}>
                    <Tabs
                        value={status}
                        onChange={(_, v) => setStatus(v)}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: 14, px: 1.5, mr: 1 }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#37a6ff' } }}
                    >
                        {[['subscribed', 'Subscribed', counts.subscribed], ['unsubscribed', 'Unsubscribed', counts.unsubscribed], ['all', 'All', counts.total]].map(([value, label, n]) => (
                            <Tab key={value} value={value} label={(
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {label}
                                    <Box component="span" sx={{ minWidth: 22, px: 0.75, py: 0.1, borderRadius: 10, fontSize: 12, fontWeight: 700, bgcolor: status === value ? '#37a6ff' : '#eef1f5', color: status === value ? '#fff' : '#667085' }}>{n}</Box>
                                </Box>
                            )} />
                        ))}
                    </Tabs>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.25, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Search email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2, bgcolor: '#fafbfc' } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#98a2b3' }} /></InputAdornment> }}
                        />
                        <Tooltip title="Copy every subscribed address in this view (paste into BCC)">
                            <span>
                                <Button variant="outlined" startIcon={<ContentCopy fontSize="small" />} onClick={copyEmails} disabled={!visible.length}
                                    sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#d0d5dd', color: '#344054', '&:hover': { borderColor: '#37a6ff', bgcolor: '#f0f8ff' } }}>
                                    Copy emails
                                </Button>
                            </span>
                        </Tooltip>
                        <Button variant="contained" disableElevation startIcon={<Download fontSize="small" />} onClick={exportCsv} disabled={!visible.length}
                            sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#37a6ff', '&:hover': { bgcolor: '#1e88e5' } }}>
                            Export CSV
                        </Button>
                    </Box>
                </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, color: '#555', bgcolor: '#fafbfc' } }}>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Subscribed</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        ) : !visible.length ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#888' }}>
                                {search ? 'No subscriber matches that search.' : status === 'unsubscribed' ? 'Nobody has unsubscribed.' : 'No subscribers yet. They appear here as soon as someone joins from the website footer.'}
                            </TableCell></TableRow>
                        ) : visible.map((r) => (
                            <TableRow key={r._id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{r.email}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={r.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                                        sx={r.status === 'subscribed' ? { bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 } : { bgcolor: '#fdecea', color: '#c62828', fontWeight: 700 }} />
                                </TableCell>
                                <TableCell sx={{ color: '#666' }}>
                                    {r.subscribedAt ? moment(r.subscribedAt).format('MMM D, YYYY · h:mm a') : '-'}
                                    {r.status === 'unsubscribed' && r.unsubscribedAt ? <Typography variant="caption" display="block" sx={{ color: '#c62828' }}>left {moment(r.unsubscribedAt).format('MMM D, YYYY')}</Typography> : null}
                                </TableCell>
                                <TableCell sx={{ color: '#666' }}>{r.source || '-'}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Email them"><IconButton size="small" href={`mailto:${r.email}`}><Email fontSize="small" /></IconButton></Tooltip>
                                    {r.status === 'subscribed' ? (
                                        <Tooltip title="Unsubscribe (keep the record)"><span><IconButton size="small" disabled={busy === r._id} onClick={() => setSubscribed(r, 'unsubscribed')}><Unsubscribe fontSize="small" /></IconButton></span></Tooltip>
                                    ) : (
                                        <Tooltip title="Subscribe again"><span><IconButton size="small" disabled={busy === r._id} onClick={() => setSubscribed(r, 'subscribed')} sx={{ color: '#2e7d32' }}><MarkEmailRead fontSize="small" /></IconButton></span></Tooltip>
                                    )}
                                    <Tooltip title="Remove for good"><span><IconButton size="small" disabled={busy === r._id} onClick={() => remove(r)} sx={{ color: '#e53935' }}><Delete fontSize="small" /></IconButton></span></Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>
        </Box>
    );
};

export default Subscribers;
