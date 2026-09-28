import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, FontDownload } from '@mui/icons-material';
import instance from '../constant/instance';

const initialFormData = {
  name: '',
  family: '',
  sourceType: 'google',
  googleUrl: '',
  googleFamily: '',
  weight: '400',
  style: 'normal',
  isActive: true,
  fontFile: null,
};

const normalizeWeight = (value) => {
  const trimmed = `${value ?? ''}`.trim();
  return /^\d+$/.test(trimmed) ? trimmed : '400';
};

const sanitizeGoogleUrl = (value) => {
  const trimmed = `${value ?? ''}`.trim();
  return trimmed.replace(/^['"]+|['"]+$/g, '');
};

const getPrimaryFamily = (family) => {
  const raw = `${family ?? ''}`.trim();
  if (!raw) return '';
  const first = raw.split(',')[0]?.trim() || '';
  return first.replace(/^['"]|['"]$/g, '');
};

const getPreviewFamily = (family) => {
  const primary = getPrimaryFamily(family);
  return primary ? `"${primary}", serif` : 'serif';
};

const getGoogleHref = (font) => {
  const cleanedUrl = sanitizeGoogleUrl(font.googleUrl);
  if (cleanedUrl) return cleanedUrl;
  const family = getPrimaryFamily(font.googleFamily || font.family || '');
  if (!family) return '';

  const weight = normalizeWeight(font.weight);
  const weightSet = new Set(['400', '500', '600', '700', weight]);
  const weights = Array.from(weightSet).sort((a, b) => Number(a) - Number(b));
  const familyParam = family.replace(/\s+/g, '+');
  const style = (font.style || 'normal').toLowerCase();

  if (style === 'italic') {
    const italPairs = [...weights.map((value) => `0,${value}`), ...weights.map((value) => `1,${value}`)];
    return `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@${italPairs.join(';')}&display=swap`;
  }

  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weights.join(';')}&display=swap`;
};

const FontsManager = () => {
  const [fonts, setFonts] = useState([]);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFont, setEditFont] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  const previewFonts = useMemo(() => fonts, [fonts]);

  useEffect(() => {
    fetchFonts();
  }, []);

  useEffect(() => {
    previewFonts.forEach((font) => {
      if (!font) return;
      const fontId = font._id || font.family || font.name;
      if (!fontId) return;

      if (font.sourceType === 'google') {
        const href = getGoogleHref(font);
        if (!href) return;

        const selector = `link[data-admin-font="${fontId}"]`;
        const existingLink = document.querySelector(selector);
        if (existingLink) {
          const currentHref = existingLink.getAttribute('href');
          if (currentHref !== href) existingLink.setAttribute('href', href);
        } else {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.dataset.adminFont = fontId;
          document.head.appendChild(link);
        }
      }

      if (font.sourceType === 'file' && font.fileUrl) {
        const family = getPrimaryFamily(font.family);
        if (!family) return;

        const css = `@font-face {\n  font-family: "${family}";\n  src: url("${font.fileUrl}");\n  font-weight: ${normalizeWeight(font.weight)};\n  font-style: ${font.style || 'normal'};\n  font-display: swap;\n}`;
        const selector = `style[data-admin-font="${fontId}"]`;
        const existingStyle = document.querySelector(selector);

        if (existingStyle) {
          if (existingStyle.textContent !== css) existingStyle.textContent = css;
        } else {
          const style = document.createElement('style');
          style.dataset.adminFont = fontId;
          style.textContent = css;
          document.head.appendChild(style);
        }
      }
    });
  }, [previewFonts]);

  const fetchFonts = async () => {
    const { data } = await instance.get('/fonts/admin');
    setFonts(data.fonts || []);
  };

  const openCreateDialog = () => {
    setEditFont(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (font) => {
    setEditFont(font);
    setFormData({
      name: font.name || '',
      family: font.family || '',
      sourceType: font.sourceType || 'google',
      googleUrl: sanitizeGoogleUrl(font.googleUrl || ''),
      googleFamily: font.googleFamily || '',
      weight: font.weight || '400',
      style: font.style || 'normal',
      isActive: font.isActive ?? true,
      fontFile: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditFont(null);
    setFormData(initialFormData);
    setSaving(false);
  };

  const handleChange = (key, value) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !editFont && !current.family ? { family: value } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'fontFile') {
        if (value) payload.append('fontFile', value);
      } else {
        payload.append(key, value);
      }
    });

    if (editFont) {
      await instance.put(`/fonts/${editFont._id}`, payload);
    } else {
      await instance.post('/fonts', payload);
    }

    await fetchFonts();
    closeDialog();
  };

  const handleDelete = async (font) => {
    if (!window.confirm(`Delete ${font.name}? Existing saved designs may still reference this font name.`)) return;
    await instance.delete(`/fonts/${font._id}`);
    fetchFonts();
  };

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
    '& .MuiOutlinedInput-input': { color: '#333' },
  };

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
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <FontDownload sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Font Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage Type Your Own customizer fonts now, with Ready To Use alphabet fonts ready for the next phase
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ px: 2, borderBottom: '1px solid #edf2f7' }}>
          <Tab label="Type Your Own" />
          <Tab label="Ready To Use" />
        </Tabs>
      </Paper>

      {tab === 0 ? (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateDialog}
              sx={{
                bgcolor: '#37a6ff',
                fontWeight: 'bold',
                color: 'white',
                '&:hover': { bgcolor: '#1e88e5' },
                px: 4,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)',
              }}
            >
              Add Font
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Font</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Source</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Preview</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fonts.map((font) => (
                  <TableRow key={font._id} hover>
                    <TableCell>
                      <Typography sx={{ color: '#333', fontWeight: 700 }}>{font.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#777' }}>{font.family}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={font.sourceType}
                        size="small"
                        sx={{ textTransform: 'capitalize', bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#1e88e5', fontWeight: 700 }}
                      />
                      {font.builtIn && (
                        <Chip label="Built in" size="small" sx={{ ml: 1, bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: getPreviewFamily(font.family),
                          fontSize: 24,
                          color: '#222',
                          fontWeight: normalizeWeight(font.weight),
                          fontStyle: font.style || 'normal',
                        }}
                      >
                        Easy Jackets
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={font.isActive ? 'Active' : 'Hidden'}
                        size="small"
                        sx={{
                          bgcolor: font.isActive ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                          color: font.isActive ? '#059669' : '#64748b',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton onClick={() => openEditDialog(font)} sx={{ color: '#37a6ff' }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(font)} sx={{ color: '#ef4444' }}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>
              Ready To Use Alphabet Fonts
            </Typography>
            <Typography sx={{ color: '#64748b', maxWidth: 760 }}>
              This tab is reserved for the next phase, where each patch font will use an A-Z SVG alphabet set.
              The Type Your Own engine is separate and is now built for normal web fonts.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: '#1f2937' }}>
            {editFont ? 'Edit Font' : 'Add Font'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Display Name"
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="CSS Font Family"
                  value={formData.family}
                  onChange={(event) => handleChange('family', event.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={textFieldStyle}>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={formData.sourceType}
                    label="Source"
                    onChange={(event) => handleChange('sourceType', event.target.value)}
                  >
                    <MenuItem value="google">Google Font</MenuItem>
                    <MenuItem value="file">Upload Font File</MenuItem>
                    <MenuItem value="system">Built-in/System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Weight"
                  value={formData.weight}
                  onChange={(event) => handleChange('weight', event.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth sx={textFieldStyle}>
                  <InputLabel>Style</InputLabel>
                  <Select
                    value={formData.style}
                    label="Style"
                    onChange={(event) => handleChange('style', event.target.value)}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="italic">Italic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.sourceType === 'google' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Google Family"
                      value={formData.googleFamily}
                      onChange={(event) => handleChange('googleFamily', event.target.value)}
                      placeholder="Example: Playfair Display"
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Google CSS URL"
                      value={formData.googleUrl}
                      onChange={(event) => handleChange('googleUrl', event.target.value)}
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      sx={textFieldStyle}
                    />
                  </Grid>
                </>
              )}

              {formData.sourceType === 'file' && (
                <Grid item xs={12}>
                  <Button variant="outlined" component="label" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                    {formData.fontFile ? formData.fontFile.name : 'Choose .woff2, .woff, .ttf, .otf, or .eot file'}
                    <input
                      hidden
                      type="file"
                      accept=".woff2,.woff,.ttf,.otf,.eot"
                      onChange={(event) => handleChange('fontFile', event.target.files?.[0] || null)}
                    />
                  </Button>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(event) => handleChange('isActive', event.target.checked)}
                    />
                  }
                  label="Show this font in the customizer"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={closeDialog} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: '#37a6ff', '&:hover': { bgcolor: '#1e88e5' }, textTransform: 'none', fontWeight: 700 }}
            >
              {saving ? 'Saving...' : 'Save Font'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FontsManager;
