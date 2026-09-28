import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Typography, Box,
    Card, CardContent, IconButton, CircularProgress, Chip, FormControl, Select, MenuItem, Tabs, Tab
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { toast } from "react-toastify";
import instance from '../constant/instance';

const DeletedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [bulkOrders, setBulkOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalBulkOrders, setTotalBulkOrders] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState(0);

    const getDeletedOrders = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await instance.get('/order/deleted', {
                params: { page: currentPage, limit: pageSize }
            });
            setOrders(data.data || []);
            setTotalPages(Math.ceil(data.totalOrder / pageSize) || 1);
            setTotalOrders(data.totalOrder || 0);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch deleted orders');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    const getDeletedBulkOrders = React.useCallback(async () => {
        try {
            setBulkLoading(true);
            const { data } = await instance.get('/order/bulk/deleted', {
                params: { page: 1, limit: 50 }
            });
            setBulkOrders(data.bulkorders || []);
            setTotalBulkOrders(data.totalOrders || 0);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch deleted bulk orders');
        } finally {
            setBulkLoading(false);
        }
    }, []);

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(1);
    };

    const handleRestore = async (id) => {
        if (window.confirm('Restore this order to the main list?')) {
            try {
                await instance.put(`/order/restore/${id}`);
                toast.success("Order restored successfully");
                getDeletedOrders();
            } catch (err) {
                console.error(err);
                toast.error('Failed to restore order');
            }
        }
    };

    const handlePermanentDelete = async (id) => {
        if (window.confirm('Delete this order PERMANENTLY? This cannot be undone.')) {
            try {
                await instance.delete(`/order/permanent/${id}`);
                toast.success("Order deleted permanently");
                getDeletedOrders();
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete order permanently');
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you ABSOLUTELY sure you want to PERMANENTLY delete ALL orders in the recycle bin? This action is irreversible.')) {
            try {
                setLoading(true);
                const { data } = await instance.delete('/order/clear-deleted');
                toast.success(data.message || "Recycle bin cleared successfully");
                getDeletedOrders();
            } catch (err) {
                console.error(err);
                toast.error('Failed to clear recycle bin');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRestoreBulkOrder = async (id) => {
        if (window.confirm('Restore this bulk order to the main Bulk Orders list?')) {
            try {
                await instance.put(`/order/bulk/restore/${id}`);
                toast.success("Bulk order restored successfully");
                getDeletedBulkOrders();
            } catch (err) {
                console.error(err);
                toast.error('Failed to restore bulk order');
            }
        }
    };

    const handlePermanentDeleteBulkOrder = async (id) => {
        if (window.confirm('Delete this bulk order PERMANENTLY? This cannot be undone.')) {
            try {
                await instance.delete(`/order/bulk/permanent/${id}`);
                toast.success("Bulk order deleted permanently");
                getDeletedBulkOrders();
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete bulk order permanently');
            }
        }
    };

    useEffect(() => {
        getDeletedOrders();
    }, [getDeletedOrders]);

    useEffect(() => {
        getDeletedBulkOrders();
    }, [getDeletedBulkOrders]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

            {/* Header Card */}
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(211, 47, 47, 0.2)',
                }}
            >
                <CardContent sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                            <DeleteForeverIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Recycle Bin (Deleted Orders)
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Restore accidentally deleted orders or remove them permanently from the database
                            </Typography>
                        </Box>
                        {orders.length > 0 && (
                            <Box sx={{ ml: 'auto' }}>
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    startIcon={<DeleteForeverIcon />}
                                    onClick={handleClearAll}
                                    sx={{
                                        color: '#d32f2f',
                                        bgcolor: 'white',
                                        fontWeight: 'bold',
                                        '&:hover': { bgcolor: '#f5f5f5' },
                                        borderRadius: 2,
                                        px: 3
                                    }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', px: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    sx={{
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
                        icon={<DeleteForeverIcon fontSize="small" sx={{ color: activeTab === 0 ? '#1e88e5' : '#555' }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Deleted Orders
                                <Chip label={`${totalOrders} Total`} size="small" sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 'bold', borderRadius: '6px' }} />
                            </Box>
                        }
                    />
                    <Tab
                        icon={<LocalShippingIcon fontSize="small" sx={{ color: activeTab === 1 ? '#1e88e5' : '#555' }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Deleted Bulk Orders
                                <Chip label={`${totalBulkOrders} Total`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }} />
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <>
            {/* Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>S.No.</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Order ID</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Items</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Amount</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Deleted At</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length !== 0 ? (
                                orders.map((order, index) => (
                                    <TableRow key={order._id} hover>
                                        <TableCell sx={{ color: '#888', fontWeight: 500 }}>{index + 1 + (currentPage - 1) * pageSize}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>#{order.orderId}</TableCell>
                                        <TableCell>{order.shipping_details?.[0]?.name || 'N/A'}</TableCell>
                                        <TableCell>{order.totalItems}</TableCell>
                                        <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>${order.totalAmount}</TableCell>
                                        <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleRestore(order._id)}
                                                    startIcon={<RestoreIcon />}
                                                    size="small"
                                                    sx={{
                                                        color: '#4caf50',
                                                        borderColor: '#4caf50',
                                                        '&:hover': { borderColor: '#388e3c', bgcolor: 'rgba(76, 175, 80, 0.05)' },
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Restore
                                                </Button>
                                                <IconButton
                                                    onClick={() => handlePermanentDelete(order._id)}
                                                    size="small"
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                                                    }}
                                                >
                                                    <DeleteForeverIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body1" sx={{ color: '#999' }}>Recycle Bin is Empty</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
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
                </>
            )}

            {activeTab === 1 && (
                <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <LocalShippingIcon sx={{ color: '#37a6ff' }} />
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Deleted Bulk Orders</Typography>
                <Chip
                    label={`${bulkOrders.length} showing`}
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', borderRadius: '6px' }}
                />
                <Chip
                    label={`${totalBulkOrders} Total`}
                    size="small"
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {bulkLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>S.No.</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Product</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Qty</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Deleted At</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bulkOrders.length !== 0 ? (
                                bulkOrders.map((order, index) => (
                                    <TableRow key={order._id} hover>
                                        <TableCell sx={{ color: '#888', fontWeight: 500 }}>{index + 1}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{order.name || 'N/A'}</TableCell>
                                        <TableCell>{order.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.selectedProduct || 'N/A'}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{order.quantity || 'N/A'}</TableCell>
                                        <TableCell>{new Date(order.deletedAt || order.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleRestoreBulkOrder(order._id)}
                                                    startIcon={<RestoreIcon />}
                                                    size="small"
                                                    sx={{
                                                        color: '#4caf50',
                                                        borderColor: '#4caf50',
                                                        '&:hover': { borderColor: '#388e3c', bgcolor: 'rgba(76, 175, 80, 0.05)' },
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Restore
                                                </Button>
                                                <IconButton
                                                    onClick={() => handlePermanentDeleteBulkOrder(order._id)}
                                                    size="small"
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                                                    }}
                                                >
                                                    <DeleteForeverIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body1" sx={{ color: '#999' }}>No Deleted Bulk Orders</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
                </>
            )}
        </Box>
    );
};

export default DeletedOrders;
