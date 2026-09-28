import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Delete, Edit, DesignServices } from '@mui/icons-material';
import instance from '../constant/instance';

function Collars() {
  const [collars, setCollars] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCollar, setSelectedCollar] = useState(null);

  // Fetch all collars
  useEffect(() => {
    fetchCollars();
  }, []);

  const fetchCollars = () => {
    instance.get('/property/collars')
      .then(response => {
        setCollars(response.data.collars || []);
      })
      .catch(error => {
        console.error("Error fetching collars:", error);
      });
  };

  // Handle create or update
  const handleSave = async () => {
    const url = selectedCollar ? `/property/collars/${selectedCollar._id}` : '/property/collars';
    const method = selectedCollar ? 'put' : 'post';
    const data = { name, price };

    try {
      await instance[`${method}`](url, data);
      fetchCollars();
      resetForm();
    } catch (error) {
      console.error("Error saving collar:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this collar?")) {
      await instance.delete(`/property/collars/${id}`)
        .then(() => setCollars(collars.filter(collar => collar._id !== id)))
        .catch(error => console.error("Error deleting collar:", error));
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setPrice('');
    setSelectedCollar(null);
  };

  // Handle edit
  const handleEdit = (collar) => {
    setName(collar.name);
    setPrice(collar.price);
    setSelectedCollar(collar);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Styles
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
    '& .MuiOutlinedInput-input': { color: '#333' }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <DesignServices sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Collar Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage collar styles and custom pricing
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
            {selectedCollar ? 'Edit Collar Style' : 'Add New Collar Style'}
          </Typography>
          <Card elevation={0} sx={{ bgcolor: '#ffffff', color: '#333', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                label="Style Name"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={textFieldStyle}
                placeholder="e.g. Quilted Collar"
              />
              <TextField
                label="Additional Price ($)"
                type="number"
                fullWidth
                margin="normal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                sx={textFieldStyle}
                placeholder="0.00"
              />
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                fullWidth
                sx={{
                  bgcolor: '#37a6ff',
                  fontWeight: 'bold',
                  color: 'white',
                  borderRadius: 2,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)',
                  '&:hover': { bgcolor: '#1e88e5' },
                  textTransform: 'none'
                }}
              >
                {selectedCollar ? 'Update Style' : 'Save Style'}
              </Button>
              {selectedCollar && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  fullWidth
                  sx={{
                    borderColor: '#ddd',
                    color: '#666',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' },
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* List Section */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Available Collars</Typography>
            <Chip
              label={`${collars.length} items`}
              size="small"
              sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontWeight: 'bold' }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', py: 2 }}>Style Name</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', py: 2 }}>Additional Cost</TableCell>
                  <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', py: 2, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collars.map((collar) => (
                  <TableRow
                    key={collar._id}
                    hover
                    sx={{ '&:hover': { bgcolor: '#fcfdfe !important' } }}
                  >
                    <TableCell sx={{ color: '#333', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}>{collar.name}</TableCell>
                    <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>
                      {collar.price > 0 ? (
                        <Chip label={`+$${collar.price}`} size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontWeight: 'bold' }} />
                      ) : (
                        <Chip label="Free" size="small" sx={{ bgcolor: '#f5f5f5', color: '#666' }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => handleEdit(collar)}
                          size="small"
                          sx={{ color: '#37a6ff', bgcolor: 'rgba(55, 166, 255, 0.05)', '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.1)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(collar._id)}
                          size="small"
                          sx={{ color: '#ff5252', bgcolor: 'rgba(255, 82, 82, 0.05)', '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.1)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {collars.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6, color: '#999' }}>
                      <DesignServices sx={{ fontSize: 48, mb: 1, opacity: 0.1 }} />
                      <Typography variant="body1">No collar styles found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Collars;
