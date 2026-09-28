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
    IconButton,
    InputAdornment,
    Paper,
    Switch,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    Delete,
    LocalShipping,
    Public,
    Save,
    Calculate,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const ZONES = [
    { key: 'usaTiers', fallback: 'usaFallbackRate', title: 'Within USA', icon: <LocalShipping fontSize="small" />, warn: 'usa' },
    { key: 'worldwideTiers', fallback: 'worldwideFallbackRate', title: 'Worldwide', icon: <Public fontSize="small" />, warn: 'worldwide' },
];

const ShippingRates = () => {
    const [config, setConfig] = useState({
        usaTiers: [],
        worldwideTiers: [],
        usaFallbackRate: 0,
        worldwideFallbackRate: 0,
        freeShippingOver: 0,
        enabled: true,
    });
    const [warnings, setWarnings] = useState({ usa: [], worldwide: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewQty, setPreviewQty] = useState(1);
    const [preview, setPreview] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [activeZone, setActiveZone] = useState('usaTiers');

    const apply = (rates, warns) => {
        setConfig({
            usaTiers: rates.usaTiers || [],
            worldwideTiers: rates.worldwideTiers || [],
            usaFallbackRate: rates.usaFallbackRate ?? 0,
            worldwideFallbackRate: rates.worldwideFallbackRate ?? 0,
            freeShippingOver: rates.freeShippingOver ?? 0,
            enabled: rates.enabled !== false,
        });
        if (warns) setWarnings(warns);
    };

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await instance.get('/shipping-rates');
            if (res.data.success) apply(res.data.rates, res.data.warnings);
        } catch (err) {
            console.error('Error fetching shipping rates:', err);
            // Without this the screen just shows "0 ranges", which looks like real
            // configuration rather than a failed request.
            const status = err.response?.status;
            setLoadError(
                status === 404
                    ? 'The shipping rates endpoint was not found on the API this panel is pointed at. The backend needs deploying.'
                    : status === 401 || status === 403
                        ? 'Not authorised to read shipping rates — sign in again.'
                        : err.response?.data?.message || err.message || 'Failed to load shipping rates.'
            );
            toast.error('Failed to load shipping rates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const updateTier = (zoneKey, index, field, value) => {
        setConfig((p) => {
            const tiers = [...p[zoneKey]];
            tiers[index] = { ...tiers[index], [field]: value };
            return { ...p, [zoneKey]: tiers };
        });
    };

    const addTier = (zoneKey) => {
        setConfig((p) => {
            const tiers = [...p[zoneKey]];
            const last = tiers[tiers.length - 1];
            // Start the new bracket where the previous one ended so ranges chain by default
            const nextMin = last && last.maxQty ? Number(last.maxQty) + 1 : (last ? Number(last.minQty) + 1 : 1);
            tiers.push({ minQty: nextMin, maxQty: null, rate: 0, label: '' });
            return { ...p, [zoneKey]: tiers };
        });
    };

    const removeTier = (zoneKey, index) => {
        setConfig((p) => ({ ...p, [zoneKey]: p[zoneKey].filter((_, i) => i !== index) }));
    };

    // Mirrors the storefront's original hardcoded pricing, as a starting point.
    // Not named use* - that prefix makes ESLint treat it as a React Hook.
    const applyDefaultTiers = (zoneKey) => {
        setConfig((p) => ({
            ...p,
            [zoneKey]: [
                { minQty: 1, maxQty: 1, rate: 30, label: 'Single jacket' },
                { minQty: 2, maxQty: null, rate: 60, label: '2 or more' },
            ],
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await instance.put('/shipping-rates', config);
            if (res.data.success) {
                apply(res.data.rates, res.data.warnings);
                toast.success('Shipping rates saved');
            }
        } catch (err) {
            console.error('Error saving shipping rates:', err);
            toast.error(err.response?.data?.message || 'Failed to save shipping rates');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        try {
            const res = await instance.get(`/shipping-rates/preview?quantity=${previewQty}`);
            if (res.data.success) setPreview(res.data);
        } catch (err) {
            toast.error('Could not preview shipping');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderZone = (zone) => {
        const tiers = config[zone.key];
        const issues = warnings[zone.warn] || [];
        return (
            <Grid item xs={12} key={zone.key}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {zone.icon}
                        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>{zone.title}</Typography>
                        <Chip size="small" label={`${tiers.length} range${tiers.length === 1 ? '' : 's'}`} variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Set a rate per quantity range. Leave “To” blank for “and above”.
                    </Typography>

                    <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 600, '& td, & th': { px: 1 } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, width: 104, whiteSpace: 'nowrap' }}>From qty</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 104, whiteSpace: 'nowrap' }}>To qty</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 128, whiteSpace: 'nowrap' }}>Rate</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 132, whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Flat = one charge for the whole order. Per jacket = rate is multiplied by quantity.">
                                        <span>Charge</span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Label</TableCell>
                                <TableCell sx={{ width: 48 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tiers.map((tier, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <TextField size="small" type="number" value={tier.minQty ?? ''}
                                            onChange={(e) => updateTier(zone.key, i, 'minQty', e.target.value)}
                                            inputProps={{ min: 1 }} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <TextField size="small" type="number" value={tier.maxQty ?? ''}
                                            placeholder="∞"
                                            onChange={(e) => updateTier(zone.key, i, 'maxQty', e.target.value === '' ? null : e.target.value)}
                                            inputProps={{ min: 1 }} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <TextField size="small" type="number" value={tier.rate ?? ''}
                                            onChange={(e) => updateTier(zone.key, i, 'rate', e.target.value)}
                                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            inputProps={{ min: 0, step: '0.01' }} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <FormControlLabel
                                            sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 12, whiteSpace: 'nowrap' } }}
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={Boolean(tier.perItem)}
                                                    onChange={(e) => updateTier(zone.key, i, 'perItem', e.target.checked)}
                                                />
                                            }
                                            label={tier.perItem ? 'Per jacket' : 'Flat'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField size="small" value={tier.label ?? ''} placeholder="optional"
                                            onChange={(e) => updateTier(zone.key, i, 'label', e.target.value)} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Remove range">
                                            <IconButton size="small" onClick={() => removeTier(zone.key, i)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!tiers.length && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ py: 2.5, borderBottom: 0 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No ranges yet — nothing would be charged for this zone.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => addTier(zone.key)}>
                            Add range
                        </Button>
                        {!tiers.length && (
                            <Button size="small" onClick={() => applyDefaultTiers(zone.key)}>
                                Use $30 / $60 defaults
                            </Button>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <TextField
                            size="small" type="number" label="Fallback rate"
                            value={config[zone.fallback]}
                            onChange={(e) => setConfig((p) => ({ ...p, [zone.fallback]: e.target.value }))}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            sx={{ width: 150 }}
                        />
                        <Tooltip title="Charged when a quantity matches none of the ranges above">
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                no-match rate
                            </Typography>
                        </Tooltip>
                    </Box>

                    {issues.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {issues.map((w, i) => <div key={i}>{w}</div>)}
                        </Alert>
                    )}
                </Paper>
            </Grid>
        );
    };

    const selectedZone = ZONES.find((zone) => zone.key === activeZone) || ZONES[0];

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <LocalShipping sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>Shipping Rates</Typography>
                        <FormControlLabel
                            control={<Switch checked={config.enabled}
                                onChange={(e) => setConfig((p) => ({ ...p, enabled: e.target.checked }))} />}
                            label={config.enabled ? 'Charging shipping' : 'Shipping free / off'}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        USA and international orders are priced from separate quantity ranges. These
                        rates are used by the storefront at checkout.
                    </Typography>
                </CardContent>
            </Card>

            {loadError && (
                <Alert severity="error" sx={{ mb: 3 }} action={
                    <Button color="inherit" size="small" onClick={fetchConfig}>Retry</Button>
                }>
                    {loadError}
                </Alert>
            )}

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #eef2f6',
                    bgcolor: '#ffffff',
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Tabs
                        value={activeZone}
                        onChange={(_, value) => setActiveZone(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            minHeight: 64,
                            px: 2,
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: 3,
                                bgcolor: '#37a6ff',
                            },
                            '& .MuiTab-root': {
                                minHeight: 64,
                                px: 2,
                                py: 1.5,
                                mr: 1,
                                textTransform: 'none',
                                color: '#333',
                                fontWeight: 700,
                            },
                            '& .Mui-selected': {
                                color: '#168eed',
                            },
                        }}
                    >
                        {ZONES.map((zone) => {
                            const selected = activeZone === zone.key;
                            const tiers = config[zone.key] || [];

                            return (
                                <Tab
                                    key={zone.key}
                                    value={zone.key}
                                    icon={React.cloneElement(zone.icon, {
                                        sx: { color: selected ? '#168eed' : '#5f6368' },
                                    })}
                                    iconPosition="start"
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{zone.title}</span>
                                            <Chip
                                                label={`${tiers.length} range${tiers.length === 1 ? '' : 's'}`}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontWeight: 700,
                                                    bgcolor: selected ? 'rgba(55, 166, 255, 0.12)' : '#eef4fb',
                                                    color: selected ? '#168eed' : '#2f83d5',
                                                }}
                                            />
                                        </Box>
                                    }
                                />
                            );
                        })}
                    </Tabs>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {renderZone(selectedZone)}

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Grid container spacing={3} alignItems="flex-start">
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Free shipping</Typography>
                                <TextField
                                    fullWidth type="number" label="Free over order total"
                                    value={config.freeShippingOver}
                                    onChange={(e) => setConfig((p) => ({ ...p, freeShippingOver: e.target.value }))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    helperText="0 disables free shipping"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Check a quantity</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        type="number" label="Quantity" value={previewQty}
                                        onChange={(e) => setPreviewQty(e.target.value)}
                                        inputProps={{ min: 1 }} sx={{ flexGrow: 1 }}
                                    />
                                    <Button variant="outlined" startIcon={<Calculate />} onClick={handlePreview} sx={{ height: 56 }}>
                                        Check
                                    </Button>
                                </Box>
                                {preview && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        {preview.quantity} item{preview.quantity === 1 ? '' : 's'} —
                                        USA <strong>${preview.usa}</strong>, Worldwide <strong>${preview.worldwide}</strong>
                                    </Alert>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    Reflects saved rates, not unsaved edits.
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />
                                <Button
                                    fullWidth variant="contained" onClick={handleSave} disabled={saving}
                                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    sx={{ height: 56, mt: { md: 4 } }}
                                >
                                    {saving ? 'Saving…' : 'Save shipping rates'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ShippingRates;
