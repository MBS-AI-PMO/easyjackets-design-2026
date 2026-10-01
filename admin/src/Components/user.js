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
  People,
  Email,
  Phone,
  Home,
  Badge,
  Lock,
} from "@mui/icons-material";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  // Add User Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage, limit);
  }, [currentPage]);

  const fetchUsers = async (page, limit) => {
    try {
      setLoading(true);
      const response = await instance.get(`/auth/allusers?page=${page}&limit=${limit}`);
      setUsers(response.data.allUsers || []);
      setTotalPages(response.data.totalUsers || 1);
    } catch (error) {
      console.error("Error fetching users", error);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
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
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
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
      await instance.post('/auth/register', newUser);

      toast.success(`User "${newUser.name}" created successfully!`);
      setMessage({ type: 'success', text: `User "${newUser.name}" created successfully!` });
      handleCloseDialog();
      fetchUsers(currentPage, limit);
    } catch (error) {
      console.error('Add user error:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Failed to create user: ${errorMsg}`);
      setMessage({ type: 'error', text: `Failed to create user: ${errorMsg}` });
    } finally {
      setSubmitting(false);
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
                <People sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  User Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {users.length} registered customers • Page {currentPage}
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
              Add New User
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
          placeholder="Search by name or email address..."
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
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold' }}>Primary Address</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', textAlign: 'center' }}>Role</TableCell>
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
                <TableCell sx={{ color: '#888', maxWidth: 250, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="body2" noWrap>{formatAddress(user?.address) || '-'}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <Chip
                    label={user?.role === 1 ? "Admin" : "User"}
                    size="small"
                    sx={{
                      bgcolor: user?.role === 1 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(55, 166, 255, 0.1)',
                      color: user?.role === 1 ? '#ef6c00' : '#37a6ff',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: '#ffffff', border: '1px dashed #ddd' }}>
          <People sx={{ fontSize: 64, color: "#eee", mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#999' }}>
            {searchTerm ? 'No search results match your query.' : 'No users registered yet.'}
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
          disabled={currentPage === totalPages}
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
            <Typography variant="h6" fontWeight="bold">Create New User Account</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleAddUser}>
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
                  label="Home/Business Address"
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
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Register User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserTable;
