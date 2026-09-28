import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import {
    CheckCircle,
    Email,
    Error as ErrorIcon,
    Save,
    Send,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const EMPTY = {
    smtpHost: '',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    adminEmail: '',
    enabled: true,
};

const EmailConfiguration = () => {
    const [config, setConfig] = useState(EMPTY);
    const [hasPassword, setHasPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testRecipient, setTestRecipient] = useState('');
    const [lastTest, setLastTest] = useState({ at: null, status: null, message: '' });
    const [result, setResult] = useState(null);

    const applyConfig = (c) => {
        setConfig({
            smtpHost: c.smtpHost || '',
            smtpPort: c.smtpPort || 465,
            smtpSecure: c.smtpSecure !== false,
            smtpUser: c.smtpUser || '',
            smtpPass: '', // never populated from the server
            fromName: c.fromName || '',
            fromEmail: c.fromEmail || '',
            replyToEmail: c.replyToEmail || '',
            adminEmail: c.adminEmail || '',
            enabled: c.enabled !== false,
        });
        setHasPassword(Boolean(c.hasPassword));
        setLastTest({ at: c.lastTestedAt, status: c.lastTestStatus, message: c.lastTestMessage });
    };

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await instance.get('/email-config');
            if (res.data.success) applyConfig(res.data.config);
        } catch (err) {
            console.error('Error fetching email config:', err);
            toast.error(err.response?.data?.message || 'Failed to load email configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const set = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setConfig((p) => ({ ...p, [field]: value }));
    };

    const handleSave = async () => {
        if (!config.smtpHost || !config.smtpUser) {
            toast.warning('SMTP server and username are required');
            return;
        }
        if (!hasPassword && !config.smtpPass) {
            toast.warning('Enter the mailbox password');
            return;
        }

        setSaving(true);
        try {
            const res = await instance.put('/email-config', config);
            if (res.data.success) {
                applyConfig(res.data.config);
                toast.success('Email configuration saved - it now applies across the whole site');
            }
        } catch (err) {
            console.error('Error saving email config:', err);
            toast.error(err.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setResult(null);
        try {
            const res = await instance.post('/email-config/test', { ...config, testRecipient });
            setResult(res.data);
            if (res.data.success) toast.success(res.data.message);
            else toast.error(res.data.message);
            fetchConfig();
        } catch (err) {
            console.error('Error testing email config:', err);
            const message = err.response?.data?.message || 'Test request failed';
            setResult({ success: false, message });
            toast.error(message);
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const statusChip = lastTest.status === 'success'
        ? <Chip size="small" icon={<CheckCircle />} label="Last test passed" color="success" variant="outlined" />
        : lastTest.status === 'failed'
            ? <Chip size="small" icon={<ErrorIcon />} label="Last test failed" color="error" variant="outlined" />
            : <Chip size="small" label="Never tested" variant="outlined" />;

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <Email sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
                            Email Configuration
                        </Typography>
                        {statusChip}
                        <FormControlLabel
                            control={<Switch checked={config.enabled} onChange={set('enabled')} />}
                            label={config.enabled ? 'Sending on' : 'Sending off'}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        These settings are used by every email the site sends - order confirmations,
                        bulk quote requests, contact form, newsletter and saved designs.
                    </Typography>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Mailbox login</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            The account the site authenticates with. This must be a real mailbox -
                            forwarding aliases cannot log in.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={7}>
                                <TextField fullWidth label="SMTP server" value={config.smtpHost}
                                    onChange={set('smtpHost')} placeholder="smtp.hostinger.com" />
                            </Grid>
                            <Grid item xs={6} sm={5}>
                                <TextField fullWidth select label="Port" value={config.smtpPort}
                                    onChange={(e) => setConfig((p) => ({
                                        ...p,
                                        smtpPort: Number(e.target.value),
                                        smtpSecure: Number(e.target.value) === 465,
                                    }))}>
                                    <MenuItem value={465}>465 (SSL)</MenuItem>
                                    <MenuItem value={587}>587 (STARTTLS)</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Username" value={config.smtpUser}
                                    onChange={set('smtpUser')} placeholder="info@easyjackets.com" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    value={config.smtpPass}
                                    onChange={set('smtpPass')}
                                    placeholder={hasPassword ? '•••••••• (leave blank to keep current)' : 'Mailbox password'}
                                    helperText={hasPassword ? 'A password is saved. Leave blank to keep it.' : 'Required'}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button size="small" onClick={() => setShowPassword((s) => !s)} sx={{ minWidth: 0 }}>
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={config.smtpSecure} onChange={set('smtpSecure')} />}
                                    label="Use SSL/TLS"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Addresses</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            What customers see, and where your notifications land.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                                <TextField fullWidth label="Sender name" value={config.fromName}
                                    onChange={set('fromName')} placeholder="Easy Jackets" />
                            </Grid>
                            <Grid item xs={12} sm={7}>
                                <TextField fullWidth label="From address" value={config.fromEmail}
                                    onChange={set('fromEmail')} placeholder="orders@easyjackets.com"
                                    helperText="Can differ from the login if your host allows it" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Reply-To" value={config.replyToEmail}
                                    onChange={set('replyToEmail')} placeholder="orders@easyjackets.com"
                                    helperText="Where replies go. Customer enquiries override this per message." />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Notifications go to" value={config.adminEmail}
                                    onChange={set('adminEmail')} placeholder="orders@easyjackets.com"
                                    helperText="Orders, bulk quotes, contact form and newsletter alerts" />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Send a test</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Checks the login, then delivers a real message using the values on this
                            screen - you can test before saving.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <TextField
                                label="Send test to"
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                placeholder={config.adminEmail || config.smtpUser || 'you@example.com'}
                                helperText="Leave blank to use the notifications address"
                                sx={{ minWidth: 280, flexGrow: 1, maxWidth: 420 }}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleTest}
                                disabled={testing}
                                startIcon={testing ? <CircularProgress size={16} /> : <Send />}
                                sx={{ height: 56, px: 3 }}
                            >
                                {testing ? 'Sending…' : 'Send test email'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                sx={{ height: 56, px: 4, ml: { md: 'auto' } }}
                            >
                                {saving ? 'Saving…' : 'Save configuration'}
                            </Button>
                        </Box>

                        {result && (
                            <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{result.message}</Typography>
                                {result.hint && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{result.hint}</Typography>
                                )}
                                {result.note && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{result.note}</Typography>
                                )}
                            </Alert>
                        )}

                        {lastTest.at && !result && (
                            <>
                                <Divider sx={{ my: 2.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Last tested {new Date(lastTest.at).toLocaleString()} — {lastTest.message}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmailConfiguration;
