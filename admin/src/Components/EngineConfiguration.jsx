import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import {
    Assessment,
    Public,
    Save,
    Settings
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const EngineConfiguration = () => {
    const [config, setConfig] = useState({
        measurementId: '',
        propertyId: ''
    });
    const [configSaving, setConfigSaving] = useState(false);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await instance.get('/analytics/config');
            if (res.data.success) {
                setConfig({
                    measurementId: res.data.data.measurementId || '',
                    propertyId: res.data.data.propertyId || ''
                });
            }
        } catch (err) {
            console.error("Error fetching analytics config:", err);
            toast.error("Failed to load analytics configuration");
        }
    }, []);

    const handleSaveConfig = async () => {
        if (!config.measurementId || !config.propertyId) {
            toast.warning("Please fill Measurement ID and Property ID");
            return;
        }

        setConfigSaving(true);
        try {
            const res = await instance.post('/analytics/config', config);
            if (res.data.success) {
                toast.success("Analytics IDs saved successfully!");
            }
        } catch (err) {
            console.error("Error saving analytics config:", err);
            toast.error(err.response?.data?.message || "Failed to save configuration");
        } finally {
            setConfigSaving(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{
                borderRadius: 6,
                boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.8)',
                maxWidth: 1500,
                mx: 'auto'
            }}>
                <Box sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: 'linear-gradient(90deg, #37a6ff 0%, #1e88e5 100%)',
                    color: 'white'
                }}>
                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex' }}>
                        <Settings sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                            Analytics Configuration
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
                            Store the Google Analytics IDs used by the site tracking setup.
                        </Typography>
                    </Box>
                </Box>

                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Assessment sx={{ fontSize: 18, color: '#37a6ff' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                    Measurement ID (G-ID)
                                </Typography>
                            </Box>
                            <Paper
                                component="input"
                                placeholder="G-XXXXXX..."
                                value={config.measurementId}
                                onChange={(e) => setConfig({ ...config, measurementId: e.target.value })}
                                sx={{
                                    width: '100%',
                                    p: 2,
                                    bgcolor: '#f8fafc',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 3,
                                    outline: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    '&:focus': {
                                        borderColor: '#37a6ff',
                                        bgcolor: 'white',
                                        boxShadow: '0 0 0 4px rgba(55, 166, 255, 0.1)'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Public sx={{ fontSize: 18, color: '#10b981' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                    Property ID
                                </Typography>
                            </Box>
                            <Paper
                                component="input"
                                placeholder="123456789"
                                value={config.propertyId}
                                onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
                                sx={{
                                    width: '100%',
                                    p: 2,
                                    bgcolor: '#f8fafc',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 3,
                                    outline: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    '&:focus': {
                                        borderColor: '#10b981',
                                        bgcolor: 'white',
                                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                                Website tracking scripts are managed from <strong>Website Head Tags</strong>. Paste the Google tag there to connect the public website to this Analytics account.
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={configSaving ? <CircularProgress size={22} color="inherit" /> : <Save sx={{ fontSize: 24 }} />}
                                onClick={handleSaveConfig}
                                disabled={configSaving}
                                sx={{
                                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 25px rgba(55, 166, 255, 0.4)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    px: 10,
                                    py: 2,
                                    borderRadius: 4,
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    boxShadow: '0 6px 20px rgba(55, 166, 255, 0.25)',
                                    color: 'white'
                                }}
                            >
                                {configSaving ? 'Saving...' : 'Save Analytics IDs'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EngineConfiguration;
