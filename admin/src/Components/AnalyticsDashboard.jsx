import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';
import {
    Assessment,
    Code,
    OpenInNew,
    Public,
    Settings
} from '@mui/icons-material';
import instance from '../constant/instance';

const AnalyticsDashboard = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await instance.get('/analytics/config');
            if (res.data.success) {
                setConfig(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching analytics config:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress thickness={5} size={60} sx={{ color: '#37a6ff' }} />
            </Box>
        );
    }

    const hasIds = Boolean(config?.measurementId && config?.propertyId);
    const analyticsUrl = config?.propertyId
        ? `https://analytics.google.com/analytics/web/#/p${config.propertyId}/reports/intelligenthome`
        : 'https://analytics.google.com/analytics/web/';

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(55, 166, 255, 0.2)',
                }}
            >
                <CardContent sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, display: 'flex' }}>
                            <Assessment sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Analytics Connection
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                This admin panel stores Analytics connection details only. Live Google Analytics reports are viewed inside Google Analytics.
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {!hasIds && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    Add the Measurement ID and Property ID from <strong>Analytics Configuration</strong>, then add the tracking script from <strong>Website Head Tags</strong>.
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Settings sx={{ color: '#37a6ff' }} />
                                <Typography variant="h6" fontWeight={800}>Analytics IDs</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Measurement ID</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#1e293b', wordBreak: 'break-word', mb: 2 }}>
                                {config?.measurementId || 'Not set'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Property ID</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#1e293b', wordBreak: 'break-word' }}>
                                {config?.propertyId || 'Not set'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Code sx={{ color: '#10b981' }} />
                                <Typography variant="h6" fontWeight={800}>Website Head Tags</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                Paste the Google tag snippet in Website Head Tags. The tag manager will split full snippets automatically for non-developer use.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Public sx={{ color: '#8b5cf6' }} />
                                <Typography variant="h6" fontWeight={800}>Reports</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                Analytics reports and traffic data are not pulled into this admin dashboard. Open Google Analytics to view live users, sessions, pages, and countries.
                            </Typography>
                            <Button
                                component="a"
                                href={analyticsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="contained"
                                endIcon={<OpenInNew />}
                                disabled={!config?.propertyId}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                                    boxShadow: '0 6px 16px rgba(55, 166, 255, 0.25)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                    },
                                }}
                            >
                                Open Google Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
