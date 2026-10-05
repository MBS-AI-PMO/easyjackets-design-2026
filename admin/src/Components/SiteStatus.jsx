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
    InputAdornment,
    IconButton,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { ContentCopy, OpenInNew, Refresh, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import { FRONTEND_URL } from '../constant/url';

// Settings → Site Status: "under construction" for the public site (backend controllers/siteStatusController.js).
// On: the storefront, the jacket builder, the API's own address and this admin's sign-in screen show the
// holding page; purchases already in progress are not interrupted, and signed-in admins are not affected.
// The preview link lets the team use the real site meanwhile.
const MAX_MESSAGE = 300;

const SiteStatus = () => {
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');

    const apply = (data) => {
        setStatus(data);
        setMessage(data.message || '');
    };

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await instance.get('/site-status/admin');
            if (res.data.success) apply(res.data);
        } catch (err) {
            console.error('Error fetching site status:', err);
            setLoadError(err?.response?.data?.message || 'Could not load the site status.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const save = async (changes, done) => {
        setSaving(true);
        try {
            const res = await instance.put('/site-status', changes);
            if (res.data.success) {
                apply(res.data);
                toast.success(done);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not save the site status.');
        } finally {
            setSaving(false);
        }
    };

    const toggle = (event) => {
        const on = event.target.checked;
        const question = on
            ? 'Put the site under construction? Visitors will see the holding page instead of the site (purchases already in progress can finish).'
            : 'Open the site? Visitors will see the site again within half a minute.';
        if (!window.confirm(question)) return;
        save({ underConstruction: on }, on ? 'The site is under construction' : 'The site is open');
    };

    const newPreviewLink = async () => {
        if (!window.confirm('Make a new preview link? Every preview link given out before stops working.')) return;
        setSaving(true);
        try {
            const res = await instance.post('/site-status/preview-key');
            if (res.data.success) {
                apply(res.data);
                toast.success('New preview link made');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not make a new preview link.');
        } finally {
            setSaving(false);
        }
    };

    const previewLink = status?.previewKey ? `${FRONTEND_URL}/?preview=${encodeURIComponent(status.previewKey)}` : '';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(previewLink);
            toast.success('Preview link copied');
        } catch {
            toast.error('Could not copy; select the link and copy it by hand.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" action={<Button onClick={fetchStatus}>Retry</Button>}>{loadError}</Alert>
            </Box>
        );
    }

    const on = Boolean(status?.underConstruction);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>Site Status</Typography>
                <Chip
                    label={on ? 'Under construction' : 'Open'}
                    color={on ? 'warning' : 'success'}
                    sx={{ fontWeight: 700 }}
                />
            </Stack>

            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <FormControlLabel
                        control={<Switch checked={on} onChange={toggle} disabled={saving} />}
                        label={<Typography sx={{ fontWeight: 600 }}>Site under construction</Typography>}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        While this is on, the storefront, the jacket builder, the API's own address and this admin's
                        sign-in screen show the &ldquo;under construction&rdquo; page. Signed-in admins are not affected,
                        and purchases already in progress (checkout, payment, someone designing a jacket) can finish.
                        Switching it off opens the site for everyone within half a minute, without a reload.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <TextField
                        fullWidth
                        label="Headline on the holding page"
                        placeholder="Something new is being stitched"
                        helperText={`${message.length}/${MAX_MESSAGE} · empty shows "Something new is being stitched"`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            disabled={saving || message === (status?.message || '')}
                            onClick={() => save({ message }, 'Headline saved')}
                        >
                            Save headline
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Preview link</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Opens the real site while it is under construction, in that browser only (it also carries on
                        into the jacket builder). Share it only with the team. A small &ldquo;Preview&rdquo; label shows
                        while it is used. To stop previewing in a browser, open the site with <code>?preview=off</code>.
                    </Typography>
                    <TextField
                        fullWidth
                        value={previewLink}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title="Copy">
                                        <IconButton onClick={copy} edge="end"><ContentCopy /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Open">
                                        <IconButton href={previewLink} target="_blank" rel="noopener noreferrer" edge="end" sx={{ ml: 1 }}>
                                            <OpenInNew />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button startIcon={<Refresh />} disabled={saving} onClick={newPreviewLink}>
                            Make a new link
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SiteStatus;
