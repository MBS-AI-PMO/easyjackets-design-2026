import React, { useEffect, useState } from 'react';
import instance from '../constant/instance';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  ListItemText,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { Edit, Delete, Palette } from '@mui/icons-material';

const Colors = () => {
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [parts, setParts] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', code: '', isActive: false, materials: [], parts: [] });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchColors();
    fetchMaterials();
    fetchParts();
  }, []);

  const fetchColors = async () => {
    const response = await instance.get('/property/colors');
    setColors(response.data.data);
  };

  const fetchMaterials = async () => {
    const { data } = await instance.get('/property/materials');
    setMaterials(data.materials);
  };

  const fetchParts = async () => {
    const response = await instance.get('/property/parts');
    setParts(response.data.data);
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setFormData({ id: '', name: '', code: '', isActive: false, materials: [], parts: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await instance.put(`/property/colors/${formData._id}`, formData);
    } else {
      await instance.post('/property/colors', formData);
    }
    fetchColors();
    handleClose();
  };

  const handleEdit = (color) => {
    setFormData(color);
    setEditMode(true);
    handleShow();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      await instance.delete(`/property/colors/${id}`);
      fetchColors();
    }
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
    '& .MuiOutlinedInput-input': { color: '#333' },
    '& .MuiSelect-icon': { color: '#666' },
    '& .MuiCheckbox-root': { color: '#999', '&.Mui-checked': { color: '#37a6ff' } }
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
              <Palette sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Color Palette
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage brand colors, hex codes, and material mapping
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleShow}
          sx={{
            bgcolor: '#37a6ff',
            fontWeight: 'bold',
            color: 'white',
            '&:hover': { bgcolor: '#1e88e5' },
            px: 4,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
          }}
        >
          Add New Color
        </Button>
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
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Internal ID</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Color Name</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Preview & Code</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Compatible Materials</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Applicable Parts</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>Status</TableCell>
              <TableCell sx={{ bgcolor: '#f8f9fa', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colors.map((color) => (
              <TableRow
                key={color._id}
                hover
                sx={{ '&:hover': { bgcolor: '#fcfdfe !important' } }}
              >
                <TableCell sx={{ color: '#888', borderBottom: '1px solid #f0f0f0' }}>{color.id}</TableCell>
                <TableCell sx={{ color: '#333', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>{color.name}</TableCell>
                <TableCell sx={{ color: '#555', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        backgroundColor: color.code,
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#37a6ff' }}>
                      {color.code?.toUpperCase()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                    {color.materials && color.materials.length > 0 ? (
                      color.materials.map(mat => (
                        <Chip key={mat} label={mat} size="small" sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontSize: '11px', height: 20 }} />
                      ))
                    ) : (
                      <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>None</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
                    {color.parts && color.parts.length > 0 ? (
                      color.parts.map(part => (
                        <Chip key={part} label={part} size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)', color: '#555', fontSize: '11px', height: 20 }} />
                      ))
                    ) : (
                      <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>None</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Chip
                    label={color.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor: color.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: color.isActive ? '#4caf50' : '#888',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <IconButton onClick={() => handleEdit(color)} sx={{ color: '#37a6ff' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(color._id)} sx={{ color: '#ff5252' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={show}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            borderRadius: 3,
            minWidth: '450px'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' }}>
          {editMode ? 'Modify Theme Color' : 'Register New Color'}
        </DialogTitle>
        <DialogContent sx={{ '.MuiDialogTitle-root + &': { pt: 3 } }}>
          <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <TextField
              margin="dense"
              label="Reference ID"
              fullWidth
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              sx={textFieldStyle}
            />
            <TextField
              margin="dense"
              label="Display Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={textFieldStyle}
            />
            <TextField
              margin="dense"
              label="HEX Code (e.g. #37a6ff)"
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              sx={textFieldStyle}
              InputProps={{
                endAdornment: (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: formData.code || '#eee', border: '1px solid #ddd' }} />
                )
              }}
            />

            <FormControl fullWidth margin="dense" sx={textFieldStyle}>
              <InputLabel>Compatible Materials</InputLabel>
              <Select
                multiple
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff' }} />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiSelect-select': { minHeight: 32 }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
                  }
                }}
              >
                {materials && materials.map((material) => (
                  <MenuItem key={material._id} value={material.name}>
                    <Checkbox checked={formData.materials.indexOf(material.name) > -1} sx={{ color: '#ddd', '&.Mui-checked': { color: '#37a6ff' } }} />
                    <ListItemText primary={material.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" sx={textFieldStyle}>
              <InputLabel>Applicable Parts</InputLabel>
              <Select
                multiple
                value={formData.parts}
                onChange={(e) => setFormData({ ...formData, parts: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)', color: '#666' }} />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: { bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
                  }
                }}
              >
                {parts && parts.map((part) => (
                  <MenuItem key={part._id} value={part.name}>
                    <Checkbox checked={formData.parts.indexOf(part.name) > -1} sx={{ color: '#ddd', '&.Mui-checked': { color: '#37a6ff' } }} />
                    <ListItemText primary={part.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                sx={{ color: '#ddd', '&.Mui-checked': { color: '#37a6ff' } }}
              />
              <Typography variant="body2" sx={{ color: '#555', fontWeight: 'bold' }}>Enable this color for selection</Typography>
            </Box>

            <DialogActions sx={{ mt: 3, p: 0, pt: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleClose} sx={{ color: '#999', textTransform: 'none' }}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#37a6ff',
                  '&:hover': { bgcolor: '#1e88e5' },
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                {editMode ? 'Save Changes' : 'Create Color'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Colors;
