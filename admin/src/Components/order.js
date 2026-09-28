import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Select, MenuItem, TextField, Typography, Box,
  Chip, InputAdornment, Grid, Card, CardContent, IconButton, FormControl,
  Skeleton, LinearProgress, Avatar, Dialog, DialogContent, Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from "react-toastify";
import instance from '../constant/instance';

// Designs saved before the move to Coolify storage still point at the old
// s3.amazonaws.com bucket, which is gone and answers 403. Treat those as no
// image at all so the row shows the placeholder instead of a broken tile.
const DEAD_IMAGE_HOST = /amazonaws\.com/i;

const livingUrl = (url) => (
  typeof url === 'string' && url.trim() && !DEAD_IMAGE_HOST.test(url) ? url.trim() : ''
);

// A catalogue jacket carries a design of its own, so preferring the design
// render showed the studio image where the shop's own product photograph
// belongs. Product first; the design render is only right for a jacket the
// customer built, which is the case where there is no product to show.
const cartItemImage = (item) => {
  const product = item?.id;
  if (product && typeof product === 'object') {
    const shot = livingUrl(product.frontImage) || livingUrl(product.otherImages?.[0]);
    if (shot) return shot;
  }
  const design = item?.designId;
  if (design && typeof design === 'object' && livingUrl(design.custom_image)) {
    return livingUrl(design.custom_image);
  }
  return livingUrl(item?.frontImage);
};

