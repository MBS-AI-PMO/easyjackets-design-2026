import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import instance from '../constant/instance';

const statusConfig = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
};

const initialEditState = {
  name: '',
  email: '',
  rating: 5,
  title: '',
  comment: '',
  status: 'pending',
  adminNote: '',
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editForm, setEditForm] = useState(initialEditState);
  const [notice, setNotice] = useState({ open: false, severity: 'success', message: '' });

  const totalReviews = useMemo(
    () => Number(counts.pending || 0) + Number(counts.approved || 0) + Number(counts.rejected || 0),
    [counts]
  );

  const showNotice = (message, severity = 'success') => {
    setNotice({ open: true, message, severity });
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filters.status) params.set('status', filters.status);
      if (filters.search.trim()) params.set('search', filters.search.trim());

      const { data } = await instance.get(`/reviews/admin?${params.toString()}`);
      if (data?.success) {
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
      } else {
        showNotice(data?.message || 'Unable to load reviews', 'error');
      }
    } catch (error) {
      console.error('Error loading product reviews:', error);
      showNotice(error?.response?.data?.message || 'Unable to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateReview = async (reviewId, payload, successMessage = 'Review updated') => {
    setSavingId(reviewId);
    try {
      const { data } = await instance.put(`/reviews/admin/${reviewId}`, payload);
      if (data?.success) {
        showNotice(successMessage);
        await fetchReviews();
        return true;
      }
      showNotice(data?.message || 'Unable to update review', 'error');
      return false;
    } catch (error) {
      console.error('Error updating product review:', error);
      showNotice(error?.response?.data?.message || 'Unable to update review', 'error');
      return false;
    } finally {
      setSavingId('');
    }
  };

  const handleOpenEdit = (review) => {
    setEditReview(review);
    setEditForm({
      name: review.name || '',
      email: review.email || '',
      rating: Number(review.rating || 5),
      title: review.title || '',
      comment: review.comment || '',
      status: review.status || 'pending',
      adminNote: review.adminNote || '',
    });
    setEditOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editReview?._id) return;
    const saved = await updateReview(editReview._id, {
      ...editForm,
      rating: Number(editForm.rating || 1),
    }, 'Review saved');
    if (saved) {
      setEditOpen(false);
      setEditReview(null);
    }
  };

  const handleDelete = async (review) => {
    const confirmed = window.confirm(`Delete this review from ${review.name}?`);
    if (!confirmed) return;

    setSavingId(review._id);
    try {
      const { data } = await instance.delete(`/reviews/admin/${review._id}`);
      if (data?.success) {
        showNotice('Review deleted');
        await fetchReviews();
      } else {
        showNotice(data?.message || 'Unable to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting product review:', error);
      showNotice(error?.response?.data?.message || 'Unable to delete review', 'error');
    } finally {
      setSavingId('');
    }
  };

  const stats = [
    { label: 'Total Reviews', value: totalReviews, color: '#1976d2' },
    { label: 'Pending', value: counts.pending || 0, color: '#ed6c02' },
    { label: 'Approved', value: counts.approved || 0, color: '#2e7d32' },
    { label: 'Rejected', value: counts.rejected || 0, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937' }}>
            Product Reviews
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Moderate customer reviews before they appear on product pages.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReviews}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Refresh
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e5edf5' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 900, mt: 1 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2, border: '1px solid #e5edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            value={filters.search}
            onChange={(event) => setFilters(prev => ({ ...prev, search: event.target.value }))}
            placeholder="Search by product, reviewer, email, or review text"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={filters.status}
              displayEmpty
              onChange={(event) => setFilters(prev => ({ ...prev, status: event.target.value }))}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e5edf5', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Reviewer</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Review</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Submitted</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : reviews.length ? (
              reviews.map(review => {
                const product = review.product || {};
                const status = statusConfig[review.status] || statusConfig.pending;
                const busy = savingId === review._id;

                return (
                  <TableRow key={review._id} hover>
                    <TableCell sx={{ minWidth: 260 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={product.frontImage}
                          variant="rounded"
                          sx={{ width: 46, height: 46, bgcolor: '#e8f4ff' }}
                        >
                          {(review.productName || product.name || 'P').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1f2937' }}>
                            {review.productName || product.name || 'Deleted product'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {product.slug || review.productSlug || 'No slug'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{review.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{review.email || 'No email'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Rating value={Number(review.rating || 0)} readOnly size="small" />
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{review.rating}/5</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      {review.title && (
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1f2937', mb: 0.5 }}>
                          {review.title}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {review.comment}
                      </Typography>
                      {review.adminNote && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 1 }}>
                          Admin note: {review.adminNote}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{formatDate(review.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 190 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Approve">
                          <span>
                            <IconButton
                              color="success"
                              size="small"
                              disabled={busy || review.status === 'approved'}
                              onClick={() => updateReview(review._id, { status: 'approved' }, 'Review approved')}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <span>
                            <IconButton
                              color="warning"
                              size="small"
                              disabled={busy || review.status === 'rejected'}
                              onClick={() => updateReview(review._id, { status: 'rejected' }, 'Review rejected')}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <span>
                            <IconButton color="primary" size="small" disabled={busy} onClick={() => handleOpenEdit(review)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton color="error" size="small" disabled={busy} onClick={() => handleDelete(review)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 700 }}>No reviews found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Review</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Reviewer Name" name="name" value={editForm.name} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" name="email" value={editForm.email} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#64748b', mb: 0.5 }}>
                Rating
              </Typography>
              <Rating
                value={Number(editForm.rating || 0)}
                onChange={(_, value) => setEditForm(prev => ({ ...prev, rating: value || 1 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Select name="status" value={editForm.status} onChange={handleEditChange}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Review Title" name="title" value={editForm.title} onChange={handleEditChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Review Comment"
                name="comment"
                value={editForm.comment}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Admin Note"
                name="adminNote"
                value={editForm.adminNote}
                onChange={handleEditChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={savingId === editReview?._id}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
          >
            Save Review
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notice.open}
        autoHideDuration={3500}
        onClose={() => setNotice(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotice(prev => ({ ...prev, open: false }))}
          severity={notice.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductReviews;
