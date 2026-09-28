import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  InputAdornment,
  Popover,
  Tabs,
  Tab,
  Slider
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  CloudUpload,
  Article,
  Star,
  CheckCircle,
  ColorLens,
  Person,
  Label
} from '@mui/icons-material';
import fileInstance from '../constant/filesInstance';
import instance from '../constant/instance';
import BlogRichTextEditor from './BlogRichTextEditor';
import { toast } from 'react-toastify';
import { ChromePicker } from 'react-color';
import CommentModeration from './Comments';
import { getBlogImageSrc, handleBlogImageError } from '../utils/blogImage';

const LIVE_BLOG_BASE_URL = 'https://easyjackets.com/new-blog';

const formatDateTime = (value) => {
  if (!value) return 'Not set';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const BlogManager = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const initialFormData = {

    title: '',
    content: '',
    author: 'Easy Jackets',
    category: 'Style Guide',
    categoryColor: '#37a6ff',
    slug: '',
    excerpt: '',
    fitImage: false,
    fitImageScale: 100,
    featured: false,
    isActive: true,
    readTime: 5
  };

  const CATEGORY_PRESETS = [
    'Women Hoodies', 'Design Your Jacket', 'Letterman Jacket', 'Varsity Jacket', 'Custom Jacket', 'Style Guide'
  ];

  const DEFAULT_COLORS = [
    '#37a6ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
  ];

  const [COLOR_PRESETS, setColors] = useState(DEFAULT_COLORS);
  const [anchorEl, setAnchorEl] = useState(null);

  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stats = {
    total: blogs.length,
    active: blogs.filter(b => b.isActive).length,
    featured: blogs.filter(b => b.featured).length
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get('/features/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs', error);
      toast.error('Error loading blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    form.append('author', formData.author);
    form.append('category', formData.category);
    form.append('categoryColor', formData.categoryColor);
    form.append('slug', formData.slug);
    form.append('excerpt', formData.excerpt);
    form.append('fitImage', formData.fitImage);
    form.append('fitImageScale', formData.fitImageScale || 100);
    form.append('featured', formData.featured);
    form.append('isActive', formData.isActive);
    form.append('readTime', formData.readTime);
    if (imageFile) form.append('image', imageFile);

    try {
      if (editMode) {
        await fileInstance.put(`/features/blogs/${selectedBlogId}`, form);
        toast.success('Blog updated successfully');
      } else {
        await fileInstance.post('/features/blogs', form);
        toast.success('Blog created successfully');
      }
      setFormData(initialFormData);
      setImageFile(null);
      setEditMode(false);
      setOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error submitting the form', error);
      toast.error('Error saving blog');
    } finally {
      setIsLoading(false);
    }
  };

  // The list the table is drawn from no longer carries the article body — a
  // body can run to megabytes, and shipping every one of them to draw a table
  // is what made this page time out. The full post is fetched here, for the
  // one being edited only, before the editor opens.
  const handleEdit = async (blog) => {
    let full;
    try {
      const response = await instance.get(`/features/blogs/${blog._id}`);
      full = response.data;
    } catch (error) {
      console.error('Error loading blog for editing:', error);
      toast.error('Could not load the article. Try again.');
      return;
    }

    setFormData({
      ...full,
      fitImage: Boolean(full.fitImage),
      fitImageScale: full.fitImageScale || 100
    });
    setIsCustomCategory(!CATEGORY_PRESETS.includes(full.category));
    setEditMode(true);
    setSelectedBlogId(full._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await instance.delete(`/features/blogs/${id}`);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting the blog', error);
      toast.error('Error deleting blog');
    }
  };

  const handlePreview = (blog) => {
    if (!blog?.slug) {
      toast.error('This blog does not have a slug yet');
      return;
    }

    window.open(`${LIVE_BLOG_BASE_URL}/${encodeURIComponent(blog.slug)}`, '_blank', 'noopener,noreferrer');
  };

  const handleColorPickerClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setAnchorEl(null);
  };

  const handleAddColor = (newColor) => {
    if (newColor && !COLOR_PRESETS.includes(newColor)) {
      setColors([...COLOR_PRESETS, newColor]);
      toast.success('Color added to swatches');
    }
  };

  const handleDeleteColor = (e, colorToDelete) => {
    e.stopPropagation();
    if (DEFAULT_COLORS.includes(colorToDelete)) {
      toast.error('Default colors cannot be deleted');
      return;
    }
    setColors(COLOR_PRESETS.filter(color => color !== colorToDelete));
    if (formData.categoryColor === colorToDelete) {
      setFormData({ ...formData, categoryColor: '#37a6ff' });
    }
    toast.success('Color removed');
  };



  const handleClose = () => {
    setOpen(false);
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
    '& .MuiOutlinedInput-input': {
      color: '#333',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
      },
      '&[type=number]': {
        '-moz-appearance': 'textfield',
      },
    },
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      bgcolor: '#f4f7fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{
            '& .MuiTabs-indicator': { bgcolor: '#37a6ff' },
            '& .Mui-selected': { color: '#37a6ff !important' },
          }}>
            <Tab label="Articles" sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }} />
            <Tab label="Comments" sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }} />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <>
            {/* Stats Overview */}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Total Articles', value: stats.total, icon: <Article />, color: '#37a6ff' },
                { label: 'Active Posts', value: stats.active, icon: <CheckCircle />, color: '#10b981' },
                { label: 'Featured', value: stats.featured, icon: <Star />, color: '#f59e0b' }
              ].map((stat, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderBottom: `4px solid ${stat.color}`
                  }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Box sx={{
                        p: 1.5,
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        borderRadius: 2,
                        mr: 2,
                        display: 'flex'
                      }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">{stat.value}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">{stat.label}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Header Banner */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                borderRadius: 6,
                p: { xs: 3, md: 5 },
                mb: 6,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(30, 136, 229, 0.25)',
              }}
            >
              {/* Glassmorphism accent */}
              <Box sx={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(60px)',
              }} />

              <Grid container alignItems="center" justifyContent="space-between" spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        width: 56,
                        height: 56,
                        mr: 2.5,
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      <Article sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        fontFamily: 'Urbanist, sans-serif'
                      }}>
                        Content Studio
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Create and manage your high-quality blog articles
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditMode(false);
                      setFormData(initialFormData);
                      setOpen(true);
                    }}
                    sx={{
                      bgcolor: 'white',
                      color: '#1e88e5',
                      px: 4,
                      py: 1.8,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Compose New Article
                  </Button>
                </Grid>
              </Grid>
            </Box>

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
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Cover</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Date & Time</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Author</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow
                      key={blog._id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#fcfdfe !important' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Avatar
                          variant="rounded"
                          sx={{ width: 60, height: 60, bgcolor: '#f8f9fa', border: '1px solid #eee' }}
                        >
                          {blog.image ? (
                            <img
                              src={getBlogImageSrc(blog.image)}
                              alt={blog.title}
                              data-blog-image-index="0"
                              onError={(event) => handleBlogImageError(event, blog.image)}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Article sx={{ color: '#ddd' }} />
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ color: '#333', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                        {blog.title}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatDateTime(blog.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Chip
                          label={blog.category}
                          size="small"
                          sx={{
                            bgcolor: blog.categoryColor || '#37a6ff',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ color: '#37a6ff', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>{blog.author}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {blog.featured && (
                            <Chip
                              label="Featured"
                              size="small"
                              sx={{ bgcolor: '#37a6ff', color: 'white', fontWeight: 'bold' }}
                            />
                          )}
                          <Chip
                            label={blog.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: blog.isActive ? '#10b981' : '#ef4444',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View on live website">
                            <IconButton
                              onClick={() => handlePreview(blog)}
                              sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Post">
                            <IconButton
                              onClick={() => handleEdit(blog)}
                              sx={{ color: '#37a6ff', '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.05)' } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permanently">
                            <IconButton
                              onClick={() => handleDelete(blog._id)}
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {blogs.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#999' }}>
                        <Article sx={{ fontSize: 64, mb: 2, opacity: 0.1 }} />
                        <Typography variant="h6">No Blog Posts Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Blog Dialog */}
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="lg"
              fullWidth
              PaperProps={{
                sx: { bgcolor: '#ffffff', borderRadius: 3 }
              }}
            >
              <DialogTitle sx={{
                background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {editMode ? 'Edit Blog Article' : 'Write New Blog Article'}
              </DialogTitle>
              <DialogContent sx={{ mt: 2, pt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ pt: 1 }}>
                      <TextField
                        name="title"
                        label="Article Title"
                        fullWidth
                        value={formData.title}
                        onChange={handleInputChange}
                        sx={{ ...textFieldStyle, mb: 3 }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="slug"
                          label="Slug (URL Path)"
                          fullWidth
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="autogenerated-from-title"
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={textFieldStyle}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            name="category"
                            value={isCustomCategory ? 'custom' : formData.category}
                            label="Category"
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setIsCustomCategory(true);
                                setFormData({ ...formData, category: '' });
                              } else {
                                setIsCustomCategory(false);
                                setFormData({ ...formData, category: e.target.value });
                              }
                            }}
                          >
                            {CATEGORY_PRESETS.map(cat => (
                              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                            <MenuItem value="custom" sx={{ color: '#37a6ff', fontWeight: 'bold' }}>+ Add New Category</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {isCustomCategory && (
                      <TextField
                        name="category"
                        label="Enter New Category Name"
                        fullWidth
                        value={formData.category}
                        onChange={handleInputChange}
                        sx={{ ...textFieldStyle, mb: 3 }}
                        autoFocus
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Label sx={{ color: '#37a6ff' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <ColorLens sx={{ color: '#1e88e5', mr: 1.5, fontSize: 24 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: -0.5 }}>
                          Brand Color Palette
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        {COLOR_PRESETS.map((color) => (
                          <Box
                            key={color}
                            onClick={() => setFormData({ ...formData, categoryColor: color })}
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: '12px',
                              bgcolor: color,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: formData.categoryColor === color ? '3px solid #1e88e5' : '2px solid transparent',
                              boxShadow: formData.categoryColor === color
                                ? `0 0 15px ${color}80`
                                : '0 4px 10px rgba(0,0,0,0.1)',
                              '&:hover': {
                                transform: 'scale(1.15) rotate(5deg)',
                                '& .delete-icon': { opacity: 1 }
                              }
                            }}
                          >
                            {formData.categoryColor === color && (
                              <CheckCircle sx={{ color: 'white', fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            )}

                            {!DEFAULT_COLORS.includes(color) && (
                              <IconButton
                                className="delete-icon"
                                size="small"
                                onClick={(e) => handleDeleteColor(e, color)}
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  bgcolor: '#ef4444',
                                  color: 'white',
                                  p: 0.4,
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                  '&:hover': { bgcolor: '#dc2626' }
                                }}
                              >
                                <Delete sx={{ fontSize: 12 }} />
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        {/* Lavish Color Picker Trigger */}
                        <Tooltip title="Create Custom Color">
                          <Box
                            onClick={handleColorPickerClick}
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              border: '2px dashed #94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s',
                              '&:hover': {
                                borderColor: '#1e88e5',
                                color: '#1e88e5',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                              }
                            }}
                          >
                            <Add sx={{ fontSize: 24 }} />
                          </Box>
                        </Tooltip>

                        <Popover
                          open={Boolean(anchorEl)}
                          anchorEl={anchorEl}
                          onClose={handleColorPickerClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                          PaperProps={{
                            sx: { borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', mt: 1, p: 1 }
                          }}
                        >
                          <Box sx={{ p: 1, minWidth: 220 }}>
                            <ChromePicker
                              color={formData.categoryColor}
                              onChange={(color) => setFormData({ ...formData, categoryColor: color.hex })}
                              width="100%"
                              styles={{
                                default: {
                                  picker: { boxShadow: 'none', border: 'none', background: 'transparent' }
                                }
                              }}
                            />
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              startIcon={<Add />}
                              onClick={() => handleAddColor(formData.categoryColor)}
                              sx={{
                                mt: 1,
                                borderRadius: 1.5,
                                bgcolor: '#1e293b',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                py: 0.8,
                                '&:hover': { bgcolor: '#334155' }
                              }}
                            >
                              Save to Swatches
                            </Button>
                          </Box>
                        </Popover>

                        {/* Status Display Area */}
                        <Box
                          sx={{
                            ml: 'auto',
                            px: 2.5,
                            py: 1,
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: formData.categoryColor,
                              boxShadow: `0 0 10px ${formData.categoryColor}80`
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: 'Urbanist, sans-serif',
                              fontWeight: 800,
                              color: '#475569',
                              fontSize: '0.85rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            HEX: {formData.categoryColor.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <TextField
                      name="excerpt"
                      label="Short Excerpt"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      sx={{ ...textFieldStyle, mb: 3 }}
                      placeholder="Brief summary for the blog card..."
                    />

                    <Typography variant="subtitle2" sx={{ color: '#555', mb: 1, fontWeight: 'bold' }}>Article Content</Typography>
                    <BlogRichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData((previousData) => ({ ...previousData, content }))}
                      placeholder="Start writing your article here..."
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ pt: 1 }}>
                      <TextField
                        name="author"
                        label="Author Name"
                        fullWidth
                        value={formData.author}
                        onChange={handleInputChange}
                        sx={{ ...textFieldStyle, mb: 3 }}
                      />
                    </Box>

                    <TextField
                      name="readTime"
                      label="Read Time (minutes)"
                      type="number"
                      fullWidth
                      value={formData.readTime}
                      onChange={handleInputChange}
                      sx={{ ...textFieldStyle, mb: 3 }}
                    />

                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.featured}
                            onChange={handleInputChange}
                            name="featured"
                            color="primary"
                          />
                        }
                        label="Featured Post"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            name="isActive"
                            color="success"
                          />
                        }
                        label="Active (Published)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(formData.fitImage)}
                            onChange={handleInputChange}
                            name="fitImage"
                            color="warning"
                          />
                        }
                        label="Fit image in blog cards"
                      />
                      <Typography variant="caption" sx={{ color: '#777', lineHeight: 1.5 }}>
                        Turn on for product images that should stay fully visible. Leave off to fill the card with the current cropped style.
                      </Typography>
                      {formData.fitImage && (
                        <Box sx={{ mt: 1.5, px: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#555', fontWeight: 700 }}>
                              Fitted image size
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#37a6ff', fontWeight: 800 }}>
                              {formData.fitImageScale || 100}%
                            </Typography>
                          </Box>
                          <Slider
                            value={formData.fitImageScale || 100}
                            min={70}
                            max={160}
                            step={1}
                            marks={[
                              { value: 70, label: '70%' },
                              { value: 100, label: '100%' },
                              { value: 130, label: '130%' },
                              { value: 160, label: '160%' }
                            ]}
                            onChange={(_, value) => setFormData({ ...formData, fitImageScale: value })}
                            sx={{
                              color: '#37a6ff',
                              '& .MuiSlider-markLabel': { fontSize: 11, color: '#777' }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#777', lineHeight: 1.5 }}>
                            Increase this if the fitted picture has too much empty background, while still keeping the image contained in the card.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="subtitle2" sx={{ color: '#555', mb: 1, fontWeight: 'bold' }}>Social Preview Image</Typography>
                    <Box
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(55, 166, 255, 0.08)',
                        border: '1px solid rgba(55, 166, 255, 0.18)'
                      }}
                    >
                      <Typography variant="caption" sx={{ display: 'block', color: '#1e5f8f', fontWeight: 700 }}>
                        Best blog card size: 1600 x 1500px or 1200 x 1125px (16:15 ratio).
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#557086', mt: 0.5 }}>
                        Keep the jacket/product centered with even white space so all blog cards look the same size.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<CloudUpload />}
                      sx={{
                        color: '#37a6ff',
                        borderColor: '#37a6ff',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        py: 1.5,
                        mb: 2,
                        borderRadius: 2,
                        borderStyle: imageFile || formData.image ? 'solid' : 'dashed',
                        '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' }
                      }}
                    >
                      {imageFile || formData.image ? 'Change Cover' : 'Upload Cover'}
                      <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>

                    {(imageFile || formData.image) && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : getBlogImageSrc(formData.image)}
                          alt="Preview"
                          data-blog-image-index="0"
                          onError={(event) => {
                            if (!imageFile) handleBlogImageError(event, formData.image);
                          }}
                          style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }}
                        />
                        {imageFile && (
                          <Chip
                            label={imageFile.name}
                            size="small"
                            onDelete={() => setImageFile(null)}
                            sx={{ width: '100%', mt: 1, bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="textSecondary">
                      For link previews, social platforms may crop the image to 1200 x 630px.
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                <Button onClick={handleClose} sx={{ color: '#888', textTransform: 'none' }}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={isLoading}
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
                  {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (editMode ? 'Save Changes' : 'Publish Post')}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <CommentModeration />
        )}
      </Box>
    </Box>
  );
};

export default BlogManager;