const orderThumbnails = (order) => (
  (Array.isArray(order?.cartData) ? order.cartData : [])
    .map((item) => ({ src: cartItemImage(item), label: item?.name || 'Item' }))
    .filter((thumb) => thumb.src)
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusEnum, setStatusEnum] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // Starts true so the very first paint is the skeleton, never "No Orders Found".
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const getAllOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await instance.get('/order', {
        params: { name, date, address, phone, status, page: currentPage, limit: pageSize }
      });
      setOrders(data.data);
      setStatusEnum(data.statusEnum);
      setTotalOrders(Number(data.totalOrder) || 0);
      setTotalPages(Math.ceil((Number(data.totalOrder) || 0) / pageSize) || 1);
    } catch (err) {
      console.log(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [name, date, address, phone, status, currentPage, pageSize]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await instance.put(`/order/${id}?page=${currentPage}&limit=5`, { status: newStatus });
      getAllOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await instance.delete(`/order/${id}`);
        toast.success("Order deleted successfully");
        getAllOrders();
      } catch (err) {
        console.log(err);
        toast.error('Failed to delete order');
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getAllOrders();
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'processing': return '#ff9800';
      default: return '#37a6ff';
    }
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
    '& .MuiSelect-icon': { color: '#666' },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#999' }
  };

  // Placeholder rows only when there is nothing to keep on screen (first load,
  // or a filter/page change made from an already-empty list). When rows are
  // already rendered we keep them and show the progress bar instead, so the
  // table never collapses under the admin mid-refresh.
  const showSkeleton = loading && orders.length === 0;
  const skeletonRowCount = Math.min(pageSize, 6);
  const skeletonCellSx = { borderBottom: '1px solid #f0f0f0' };

  const renderThumbnails = (order) => {
    const thumbs = orderThumbnails(order);

    if (!thumbs.length) {
      return (
        <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: '#f1f3f5', border: '1px solid #eee' }}>
          <ShoppingBagIcon sx={{ fontSize: 18, color: '#c4c9cf' }} />
        </Avatar>
      );
    }

    const shown = thumbs.slice(0, 3);
    const extra = thumbs.length - shown.length;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {shown.map((thumb, thumbIndex) => (
          <Tooltip key={`${thumb.src}-${thumbIndex}`} title={thumb.label} arrow>
            <Box
              onClick={() => setPreview(thumb)}
              sx={{
                position: 'relative',
                width: 44,
                height: 44,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'zoom-in',
                border: '1px solid #eee',
                bgcolor: '#fff',
                '&:hover .order-thumb-zoom': { opacity: 1 }
              }}
            >
              <Box
                component="img"
                src={thumb.src}
                alt={thumb.label}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
              <Box
                className="order-thumb-zoom"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none'
                }}
              >
                <ZoomInIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
          </Tooltip>
        ))}
        {extra > 0 && (
          <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, ml: 0.5 }}>
            +{extra}
          </Typography>
        )}
      </Box>
    );
  };

  const renderSkeletonRows = () => (
    Array.from({ length: skeletonRowCount }).map((_, index) => (
      <TableRow key={`orders-skeleton-${index}`}>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={18} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={78} /></TableCell>
        <TableCell sx={skeletonCellSx}>
          <Skeleton variant="rounded" animation="wave" width={44} height={44} sx={{ borderRadius: '8px' }} />
        </TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={130} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={104} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={24} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={72} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={64} /></TableCell>
        <TableCell sx={skeletonCellSx}><Skeleton animation="wave" width={54} /></TableCell>
        <TableCell sx={skeletonCellSx}>
          <Skeleton variant="rounded" animation="wave" width={140} height={32} sx={{ borderRadius: 2 }} />
        </TableCell>
        <TableCell align="center" sx={skeletonCellSx}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Skeleton variant="rounded" animation="wave" width={92} height={31} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="circular" animation="wave" width={30} height={30} />
          </Box>
        </TableCell>
      </TableRow>
    ))
  );

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <ShoppingBagIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Order Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Review, search, and manage customer orders in one place
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Card - Light Theme */}
      <Card sx={{ mb: 4, bgcolor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
            <FilterListIcon sx={{ color: '#37a6ff' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>Filter Orders</Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                placeholder="Name"
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                placeholder="Address"
                fullWidth
                size="small"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                placeholder="Phone"
                fullWidth
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Select
                fullWidth
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                sx={{
                  ...textFieldStyle['& .MuiOutlinedInput-root'],
                  '& .MuiSelect-select': { color: status ? '#333' : '#999' }
                }}
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {statusEnum.map((stat) => (
                  <MenuItem key={stat} value={stat}>{stat}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{
                    bgcolor: '#37a6ff',
                    color: 'white',
                    '&:hover': { bgcolor: '#1e88e5' },
                    '&.Mui-disabled': { bgcolor: '#bfe1fb', color: '#ffffff' },
                    px: 6,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Orders</Typography>
        {showSkeleton ? (
          <>
            <Skeleton variant="rounded" animation="wave" width={86} height={24} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="rounded" animation="wave" width={70} height={24} sx={{ borderRadius: '6px' }} />
          </>
        ) : (
          <>
            <Chip
              label={`${orders.length} showing`}
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', borderRadius: '6px' }}
            />
            <Chip
              label={`${totalOrders} Total`}
              size="small"
              sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }}
            />
          </>
        )}
      </Box>

      {/* Table - Light Theme */}
      <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ height: 3 }}>
          {loading && (
            <LinearProgress
              sx={{
                height: 3,
                bgcolor: 'rgba(55, 166, 255, 0.12)',
                '& .MuiLinearProgress-bar': { bgcolor: '#37a6ff' }
              }}
            />
          )}
        </Box>
        <Table
          sx={{
            minWidth: 650,
            opacity: loading && !showSkeleton ? 0.55 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>S.No.</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Order ID</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Preview</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Customer</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Contact</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Items</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Payment Method</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Card</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Amount</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Status</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showSkeleton ? (
              renderSkeletonRows()
            ) : orders.length !== 0 ? (
              orders.map((order, index) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#fcfdfe !important' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ color: '#666', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell sx={{ color: '#333', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>#{order.orderId}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    {renderThumbnails(order)}
                  </TableCell>
                  <TableCell sx={{ color: '#333', borderBottom: '1px solid #f0f0f0' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.shipping_details?.[0]?.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#333', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>{order.shipping_details?.[0]?.phone}</TableCell>
                  <TableCell sx={{ color: '#555', borderBottom: '1px solid #f0f0f0' }}>{order.totalItems}</TableCell>

                  {/* Payment Method */}
                  <TableCell sx={{ color: '#333', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.paymentMethod || (order.isCOD ? 'COD' : 'Stripe')}</Typography>
                  </TableCell>

                  {/* Card Details */}
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                      {order.cardLast4 && order.cardLast4 !== 'N/A'
                        ? `**** ${order.cardLast4.replace('**** ', '')}`
                        : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ color: '#37a6ff', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>${order.totalAmount}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Select
                      value={order.status}
                      size="small"
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      sx={{
                        ...textFieldStyle['& .MuiOutlinedInput-root'],
                        minWidth: 140,
                        '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem' }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { bgcolor: '#fff', color: '#333' }
                        }
                      }}
                    >
                      {statusEnum.map((stat) => (
                        <MenuItem key={stat} value={stat}>
                          <Chip
                            label={stat}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(stat) + '15',
                              color: getStatusColor(stat),
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              border: `1px solid ${getStatusColor(stat)}40`
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        component={Link}
                        to={`/orders/${order._id}`}
                        startIcon={<VisibilityIcon />}
                        size="small"
                        sx={{
                          color: '#37a6ff',
                          borderColor: '#37a6ff',
                          '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' },
                          textTransform: 'none',
                          borderRadius: '6px',
                          fontWeight: 'bold'
                        }}
                      >
                        Details
                      </Button>
                      <IconButton
                        onClick={() => handleDeleteOrder(order._id)}
                        size="small"
                        sx={{
                          color: '#f44336',
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.04)' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1" sx={{ color: '#999' }}>No Orders Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - Matching Theme */}
      {/* Fixed Pagination Bar - Matching Products Page */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: 'wrap',
        mt: 4,
        p: 2,
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            Rows per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              sx={{
                minWidth: 70,
                height: 36,
                fontWeight: 600,
                color: '#333',
                bgcolor: '#f8f9fa',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eee' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }
              }}
            >
              {[10, 30, 50, 100, 150, 200].map((num) => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={loading || currentPage === 1}
            sx={{
              borderColor: '#e0e0e0',
              color: '#666',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#f5f5f5', borderColor: '#ccc' },
              '&.Mui-disabled': { borderColor: '#eee', color: '#ccc' },
              textTransform: 'none'
            }}
          >
            Previous
          </Button>

          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
            Page {currentPage} of {totalPages}
          </Typography>

          <Button
            variant="contained"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={loading || currentPage === totalPages}
            sx={{
              bgcolor: '#37a6ff',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#1e88e5' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' },
              textTransform: 'none'
            }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Thumbnail zoom */}
      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
          <Typography sx={{ fontWeight: 'bold', color: '#333' }}>{preview?.label}</Typography>
          <IconButton size="small" onClick={() => setPreview(null)} sx={{ color: '#666' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
          {preview?.src && (
            <Box
              component="img"
              src={preview.src}
              alt={preview.label}
              sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default Orders;
