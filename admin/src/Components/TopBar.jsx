import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import './TopBar.css';

const DEFAULT_TEXT = 'Flash Sale \u00b7 50% Off \u00b7 Free Expedited Shipping Across US & Canada';

const TopBar = () => {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');

    const fetchTopBar = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await instance.get('/features/top-bar');
            setText(response.data?.topBar?.text || DEFAULT_TEXT);
        } catch (error) {
            console.error('Error fetching top bar:', error);
            const message = error.response?.data?.message || error.message || 'Failed to load top bar.';
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopBar();
    }, [fetchTopBar]);

    const handleSave = async () => {
        const nextText = text.trim();
        if (!nextText) {
            toast.error('Top bar text is required');
            return;
        }

        setSaving(true);
        try {
            const response = await instance.put('/features/top-bar', { text: nextText });
            setText(response.data?.topBar?.text || nextText);
            toast.success('Top bar saved');
        } catch (error) {
            console.error('Error saving top bar:', error);
            toast.error(error.response?.data?.message || 'Failed to save top bar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <CampaignIcon sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
                            Top Bar
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Change only the announcement text shown in the top bar.
                    </Typography>
                </CardContent>
            </Card>

            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={<Button color="inherit" size="small" onClick={fetchTopBar}>Retry</Button>}
                >
                    {loadError}
                </Alert>
            )}

            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <TextField
                    fullWidth
                    label="Top bar text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    inputProps={{ maxLength: 160 }}
                    helperText={`${text.length}/160 characters`}
                />

                <Typography variant="subtitle2" sx={{ mt: 4, mb: 1.5, fontWeight: 700 }}>
                    Preview <Box component="span" sx={{ fontWeight: 400, color: '#888' }}>· exactly as it shows on the site, above the menu (updates as you type)</Box>
                </Typography>
                {text.trim() ? (
                    // the storefront's bar (frontend/src/pages/Home.jsx): ink strip, cream capitals in the
                    // site's display font, full width, no ornaments
                    <Box
                        className="ej-site-topbar"
                        sx={{
                            bgcolor: '#14110f',
                            color: '#f4efe6',
                            fontFamily: "'Big Shoulders Display', 'Arial Narrow', Arial, sans-serif",
                            fontWeight: 700,
                            fontSize: 16,
                            lineHeight: 'normal',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            px: '20px',
                            py: '10px',
                        }}
                    >
                        {text.trim()}
                    </Box>
                ) : (
                    <Box sx={{ border: '1px dashed #cfd8e3', borderRadius: 1, color: '#888', px: 2, py: 1.5, textAlign: 'center', fontSize: 13 }}>
                        No text: the bar is hidden on the site.
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default TopBar;
