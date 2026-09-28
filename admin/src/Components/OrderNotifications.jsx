import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import instance from '../constant/instance';

// How many recent orders the panel keeps, and how often it looks for new ones.
// A minute is often enough to notice an order while it is still worth acting on,
// and light enough that a tab left open all day is not hammering the orders API.
const FETCH_LIMIT = 12;
const POLL_MS = 60 * 1000;
const SEEN_KEY = 'ej-admin-orders-seen-at';

// What counts as "new" is anything placed since this admin last opened the
// panel. Kept in localStorage so a refresh does not resurrect the red dot for
// orders that have already been looked at.
const readSeenAt = () => {
  try {
    const stored = Number(window.localStorage.getItem(SEEN_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch (error) {
    return 0;
  }
};

const writeSeenAt = (value) => {
  try {
    window.localStorage.setItem(SEEN_KEY, String(value));
  } catch (error) {
    /* private mode, blocked storage — the dot just stops persisting */
  }
};

const timeAgo = (value) => {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statusColor = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'shipped': return '#2196f3';
    case 'delivered': return '#4caf50';
    case 'cancel':
    case 'cancelled': return '#f44336';
    case 'processing': return '#ff9800';
    default: return '#37a6ff';
  }
};

const OrderNotifications = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seenAt, setSeenAt] = useState(readSeenAt);
  const seenAtRef = useRef(seenAt);

  useEffect(() => { seenAtRef.current = seenAt; }, [seenAt]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await instance.get('/order', { params: { page: 1, limit: FETCH_LIMIT } });
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      // Deliberately quiet. This runs on a timer in the background; a toast on
      // every failed poll would bury whatever the admin is actually doing.
      console.warn('Order notifications: could not refresh', error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(fetchOrders, POLL_MS);
    // A tab left in the background gets throttled, so the first thing an admin
    // sees on returning could be a minute stale. Refresh on the way back in.
    const onFocus = () => fetchOrders();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchOrders]);

  // On a first-ever visit there is no stored timestamp, which would mark every
  // order in the list as new. Treat that as "nothing new yet" and start the
  // clock now, so the dot only ever means orders that arrived while watching.
  useEffect(() => {
    if (!loading && !seenAtRef.current) {
      const now = Date.now();
      writeSeenAt(now);
      setSeenAt(now);
    }
  }, [loading]);

  const unread = useMemo(() => (
    orders.filter((order) => {
      const placed = new Date(order?.createdAt).getTime();
      return Number.isFinite(placed) && placed > seenAt;
    })
  ), [orders, seenAt]);

  const handleOpen = () => {
    setOpen(true);
    fetchOrders();
  };

  const handleClose = () => {
    setOpen(false);
    // Marking as seen on close rather than on open means the new ones stay
    // highlighted while the panel is in front of you.
    const now = Date.now();
    writeSeenAt(now);
    setSeenAt(now);
  };

  const openOrder = (order) => {
    handleClose();
    navigate(`/orders/${order._id}`);
  };

  const isUnread = (order) => {
    const placed = new Date(order?.createdAt).getTime();
    return Number.isFinite(placed) && placed > seenAt;
  };

  return (
    <>
      <Tooltip title={unread.length ? `${unread.length} new order${unread.length === 1 ? '' : 's'}` : 'Orders'} arrow>
        <IconButton onClick={handleOpen} sx={{ color: 'white' }} aria-label="order notifications">
          <Badge
            color="error"
            variant="dot"
            invisible={unread.length === 0}
            overlap="circular"
            sx={{ '& .MuiBadge-dot': { width: 10, height: 10, borderRadius: '50%', boxShadow: '0 0 0 2px #37a6ff' } }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, bgcolor: '#f4f7fa' } }}
      >
        <Box sx={{
          px: 2.5, py: 2, bgcolor: '#fff', borderBottom: '1px solid #eee',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <NotificationsIcon sx={{ color: '#37a6ff' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 'bold', color: '#333', lineHeight: 1.2 }}>Orders</Typography>
            <Typography variant="caption" sx={{ color: '#888' }}>
              {unread.length ? `${unread.length} new since you last looked` : 'Nothing new'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: '#666' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
          {loading && orders.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={26} sx={{ color: '#37a6ff' }} />
            </Box>
          )}

          {!loading && orders.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <ShoppingBagIcon sx={{ fontSize: 44, color: '#d7dde3' }} />
              <Typography sx={{ color: '#888', mt: 1.5 }}>No orders yet</Typography>
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                New orders will appear here as they come in.
              </Typography>
            </Box>
          )}

          {orders.map((order) => {
            const fresh = isUnread(order);
            return (
              <Box
                key={order._id}
                onClick={() => openOrder(order)}
                sx={{
                  bgcolor: fresh ? '#eaf5ff' : '#fff',
                  border: `1px solid ${fresh ? '#bfe1fb' : '#eee'}`,
                  borderRadius: 2,
                  p: 1.75,
                  mb: 1.25,
                  cursor: 'pointer',
                  transition: 'border-color .2s, box-shadow .2s',
                  '&:hover': { borderColor: '#37a6ff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {fresh && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336', flexShrink: 0 }} />
                  )}
                  <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.9rem' }}>
                    #{order.orderId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', ml: 'auto' }}>
                    {timeAgo(order.createdAt)}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#555', mt: 0.75 }}>
                  {order.shipping_details?.[0]?.name || 'Customer'}
                  {' · '}
                  {order.totalItems || 0} item{(order.totalItems || 0) === 1 ? '' : 's'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography sx={{ color: '#37a6ff', fontWeight: 'bold' }}>
                    ${order.totalAmount}
                  </Typography>
                  <Chip
                    label={order.status || 'pending'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      bgcolor: `${statusColor(order.status)}15`,
                      color: statusColor(order.status),
                      border: `1px solid ${statusColor(order.status)}40`,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#999', ml: 'auto' }}>
                    {order.paymentMethod || (order.isCOD ? 'COD' : 'Stripe')}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5, bgcolor: '#fff' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => { handleClose(); navigate('/orders'); }}
            sx={{
              bgcolor: '#37a6ff',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': { bgcolor: '#1e88e5' },
            }}
          >
            View all orders
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default OrderNotifications;
