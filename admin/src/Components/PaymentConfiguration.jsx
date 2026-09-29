// Settings → Payment Configuration: Stripe keys for LIVE and the TEST sandbox, and which one the
// site uses. Secret keys and webhook secrets are write-only here: the server stores them
// encrypted and only ever tells this screen whether one is set and its last four characters.
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, Switch, TextField,
    Tooltip, Typography,
} from '@mui/material';
import { CheckCircle, ContentCopy, CreditCard, Error as ErrorIcon, Save, Science, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const MODES = [
    { key: 'live', title: 'Live keys', note: 'Real payments. Keys start with pk_live_ / sk_live_.', color: '#d32f2f' },
    { key: 'test', title: 'Sandbox keys', note: 'Stripe test mode: no real money moves. Keys start with pk_test_ / sk_test_.', color: '#1976d2' },
];
const EMPTY_SIDE = { publishableKey: '', secretKey: '', webhookSecret: '' };

const SecretField = ({ label, value, onChange, has, hint, source, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <TextField
            fullWidth
            type={show ? 'text' : 'password'}
            label={label}
            value={value}
            onChange={onChange}
            autoComplete="off"
            placeholder={has ? `${hint} (leave blank to keep)` : placeholder}
            helperText={has ? `Saved${source === 'environment' ? ' in the server environment' : ' here'} · ends ${hint.slice(-4)}. Leave blank to keep it.` : 'Not set'}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide' : 'Show'}>
                            {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

const PaymentConfiguration = () => {
    const [config, setConfig] = useState(null);
    const [form, setForm] = useState({ live: { ...EMPTY_SIDE }, test: { ...EMPTY_SIDE } });
    const [mode, setMode] = useState('test');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState('');
    const [confirmLive, setConfirmLive] = useState(false);

    const apply = (c) => {
        setConfig(c);
        setMode(c.mode);
        setForm({
            live: { ...EMPTY_SIDE, publishableKey: c.live.publishableKey || '' },
            test: { ...EMPTY_SIDE, publishableKey: c.test.publishableKey || '' },
        });
    };

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await instance.get('/payment-config');
            apply(res.data.config);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not load payment configuration');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const set = (side, field) => (e) => setForm((f) => ({ ...f, [side]: { ...f[side], [field]: e.target.value } }));

    const save = async (nextMode = mode) => {
        setSaving(true);
        try {
            const body = { mode: nextMode };
            for (const { key } of MODES) {
                body[key] = {};
                for (const field of ['publishableKey', 'secretKey', 'webhookSecret']) {
                    const value = form[key][field].trim();
                    // publishable keys are shown in full, so only send them when they changed
                    if (field === 'publishableKey' ? value && value !== (config[key].publishableKey || '') : value) body[key][field] = value;
                }
            }
            const res = await instance.put('/payment-config', body);
            apply(res.data.config);
            toast.success(`Saved. The site now takes ${res.data.config.mode === 'live' ? 'LIVE' : 'SANDBOX'} payments.`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not save payment configuration');
            setMode(config?.mode || 'test');
        } finally {
            setSaving(false);
        }
    };

    const test = async (side) => {
        setTesting(side);
        try {
            const res = await instance.post('/payment-config/test', { mode: side, secretKey: form[side].secretKey.trim() || undefined });
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Stripe refused the key');
        } finally {
            setTesting('');
            fetchConfig();
        }
    };

    const onToggle = (e) => {
        const next = e.target.checked ? 'live' : 'test';
        if (next === 'live') { setConfirmLive(true); return; }
        setMode('test');
        save('test');
    };

    if (loading || !config) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
    }

    const last = config.lastTest;
    const isLive = mode === 'live';
    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <CreditCard sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>Payment Configuration</Typography>
                        {last ? (
                            <Chip size="small" variant="outlined" color={last.status === 'success' ? 'success' : 'error'}
                                icon={last.status === 'success' ? <CheckCircle /> : <ErrorIcon />}
                                label={`Last test (${last.mode === 'live' ? 'live' : 'sandbox'}): ${last.status === 'success' ? 'passed' : 'failed'}`} />
                        ) : <Chip size="small" variant="outlined" label="Never tested" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Stripe processes every card payment on the site. Keys are stored encrypted on the server and are never shown again after saving.
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderColor: isLive ? '#d32f2f' : '#1976d2', bgcolor: isLive ? '#fff5f5' : '#f3f8ff' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                                Stripe mode: <Chip size="small" label={isLive ? 'LIVE' : 'SANDBOX'} sx={{ ml: 0.5, fontWeight: 700, color: '#fff', bgcolor: isLive ? '#d32f2f' : '#1976d2' }} />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isLive ? 'Customers are charged real money.' : 'Test mode: use Stripe test cards (4242 4242 4242 4242), no money moves.'}
                                {config.modeSource === 'environment' ? ' (Currently from the server environment; switching saves it here.)' : ''}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Sandbox</Typography>
                            <Switch checked={isLive} onChange={onToggle} disabled={saving} color="error" inputProps={{ 'aria-label': 'Live payments' }} />
                            <Typography variant="body2">Live</Typography>
                        </Box>
                    </Paper>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {MODES.map(({ key, title, note, color }) => {
                    const side = config[key];
                    return (
                        <Grid item xs={12} md={6} key={key}>
                            <Paper sx={{ p: 3, borderRadius: 4, height: '100%', borderTop: `4px solid ${color}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>{title}</Typography>
                                    {mode === key ? <Chip size="small" label="In use" sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} /> : null}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{note}</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Publishable key" value={form[key].publishableKey} onChange={set(key, 'publishableKey')}
                                            placeholder={`pk_${key}_…`} autoComplete="off"
                                            helperText={side.publishableKey ? `Saved${side.publishableKeySource === 'environment' ? ' in the server environment' : ' here'}` : 'Not set'} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SecretField label="Secret key" value={form[key].secretKey} onChange={set(key, 'secretKey')}
                                            has={side.hasSecretKey} hint={side.secretKeyHint} source={side.secretKeySource} placeholder={`sk_${key}_…`} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SecretField label="Webhook signing secret" value={form[key].webhookSecret} onChange={set(key, 'webhookSecret')}
                                            has={side.hasWebhookSecret} hint={side.webhookSecretHint} source={side.webhookSecretSource} placeholder="whsec_…" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" startIcon={testing === key ? <CircularProgress size={16} /> : <Science />} disabled={!!testing}
                                            onClick={() => test(key)}>
                                            Test {key === 'live' ? 'live' : 'sandbox'} key
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Webhook</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            In Stripe → Developers → Webhooks, add this endpoint once in live mode and once in test mode, then paste each signing secret above.
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Box component="code" sx={{ px: 1.5, py: 1, bgcolor: '#f4f7fa', borderRadius: 2, fontSize: 14, wordBreak: 'break-all' }}>{config.webhookUrl}</Box>
                            <Tooltip title="Copy">
                                <IconButton size="small" onClick={() => { navigator.clipboard?.writeText(config.webhookUrl); toast.success('Webhook address copied'); }}><ContentCopy fontSize="small" /></IconButton>
                            </Tooltip>
                        </Box>
                        <Alert severity="info" sx={{ mt: 2 }}>Blank fields keep the saved value. A key that is not set here falls back to the one in the server environment.</Alert>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button variant="contained" startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Save />} disabled={saving}
                                onClick={() => save(mode)} sx={{ bgcolor: '#37a6ff', fontWeight: 'bold' }}>
                                Save keys
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={confirmLive} onClose={() => setConfirmLive(false)}>
                <DialogTitle>Switch to LIVE payments?</DialogTitle>
                <DialogContent>
                    <Typography>From now on customers are charged real money. Make sure the live keys are tested first.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLive(false)}>Stay in sandbox</Button>
                    <Button color="error" variant="contained" onClick={() => { setConfirmLive(false); setMode('live'); save('live'); }}>Switch to live</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentConfiguration;
