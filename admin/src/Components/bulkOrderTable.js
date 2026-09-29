import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Paper, Box, Typography, Card, CardContent, Chip, FormControl, Select, MenuItem
} from '@mui/material';
import DesignBulkModal from './designbulkmodal';
import { useNavigate } from 'react-router-dom';
import ReorderIcon from '@mui/icons-material/Reorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { toast } from "react-toastify";
import instance from '../constant/instance';

const OrderBulkTable = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const navigate = useNavigate();

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getOrders = React.useCallback(async () => {
    try {
      const { data } = await instance.get(`/order/bulk?page=${currentPage}&limit=${pageSize}`);
      setOrders(data.bulkorders);
      setTotalPages(data?.totalPages || 1);
      setTotalOrders(data?.totalOrders || 0);
    } catch (error) {
      console.error("Error fetching bulk orders:", error);
    }
  }, [currentPage, pageSize]);

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm('Move this bulk order to Deleted Orders?')) return;

    try {
      setDeletingOrderId(order._id);
      await instance.delete(`/order/bulk/${order._id}`);
      toast.success('Bulk order moved to Deleted Orders');

      if (orders.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        getOrders();
      }
    } catch (error) {
      console.error("Error deleting bulk order:", error);
      toast.error(error?.response?.data?.message || 'Failed to delete bulk order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  useEffect(() => {
    getOrders();
  }, [getOrders]);

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
              <ReorderIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Bulk Order Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage custom bulk jacket inquiries and designs
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Bulk Orders</Typography>
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
        <Table aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>S.No.</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Customer Name</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Email</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Product</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Lining</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Qty</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', textAlign: 'center', borderBottom: '2px solid #eee' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order?._id || index}
                hover
                sx={{
                  '&:hover': { bgcolor: '#fcfdfe !important' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell sx={{ color: '#888', borderBottom: '1px solid #f0f0f0' }}>{index + 1 + (currentPage - 1) * pageSize}</TableCell>
                <TableCell sx={{ color: '#333', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>{order?.name}</TableCell>
                <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>{order?.email}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Chip
                    label={order?.selectedProduct}
                    size="small"
                    sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>{order?.selectedLining}</TableCell>
                <TableCell sx={{ color: '#333', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>{order?.quantityRange || order?.quantity}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ArchitectureIcon />}
                      onClick={() => handleOpenModal(order)}
                      sx={{
                        bgcolor: '#37a6ff',
                        color: 'white',
                        '&:hover': { bgcolor: '#1e88e5' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        borderRadius: 1.5
                      }}
                    >
                      Design Points
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/bulkorder/${order._id}`)}
                      sx={{
                        color: '#37a6ff',
                        borderColor: '#37a6ff',
                        '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        borderRadius: 1.5
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      disabled={deletingOrderId === order._id}
                      onClick={() => handleDeleteOrder(order)}
                      sx={{
                        borderColor: '#ef5350',
                        color: '#d32f2f',
                        '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.05)' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        borderRadius: 1.5
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#999' }}>
                  No Bulk Orders Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {/* Pagination */}
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
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <DesignBulkModal
          open={isModalOpen}
          onClose={handleCloseModal}
          order={selectedOrder}
        />
      )}
    </Box>
  );
};

export default OrderBulkTable;
