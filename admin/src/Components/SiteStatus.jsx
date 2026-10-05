import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

// Settings → Site Status: the headline of the "under construction" screen that the storefront, the jacket
// builder and the API's own address show by themselves while one of the apps is being deployed (backend
// controllers/siteStatusController.js). Only the text is set here.
const MAX_MESSAGE = 300;
const DEFAULT_HEADLINE = 'Something new is being stitched';

const SiteStatus = () => {
    const [saved, setSaved] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');

    const fetchText = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await instance.get('/site-status/admin');
            if (res.data.success) {
                setSaved(res.data.message || '');
                setMessage(res.data.message || '');
            }
        } catch (err) {
            console.error('Error fetching the site status text:', err);
            setLoadError(err?.response?.data?.message || 'Could not load the text.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchText(); }, [fetchText]);

    const save = async () => {
        setSaving(true);
        try {
            const res = await instance.put('/site-status', { message });
            if (res.data.success) {
                setSaved(res.data.message || '');
                setMessage(res.data.message || '');
                toast.success('Text saved');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not save the text.');
        } finally {
            setSaving(false);
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
                <Alert severity="error" action={<Button onClick={fetchText}>Retry</Button>}>{loadError}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Site Status</Typography>

            <Card variant="outlined">
                <CardContent>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>&ldquo;Under construction&rdquo; screen</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        The storefront, the jacket builder and the API show this screen by themselves while the site is
                        being deployed, and go back to normal when the deployment is over.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Headline"
                        placeholder={DEFAULT_HEADLINE}
                        helperText={`${message.length}/${MAX_MESSAGE} · empty shows "${DEFAULT_HEADLINE}"`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            disabled={saving || message === saved}
                            onClick={save}
                        >
                            Save
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SiteStatus;
