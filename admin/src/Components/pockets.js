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
import { Delete, Edit, Backpack } from '@mui/icons-material';
import instance from '../constant/instance';

function Pockets() {
  const [pockets, setPockets] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedPocket, setSelectedPocket] = useState(null);

  // Fetch all Pockets
  useEffect(() => {
    fetchPockets();
  }, []);

  const fetchPockets = () => {
    instance.get('/property/pockets')
      .then(response => {
        setPockets(response.data.pockets || []);
      })
      .catch(error => {
        console.error("Error fetching Pockets:", error);
      });
  };

  // Handle create or update
  const handleSave = async () => {
    const url = selectedPocket ? `/property/pockets/${selectedPocket._id}` : '/property/pockets';
    const method = selectedPocket ? 'put' : 'post';
    const data = { name, price };

    try {
      await instance[`${method}`](url, data);
      fetchPockets();
      resetForm();
    } catch (error) {
      console.error("Error saving Pocket:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pocket style?")) {
      await instance.delete(`/property/pockets/${id}`)
        .then(() => setPockets(pockets.filter(pocket => pocket._id !== id)))
        .catch(error => console.error("Error deleting Pocket:", error));
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setPrice('');
    setSelectedPocket(null);
  };

  // Handle edit
  const handleEdit = (pocket) => {
    setName(pocket.name);
    setPrice(pocket.price);
    setSelectedPocket(pocket);
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
              <Backpack sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Pocket Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage pocket style options and additional pricing
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
            {selectedPocket ? 'Edit Pocket Style' : 'Add New Pocket Style'}
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
                placeholder="e.g. Inside Pocket"
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
                {selectedPocket ? 'Update Style' : 'Save Style'}
              </Button>
              {selectedPocket && (
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
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Available Pockets</Typography>
            <Chip
              label={`${pockets.length} items`}
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
                {pockets.map((pocket) => (
                  <TableRow
                    key={pocket._id}
                    hover
                    sx={{ '&:hover': { bgcolor: '#fcfdfe !important' } }}
                  >
                    <TableCell sx={{ color: '#333', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}>{pocket.name}</TableCell>
                    <TableCell sx={{ color: '#666', borderBottom: '1px solid #f0f0f0' }}>
                      {pocket.price > 0 ? (
                        <Chip label={`+$${pocket.price}`} size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontWeight: 'bold' }} />
                      ) : (
                        <Chip label="Free" size="small" sx={{ bgcolor: '#f5f5f5', color: '#666' }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => handleEdit(pocket)}
                          size="small"
                          sx={{ color: '#37a6ff', bgcolor: 'rgba(55, 166, 255, 0.05)', '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.1)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(pocket._id)}
                          size="small"
                          sx={{ color: '#ff5252', bgcolor: 'rgba(255, 82, 82, 0.05)', '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.1)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {pockets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6, color: '#999' }}>
                      <Backpack sx={{ fontSize: 48, mb: 1, opacity: 0.1 }} />
                      <Typography variant="body1">No pocket styles found</Typography>
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

export default Pockets;
