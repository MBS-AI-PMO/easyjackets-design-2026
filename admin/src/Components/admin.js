import React, { useState, useEffect } from "react";
import instance from "../constant/instance";
import { formatAddress } from "../utils/formatAddress";
import { toast } from "react-toastify";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Card,
    CardContent,
    InputAdornment,
    Fade,
    Paper,
    TableContainer,
    Grid
} from "@mui/material";
import {
    PersonAdd,
    Close,
    Search,
    SupervisorAccount,
    Email,
    Phone,
    Home,
    Badge,
    Lock,
    Delete,
} from "@mui/icons-material";

const AdminTable = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 100; // Increased limit to ensure we find admins since we are client-side filtering

    // Add User Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 1 // Default to Admin role
    });
    const [submitting, setSubmitting] = useState(false);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers(currentPage, limit);
    }, [currentPage]);

    const fetchUsers = async (page, limit) => {
        try {
            setLoading(true);
            // Using dedicated admin endpoint that returns only role: 1 users
            const response = await instance.get(`/auth/alladmins?page=${page}&limit=${limit}`);

            const admins = response.data.allAdmins || [];
            setUsers(admins);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching admins", error);
            if (error.response?.status === 401) {
                setMessage({ type: 'error', text: 'Authorization Error: You must be logged in as an admin to view this page' });
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch admins' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setMessage({ type: '', text: '' });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewUser({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            role: 1
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();

        // Validation
        if (!newUser.name || !newUser.email || !newUser.password || !newUser.address) {
            setMessage({ type: 'error', text: 'All fields are required' });
            return;
        }

        if (newUser.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            setSubmitting(true);
            // Using protected register-admin endpoint (requires admin authentication)
            const payload = { ...newUser, role: 1 };

            await instance.post('/auth/register-admin', payload);

            toast.success(`Admin "${newUser.name}" created successfully!`);
            setMessage({ type: 'success', text: `Admin "${newUser.name}" created successfully!` });
            handleCloseDialog();
            fetchUsers(currentPage, limit);
        } catch (error) {
            console.error('Add admin error:', error);

            if (error.response?.status === 401) {
                toast.error(`Authorization Error: Only admins can create new admin users!`);
                setMessage({ type: 'error', text: 'Authorization Error: Only admins can create new admin users!' });
            } else {
                const errorMsg = error.response?.data?.message || error.message;
                toast.error(`Failed to create admin: ${errorMsg}`);
                setMessage({ type: 'error', text: `Failed to create admin: ${errorMsg}` });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete Admin
    const handleDeleteClick = (user) => {
        setAdminToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!adminToDelete) return;

        try {
            setDeleting(true);
            await instance.delete(`/auth/admin/${adminToDelete._id}`);

            toast.success(`Admin "${adminToDelete.name}" deleted successfully!`);
            setDeleteDialogOpen(false);
            setAdminToDelete(null);
            fetchUsers(currentPage, limit);
        } catch (error) {
            console.error('Delete admin error:', error);
            if (error.response?.status === 401) {
                toast.error(`Authorization Error: Only admins can delete admin users!`);
            } else {
                const errorMsg = error.response?.data?.message || error.message;
                toast.error(`Failed to delete admin: ${errorMsg}`);
            }
        } finally {
            setDeleting(false);
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <SupervisorAccount sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    Admin Management
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {filteredUsers.length} Administrative Staff Members
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PersonAdd />}
                            onClick={handleOpenDialog}
                            sx={{
                                bgcolor: 'white',
                                color: '#37a6ff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2.5,
                                textTransform: 'none',
                                "&:hover": {
                                    bgcolor: "#f0f0f0",
                                    transform: "translateY(-2px)",
                                },
                                transition: "all 0.2s ease",
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Add New Admin
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Messages */}
            {message.text && (
                <Fade in>
                    <Alert
                        severity={message.type}
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                </Fade>
            )}

            {/* Search Bar */}
            <Paper sx={{ p: 0.5, mb: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <TextField
                    fullWidth
                    placeholder="Search admins by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#37a6ff', ml: 1 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '& fieldset': { border: 'none' },
                        },
                        '& .MuiOutlinedInput-input': { p: 2 }
                    }}
                />
            </Paper>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                    <CircularProgress sx={{ color: '#37a6ff' }} />
                </Box>
            )}

            {/* Users Table */}
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
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Email Address</TableCell>
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Address</TableCell>
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Role</TableCell>
                            <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow
                                key={user?._id}
                                hover
                                sx={{
                                    '&:hover': { bgcolor: '#fcfdfe !important' },
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                bgcolor: 'rgba(55, 166, 255, 0.1)',
                                                color: '#37a6ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase() || '?'}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                                            {user?.name || '-'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>{user?.email || '-'}</TableCell>
                                <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>{user?.phone || '-'}</TableCell>
                                <TableCell sx={{ color: '#888', maxWidth: 200, borderBottom: '1px solid #f0f0f0' }}>
                                    <Typography variant="body2" noWrap>{formatAddress(user?.address) || '-'}</Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <Chip
                                        label="Admin"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                                            color: '#ef6c00',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                                    <IconButton
                                        onClick={() => handleDeleteClick(user)}
                                        sx={{
                                            color: '#ff5252',
                                            bgcolor: 'rgba(255, 82, 82, 0.05)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 82, 82, 0.1)',
                                            },
                                            width: 32,
                                            height: 32,
                                        }}
                                        size="small"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
                <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: '#ffffff', border: '1px dashed #ddd' }}>
                    <SupervisorAccount sx={{ fontSize: 64, color: "#eee", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>
                        {searchTerm ? 'No search results match your query.' : 'No administration staff found.'}
                    </Typography>
                </Paper>
            )}

            {/* Pagination */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mt: 4, gap: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    sx={{
                        bgcolor: '#37a6ff',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        px: 3,
                        '&:hover': { bgcolor: '#1e88e5' },
                        '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' }
                    }}
                >
                    Previous
                </Button>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#555' }}>
                    Page {currentPage} of {totalPages}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    sx={{
                        bgcolor: '#37a6ff',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        px: 3,
                        '&:hover': { bgcolor: '#1e88e5' },
                        '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' }
                    }}
                >
                    Next
                </Button>
            </Box>

            {/* Add User Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, bgcolor: '#ffffff' }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonAdd />
                        <Typography variant="h6" fontWeight="bold">Authorize New Admin</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} size="small" sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleAddAdmin}>
                    <DialogContent sx={{ '.MuiDialogTitle-root + &': { pt: 4 } }}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                    disabled={submitting}
                                    sx={textFieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge sx={{ color: '#37a6ff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                    disabled={submitting}
                                    sx={textFieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: '#37a6ff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Security Password"
                                    name="password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                    disabled={submitting}
                                    helperText="Minimum 6 characters required"
                                    sx={textFieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#37a6ff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={newUser.phone}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                    disabled={submitting}
                                    sx={textFieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone sx={{ color: '#37a6ff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Home/Office Address"
                                    name="address"
                                    value={newUser.address}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                    disabled={submitting}
                                    multiline
                                    rows={2}
                                    sx={textFieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Home sx={{ color: '#37a6ff' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                            This account will be granted <strong>full administrative access</strong> to the management panel.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ p: 4, pt: 0 }}>
                        <Button
                            onClick={handleCloseDialog}
                            disabled={submitting}
                            sx={{ color: '#888', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            sx={{
                                bgcolor: '#37a6ff',
                                '&:hover': { bgcolor: '#1e88e5' },
                                px: 6,
                                py: 1.2,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                            }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Admin Account'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, bgcolor: '#ffffff' }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Delete />
                        <Typography variant="h6" fontWeight="bold">Revoke Access</Typography>
                    </Box>
                    <IconButton onClick={() => setDeleteDialogOpen(false)} size="small" sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ '.MuiDialogTitle-root + &': { pt: 4 } }}>
                    <Typography sx={{ color: '#333' }}>
                        Are you sure you want to permanently revoke administrative access for:
                    </Typography>
                    {adminToDelete && (
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee', mt: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#333' }}>
                                {adminToDelete.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {adminToDelete.email}
                            </Typography>
                        </Box>
                    )}
                    <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                        This action cannot be undone. The user will no longer be able to access the admin panel.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleting}
                        sx={{ color: '#888', textTransform: 'none' }}
                    >
                        Keep Account
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        sx={{
                            bgcolor: '#ff5252',
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            textTransform: 'none'
                        }}
                    >
                        {deleting ? <CircularProgress size={24} color="inherit" /> : 'Revoke Now'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminTable;
