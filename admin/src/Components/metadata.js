import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box, Typography, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, CircularProgress, FormControlLabel, MenuItem, Slider, Switch, Tabs, Tab
} from '@mui/material';
import {
  SettingsEthernet,
  Add,
  Edit,
  Delete,
  Search,
  CheckCircle,
  CloudUpload,
  Image as ImageIcon
} from '@mui/icons-material';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

import { uploadUrl } from '../constant/url';
import { applyFavicons } from '../utils/favicon';
const MetadataManager = () => {
  const [metadataList, setMetadataList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    h1: '',
    description: '',
    keywords: '',
    route: '',
    sitemapEnabled: true,
    sitemapOrder: 100,
    sitemapPriority: 0.5,
    sitemapChangefreq: 'monthly'
  });
  const [globalSettings, setGlobalSettings] = useState({
    favicon: '',
    faviconDark: '',
    navbarLogo: '',
    footerLogo: '',
    navbarLogoHeight: 75,
    footerLogoHeight: 66
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalRoute, setOriginalRoute] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // 219 routes is too many to scroll, so the table filters by where a row's SEO
  // is stored and by a free-text match on route/title/product name.
  const [sourceFilter, setSourceFilter] = useState('all');
  const [routeSearch, setRouteSearch] = useState('');
  // The row being edited, so the dialog can say where the save will land.
  const [editingRow, setEditingRow] = useState(null);

  const getRouteKey = (route) => encodeURIComponent((route || '').replace(/^\/+/, ''));
  const normalizeRoute = (route = '') => {
    const trimmed = String(route || '').trim();
    if (!trimmed) return '';
    const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
  };

  // Product pages are generated from the products collection rather than stored as
  // metadata rows, so `source` — not the presence of an _id — is what decides how a
  // row behaves. A product route that also has a metadata row comes back as
  // source 'metadata' with overridesProduct set, because that row is what the
  // storefront actually renders.
  const isProductRow = (row) => row?.source === 'product';

  const allRows = metadataList.filter((metadata) => normalizeRoute(metadata.route) !== '/global-settings');

  const sourceCounts = {
    all: allRows.length,
    pages: allRows.filter((row) => !isProductRow(row) && !row.overridesProduct).length,
    products: allRows.filter((row) => isProductRow(row) || row.overridesProduct).length,
  };

  const search = routeSearch.trim().toLowerCase();
  const visibleMetadataList = allRows
    .filter((row) => {
      if (sourceFilter === 'pages') return !isProductRow(row) && !row.overridesProduct;
      if (sourceFilter === 'products') return isProductRow(row) || row.overridesProduct;
      return true;
    })
    .filter((row) => {
      if (!search) return true;
      return `${row.route} ${row.title || ''} ${row.productName || ''}`.toLowerCase().includes(search);
    });

  const existingRoutes = new Set(allRows.map((metadata) => normalizeRoute(metadata.route)));

  const fetchMetadata = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get('/metadata');
      setMetadataList(response.data.metadata || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast.error('Error loading metadata');
    } finally {
      setIsLoading(false);
    }

  }, []);

  const fetchAvailableRoutes = useCallback(async () => {
    setIsRouteLoading(true);
    try {
      const response = await instance.get('/metadata/available-routes');
      setRouteOptions(response.data.routes || []);
    } catch (error) {
      console.error('Error fetching available metadata routes:', error);
      toast.error('Error loading available URL list');
    } finally {
      setIsRouteLoading(false);
    }
  }, []);

  const fetchGlobalSettings = useCallback(async () => {
    try {
      const response = await instance.get('/metadata/global-settings');
      if (response.data.metadata) {
        setGlobalSettings({
          favicon: response.data.metadata.favicon || '',
          faviconDark: response.data.metadata.faviconDark || '',
          navbarLogo: response.data.metadata.navbarLogo || '',
          footerLogo: response.data.metadata.footerLogo || '',
          navbarLogoHeight: response.data.metadata.navbarLogoHeight || 75,
          footerLogoHeight: response.data.metadata.footerLogoHeight || 66
        });
      }
    } catch (error) {
      // If not found, that's okay, we'll create it on save
      console.log('Global settings not found, will create on save');
    }
  }, []);

  useEffect(() => {
    fetchGlobalSettings();
    fetchMetadata();
    fetchAvailableRoutes();
  }, [fetchAvailableRoutes, fetchGlobalSettings, fetchMetadata]);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRouteSelect = (_, option) => {
    if (!option) {
      setFormData(prev => ({ ...prev, route: '' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      route: option.route || '',
      title: option.title || prev.title,
      h1: option.h1 || option.title || prev.h1,
      description: option.description || prev.description,
      keywords: option.keywords || prev.keywords,
      sitemapEnabled: option.sitemapEnabled ?? prev.sitemapEnabled,
      sitemapOrder: option.sitemapOrder ?? prev.sitemapOrder,
      sitemapPriority: option.sitemapPriority ?? prev.sitemapPriority,
      sitemapChangefreq: option.sitemapChangefreq || prev.sitemapChangefreq,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.route) {
      toast.error('Title and Route are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = isEditMode
        ? await instance.put(`/metadata/${getRouteKey(originalRoute || formData.route)}`, formData)
        : await instance.post('/metadata', formData);

      // The backend decides whether a route's SEO belongs on the product or in the
      // metadata collection, so report what it actually did rather than assume.
      toast.success(response?.data?.message || (isEditMode ? 'Metadata updated successfully' : 'Metadata created successfully'));

      setFormData({ title: '', h1: '', description: '', keywords: '', route: '', sitemapEnabled: true, sitemapOrder: 100, sitemapPriority: 0.5, sitemapChangefreq: 'monthly' });
      fetchMetadata();
      fetchAvailableRoutes();
      setIsEditMode(false);
      setEditingRow(null);
      setOriginalRoute('');
      setOpenModal(false);
    } catch (error) {
      console.error('Error submitting metadata:', error);
      toast.error(error?.response?.data?.message || 'Error saving metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (metadata) => {
    setFormData({
      title: metadata.title || '',
      h1: metadata.h1 || metadata.title || '',
      description: metadata.description || '',
      keywords: metadata.keywords || '',
      route: metadata.route || '',
      sitemapEnabled: metadata.sitemapEnabled ?? true,
      sitemapOrder: metadata.sitemapOrder ?? 100,
      sitemapPriority: metadata.sitemapPriority ?? 0.5,
      sitemapChangefreq: metadata.sitemapChangefreq || 'monthly'
    });
    setEditingRow(metadata);
    setOriginalRoute(metadata.route);
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleDelete = async (row) => {
    // Product pages have no metadata row to remove; the row exists because the
    // product does. Deleting the *override* on a product route is a real action
    // though, so only the generated rows are blocked.
    if (isProductRow(row)) {
      toast.info('Product pages cannot be deleted here. Remove or deactivate the product instead.');
      return;
    }

    const message = row.overridesProduct
      ? 'Remove this override? The page will go back to using the SEO set on the product.'
      : 'Are you sure you want to delete this metadata?';
    if (!window.confirm(message)) return;

    try {
      const response = await instance.delete(`/metadata/${getRouteKey(row.route)}`);
      toast.success(response?.data?.message || 'Metadata deleted successfully');
      fetchMetadata();
    } catch (error) {
      console.error('Error deleting metadata:', error);
      toast.error(error?.response?.data?.message || 'Error deleting metadata');
    }
  };

  const handleLogoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed. Uploads are converted to optimized WebP.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.info('Uploading image...');
      const response = await instance.post('/metadata/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrl = response.data.url;
      setGlobalSettings(prev => ({ ...prev, [type]: newUrl }));
      toast.success(`${type} uploaded! Click "Save Logos" to persist.`);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Upload failed');
    }
  };

  const handleRemoveLogo = (type) => {
    if (window.confirm(`Remove custom ${type}? Default logo will be used.`)) {
      setGlobalSettings(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleLogoSizeChange = (type, value) => {
    setGlobalSettings(prev => ({ ...prev, [type]: value }));
  };

  const saveGlobalSettings = async () => {
    setIsLoading(true);
    try {
      let savedMetadata;
      // Check if global settings exist first update, else create
      try {
        const response = await instance.put('/metadata/global-settings', {
          route: '/global-settings',
          title: 'Global Site Settings',
          description: 'Stores site-wide logos and settings',
          sitemapEnabled: false,
          sitemapOrder: 9999,
          sitemapPriority: 0,
          sitemapChangefreq: 'never',
          ...globalSettings
        });
        savedMetadata = response.data?.metadata;
      } catch (err) {
        // If 404, create
        const response = await instance.post('/metadata', {
          route: '/global-settings',
          title: 'Global Site Settings',
          description: 'Stores site-wide logos and settings',
          sitemapEnabled: false,
          sitemapOrder: 9999,
          sitemapPriority: 0,
          sitemapChangefreq: 'never',
          ...globalSettings
        });
        savedMetadata = response.data?.metadata;
      }
      applyFavicons(savedMetadata || globalSettings, savedMetadata?.updatedAt || savedMetadata?._id);
      toast.success('Site Logos updated successfully');
    } catch (error) {
      console.error('Error saving global settings:', error);
      toast.error('Error saving logos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setFormData({ title: '', h1: '', description: '', keywords: '', route: '', sitemapEnabled: true, sitemapOrder: 100, sitemapPriority: 0.5, sitemapChangefreq: 'monthly' });
    setIsEditMode(false);
    setEditingRow(null);
    setOriginalRoute('');
    setOpenModal(true);
  };

  // Sitemap placement for a product page is derived from its Search Visibility in
  // Index Control, not set per route, so those controls are hidden rather than
  // shown as inputs that silently do nothing.
  const editingProductRoute = String(formData.route || '').startsWith('/product/');

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#fff',
      color: '#333',
      '& fieldset': { borderColor: '#ddd' },
      '&:hover fieldset': { borderColor: '#37a6ff' },
      '&.Mui-focused fieldset': { borderColor: '#37a6ff' },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': { color: '#37a6ff' },
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

      {/* Header Card - Light Blue Theme */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <SettingsEthernet sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Metadata SEO
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Optimize search engine visibility for your website routes
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpen}
                sx={{
                  bgcolor: 'white',
                  color: '#37a6ff',
                  '&:hover': { bgcolor: '#f0f0f0' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Add New Route Meta
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              minHeight: 58,
              '& .MuiTabs-indicator': { bgcolor: '#37a6ff', height: 3 },
              '& .MuiTab-root': {
                minHeight: 58,
                textTransform: 'none',
                fontWeight: 700,
                color: '#333',
                mr: 1.5,
                px: 2,
              },
              '& .Mui-selected': { color: '#1e88e5 !important' },
            }}
          >
            <Tab
              icon={<ImageIcon fontSize="small" sx={{ color: activeTab === 0 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Site Identity & Logos
                  <Chip label="3 items" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
            <Tab
              icon={<SettingsEthernet fontSize="small" sx={{ color: activeTab === 1 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Route Metadata
                  <Chip label={`${sourceCounts.all} Total`} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Logos Section */}
      {activeTab === 0 && (
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="#333">
              Site Identity & Logos
            </Typography>
            <Button
              variant="contained"
              onClick={saveGlobalSettings}
              disabled={isLoading}
              sx={{ bgcolor: '#37a6ff', fontWeight: 'bold' }}
            >
              {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Logos'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Favicon: Favicon · light browser */}
            <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>Favicon · light browser</Typography>
              <Box sx={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {globalSettings.favicon ?
                  <img src={uploadUrl(globalSettings.favicon)} alt="Favicon · light browser" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> :
                  <ImageIcon sx={{ color: '#ddd', fontSize: 40 }} />
                }
              </Box>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button component="label" size="small" variant="outlined" startIcon={<CloudUpload />}>
                  Upload
                  <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'favicon')} />
                </Button>
                {globalSettings.favicon && (
                  <Button color="error" size="small" onClick={() => handleRemoveLogo('favicon')}>
                    <Delete fontSize="small" />
                  </Button>
                )}
              </div>
              <Typography variant="caption" display="block" color="text.secondary" mt={1}>Tab icon on light browsers (e.g. the black J). Admin and storefront.</Typography>
            </Box>

            {/* Favicon: Favicon · dark browser */}
            <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#333', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2} color="white">Favicon · dark browser</Typography>
              <Box sx={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {globalSettings.faviconDark ?
                  <img src={uploadUrl(globalSettings.faviconDark)} alt="Favicon · dark browser" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> :
                  <ImageIcon sx={{ color: '#555', fontSize: 40 }} />
                }
              </Box>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button component="label" size="small" variant="contained" sx={{ bgcolor: 'white', color: '#333', '&:hover': { bgcolor: '#eee' } }} startIcon={<CloudUpload />}>
                  Upload
                  <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'faviconDark')} />
                </Button>
                {globalSettings.faviconDark && (
                  <Button color="error" size="small" onClick={() => handleRemoveLogo('faviconDark')}>
                    <Delete fontSize="small" />
                  </Button>
                )}
              </div>
              <Typography variant="caption" display="block" color="#aaa" mt={1}>Tab icon on dark browsers (e.g. the white J). Empty = the light one.</Typography>
            </Box>

            {/* Navbar Logo */}
            <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>Navbar Logo</Typography>
              <Box sx={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {globalSettings.navbarLogo ?
                  <img src={uploadUrl(globalSettings.navbarLogo)} alt="Navbar" style={{ height: `${globalSettings.navbarLogoHeight}px`, maxHeight: '86px', maxWidth: '100%', objectFit: 'contain' }} /> :
                  <ImageIcon sx={{ color: '#ddd', fontSize: 40 }} />
                }
              </Box>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button component="label" size="small" variant="outlined" startIcon={<CloudUpload />}>
                  Upload
                  <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'navbarLogo')} />
                </Button>
                {globalSettings.navbarLogo && (
                  <Button color="error" size="small" onClick={() => handleRemoveLogo('navbarLogo')}>
                    <Delete fontSize="small" />
                  </Button>
                )}
              </div>
              <Box sx={{ mt: 2, px: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                  Navbar size: {globalSettings.navbarLogoHeight}px
                </Typography>
                <Slider
                  size="small"
                  min={40}
                  max={110}
                  value={globalSettings.navbarLogoHeight}
                  onChange={(_, value) => handleLogoSizeChange('navbarLogoHeight', value)}
                  sx={{ color: '#37a6ff' }}
                />
              </Box>
            </Box>

            {/* Footer Logo */}
            <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#333', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2} color="white">Footer Logo</Typography>
              <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {globalSettings.footerLogo ?
                  <img src={uploadUrl(globalSettings.footerLogo)} alt="Footer" style={{ height: `${globalSettings.footerLogoHeight}px`, maxHeight: '96px', maxWidth: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /> :
                  <ImageIcon sx={{ color: '#555', fontSize: 40 }} />
                }
              </Box>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button component="label" size="small" variant="contained" sx={{ bgcolor: 'white', color: '#333', '&:hover': { bgcolor: '#eee' } }} startIcon={<CloudUpload />}>
                  Upload
                  <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'footerLogo')} />
                </Button>
                {globalSettings.footerLogo && (
                  <Button color="error" size="small" onClick={() => handleRemoveLogo('footerLogo')}>
                    <Delete fontSize="small" />
                  </Button>
                )}
              </div>
              <Box sx={{ mt: 2, px: 1 }}>
                <Typography variant="caption" display="block" color="#aaa" mb={0.5}>
                  Footer size: {globalSettings.footerLogoHeight}px
                </Typography>
                <Slider
                  size="small"
                  min={40}
                  max={120}
                  value={globalSettings.footerLogoHeight}
                  onChange={(_, value) => handleLogoSizeChange('footerLogoHeight', value)}
                  sx={{ color: '#fff' }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      )}

      {activeTab === 1 && (
      <>
      <Card sx={{ mb: 2, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { key: 'all', label: 'All Pages', count: sourceCounts.all },
              { key: 'pages', label: 'Site Pages', count: sourceCounts.pages },
              { key: 'products', label: 'Product Pages', count: sourceCounts.products },
            ].map((option) => (
              <Chip
                key={option.key}
                label={`${option.label} (${option.count})`}
                onClick={() => setSourceFilter(option.key)}
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  bgcolor: sourceFilter === option.key ? '#1e88e5' : '#eef2f7',
                  color: sourceFilter === option.key ? '#fff' : '#64748b',
                  '&:hover': { bgcolor: sourceFilter === option.key ? '#1976d2' : '#e2e8f0' },
                }}
              />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Search route, title, or product name"
            value={routeSearch}
            onChange={(e) => setRouteSearch(e.target.value)}
            sx={{ ...textFieldStyle, flexGrow: 1, minWidth: 260 }}
            InputProps={{ startAdornment: <Search sx={{ color: '#94a3b8', mr: 1 }} fontSize="small" /> }}
          />
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            Showing {visibleMetadataList.length}
          </Typography>
        </CardContent>
      </Card>

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Route Path</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Page Title</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>H1</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Sitemap</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleMetadataList.map((metadata) => (
              <TableRow
                key={metadata.route}
                hover
                sx={{
                  '&:hover': { bgcolor: '#fcfdfe !important' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#37a6ff', fontWeight: 'bold' }}>
                  {metadata.route}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {(isProductRow(metadata) || metadata.overridesProduct) && (
                      <Chip
                        size="small"
                        label="Product Page"
                        sx={{ bgcolor: '#fff4e5', color: '#b26a00', fontWeight: 700, height: 20, fontSize: 11 }}
                      />
                    )}
                    {metadata.overridesProduct && (
                      <Chip
                        size="small"
                        label="Overrides product SEO"
                        title="A metadata row exists for this product route, so it replaces whatever the product editor shows."
                        sx={{ bgcolor: '#fdecea', color: '#c62828', fontWeight: 700, height: 20, fontSize: 11 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#333', fontWeight: 600 }}>
                  {metadata.title}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#333' }}>
                  <Typography variant="body2" sx={{ maxWidth: 240 }} noWrap>
                    {metadata.h1 || metadata.title}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#666' }}>
                  <Typography variant="body2" sx={{ maxWidth: 400 }} noWrap>
                    {metadata.description}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', color: '#666' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: metadata.sitemapEnabled === false ? '#999' : '#37a6ff' }}>
                    {metadata.sitemapEnabled === false ? 'Hidden' : `#${metadata.sitemapOrder ?? 100} | ${metadata.sitemapPriority ?? 0.5}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {metadata.sitemapChangefreq || 'monthly'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      onClick={() => handleEdit(metadata)}
                      sx={{ color: '#37a6ff', '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.05)' } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {!isProductRow(metadata) && (
                      <IconButton
                        onClick={() => handleDelete(metadata)}
                        title={metadata.overridesProduct ? 'Remove override and use the product\'s own SEO' : 'Delete metadata'}
                        sx={{ color: '#ff5252', '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.05)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {visibleMetadataList.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#999' }}>
                  <Search sx={{ fontSize: 64, mb: 2, opacity: 0.1 }} />
                  <Typography variant="h6">
                    {routeSearch ? 'No routes match your search' : 'No Metadata Entries Found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </>
      )}

      {/* Entry Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#ffffff', borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 2
        }}>
          {isEditMode ? 'Edit SEO Metadata' : 'Create New SEO Entry'}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {editingProductRoute && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff4e5', border: '1px solid #ffe0b2' }}>
                <Typography variant="body2" sx={{ color: '#b26a00', fontWeight: 700 }}>
                  {editingRow?.overridesProduct
                    ? 'This route has a metadata override'
                    : 'Saves onto the product'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8d5b00' }}>
                  {editingRow?.overridesProduct
                    ? 'Changes here replace whatever the product editor shows for this page. Delete the row to hand control back to the product.'
                    : 'This is a product page, so the title, description, and keywords are written to the product itself — the same fields the product editor shows.'}
                </Typography>
              </Box>
            )}
            {isEditMode ? (
              <TextField
                label="Route Path"
                name="route"
                value={formData.route}
                fullWidth
                disabled
                sx={textFieldStyle}
                helperText="Route paths stay fixed while editing metadata."
              />
            ) : (
              <Autocomplete
                options={routeOptions}
                loading={isRouteLoading}
                value={routeOptions.find((option) => normalizeRoute(option.route) === normalizeRoute(formData.route)) || null}
                onChange={handleRouteSelect}
                getOptionLabel={(option) => option?.route ? `${option.route} - ${option.title || option.route}` : ''}
                getOptionDisabled={(option) => existingRoutes.has(normalizeRoute(option.route))}
                isOptionEqualToValue={(option, value) => normalizeRoute(option.route) === normalizeRoute(value.route)}
                noOptionsText="No public SEO routes found"
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {option.route}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                        {option.title}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={
                        option.source === 'product'
                          ? 'Product Page'
                          : (existingRoutes.has(normalizeRoute(option.route)) ? 'Added' : (option.routeType || 'Route'))
                      }
                      sx={{
                        bgcolor: option.source === 'product'
                          ? '#fff4e5'
                          : (existingRoutes.has(normalizeRoute(option.route)) ? '#eef2f7' : '#e8f4ff'),
                        color: option.source === 'product'
                          ? '#b26a00'
                          : (existingRoutes.has(normalizeRoute(option.route)) ? '#64748b' : '#1e88e5'),
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Route URL"
                    sx={textFieldStyle}
                    helperText="Choose from public sitemap, filter, and product URLs. Product pages are already listed in the table — edit them there so the SEO saves onto the product."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isRouteLoading ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
            <TextField
              label="Browser Tab Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              sx={textFieldStyle}
            />
            <TextField
              label="Visible H1 Heading"
              name="h1"
              value={formData.h1}
              onChange={handleInputChange}
              fullWidth
              sx={textFieldStyle}
              helperText="The main page heading shown to visitors. Leave blank to use the title."
            />
            <TextField
              label="Meta Description (for Search Results)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              sx={textFieldStyle}
            />
            <TextField
              label="Keywords (SEO Tags)"
              placeholder="jackets, custom patches, varsity apparel..."
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              fullWidth
              sx={textFieldStyle}
            />
            {editingProductRoute && !editingRow?.overridesProduct ? (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Sitemap placement for a product page is fixed, and whether it appears at all is
                controlled by its Search Visibility in Index Control.
              </Typography>
            ) : (
            <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Sitemap Order"
                name="sitemapOrder"
                type="number"
                value={formData.sitemapOrder}
                onChange={handleInputChange}
                sx={textFieldStyle}
                helperText="Lower appears earlier in sitemap"
              />
              <TextField
                label="Priority"
                name="sitemapPriority"
                type="number"
                value={formData.sitemapPriority}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                sx={textFieldStyle}
              />
              <TextField
                select
                label="Change Frequency"
                name="sitemapChangefreq"
                value={formData.sitemapChangefreq}
                onChange={handleInputChange}
                sx={textFieldStyle}
              >
                {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.sitemapEnabled)}
                  onChange={handleInputChange}
                  name="sitemapEnabled"
                  color="primary"
                />
              }
              label="Include this route in sitemap"
            />
            </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#888', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={!isLoading && <CheckCircle />}
            sx={{
              bgcolor: '#37a6ff',
              color: 'white',
              px: 6,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (isEditMode ? 'Update SEO' : 'Save SEO')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MetadataManager;
