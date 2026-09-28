import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { AddCircleOutline, Clear, Inventory2, Save, Straighten } from '@mui/icons-material';
import instance from '../constant/instance';

const fieldLabels = {
  size: 'Size',
  chest: 'Chest',
  waist: 'Waist',
  sleeves: 'Sleeves',
  backlength: 'Back Length',
  jchest: 'Jacket Chest',
  jsleeves: 'Jacket Sleeves',
  jashoulder: 'Jacket Across Shoulder',
  jshoulder: 'Jacket Shoulder',
  jbacklength: 'Jacket Back Length',
  price: 'Price',
  fprice: 'Final Price'
};

const Size = () => {
  const [sizes, setSizes] = useState([]);
  const [formValues, setFormValues] = useState({
    size: '',
    chest: '',
    waist: '',
    sleeves: '',
    backlength: '',
    jchest: '',
    jsleeves: '',
    jashoulder: '',
    jshoulder: '',
    jbacklength: '',
    price: '',
    fprice: ''
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  // Fetch all sizes
  useEffect(() => {
    instance.get('/property/sizes')
      .then(response => setSizes(response.data.sizes))
      .catch(error => console.error("Error fetching sizes:", error));
  }, []);

  // Handle create or update
  const handleSave = async () => {
    const url = selectedSize ? `/property/sizes/${selectedSize._id}` : '/property/sizes';
    const method = selectedSize ? 'put' : 'post';
    const data = formValues;

    try {
      const response = await instance[`${method}`](url, data);
      const updatedSizes = selectedSize
        ? sizes.map(size => (size._id === response.data.size._id ? response.data.size : size))
        : [...sizes, response.data.size];
      setSizes(updatedSizes);
      resetForm();
      setActiveTab('list');
    } catch (error) {
      console.error("Error saving size:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await instance.delete(`/property/sizes/${id}`);
      setSizes(sizes.filter(size => size._id !== id));
    } catch (error) {
      console.error("Error deleting size:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormValues({
      size: '',
      chest: '',
      waist: '',
      sleeves: '',
      backlength: '',
      jchest: '',
      jsleeves: '',
      jashoulder: '',
      jshoulder: '',
      jbacklength: '',
      price: '',
      fprice: ''
    });
    setSelectedSize(null);
  };

  // Handle edit
  const handleEdit = (size) => {
    setFormValues({
      size: size.size,
      chest: size.chest,
      waist: size.waist,
      sleeves: size.sleeves,
      backlength: size.backlength,
      jchest: size.jchest,
      jsleeves: size.jsleeves,
      jashoulder: size.jashoulder,
      jshoulder: size.jshoulder,
      jbacklength: size.jbacklength,
      price: size.price,
      fprice: size.fprice
    });
    setSelectedSize(size);
    setActiveTab('form');
  };

  const tabItems = [
    {
      value: 'form',
      label: selectedSize ? 'Update Size' : 'Add New Size',
      count: selectedSize ? 'Editing' : 'Form',
      icon: AddCircleOutline,
      tone: selectedSize ? 'orange' : 'blue'
    },
    {
      value: 'list',
      label: 'Size List',
      count: `${sizes.length} Total`,
      icon: Inventory2,
      tone: 'blue'
    }
  ];

  const getTabChipSx = (selected, tone) => {
    if (tone === 'orange') {
      return {
        bgcolor: selected ? 'rgba(173, 93, 48, 0.12)' : 'rgba(173, 93, 48, 0.08)',
        color: '#ad5d30'
      };
    }

    return {
      bgcolor: selected ? 'rgba(55, 166, 255, 0.12)' : '#eef4fb',
      color: selected ? '#168eed' : '#2f83d5'
    };
  };

  const columns = [
    { field: 'size', headerName: 'Size', flex: 0.7, minWidth: 80 },
    { field: 'chest', headerName: 'Chest', flex: 0.85, minWidth: 100 },
    { field: 'waist', headerName: 'Waist', flex: 0.85, minWidth: 100 },
    { field: 'sleeves', headerName: 'Sleeves', flex: 0.85, minWidth: 100 },
    { field: 'backlength', headerName: 'Back Length', flex: 0.9, minWidth: 110 },
    { field: 'jchest', headerName: 'J. Chest', flex: 0.85, minWidth: 100 },
    { field: 'jsleeves', headerName: 'J. Sleeves', flex: 0.85, minWidth: 105 },
    { field: 'jashoulder', headerName: 'J. Shoulder', flex: 0.9, minWidth: 110 },
    { field: 'jshoulder', headerName: 'J. Shoulder', flex: 0.9, minWidth: 110 },
    { field: 'jbacklength', headerName: 'J. Back Length', flex: 0.95, minWidth: 120 },
    { field: 'price', headerName: 'Price', flex: 0.65, minWidth: 80 },
    { field: 'fprice', headerName: 'F. Price', flex: 0.7, minWidth: 90 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{
              bgcolor: '#37a6ff',
              color: 'white',
              textTransform: 'uppercase',
              '&:hover': { bgcolor: '#1e88e5' }
            }}
          >
            Edit
          </Button>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(55, 166, 255, 0.2)'
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <Straighten sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Size Manager
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage jacket size measurements and pricing
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid #eef2f6',
          bgcolor: '#ffffff'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 64,
              px: 2,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 3,
                bgcolor: '#37a6ff'
              },
              '& .MuiTab-root': {
                minHeight: 64,
                px: 2,
                py: 1.5,
                mr: 1,
                textTransform: 'none',
                color: '#333',
                fontWeight: 700
              },
              '& .Mui-selected': {
                color: '#168eed'
              }
            }}
          >
            {tabItems.map((item) => {
              const selected = activeTab === item.value;
              const Icon = item.icon;

              return (
                <Tab
                  key={item.value}
                  value={item.value}
                  icon={<Icon sx={{ fontSize: 22, color: selected ? '#168eed' : '#5f6368' }} />}
                  iconPosition="start"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{item.label}</span>
                      <Chip
                        label={item.count}
                        size="small"
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          ...getTabChipSx(selected, item.tone)
                        }}
                      />
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {activeTab === 'form' && (
        <Box sx={{ maxWidth: 900 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
            {selectedSize ? 'Update Size' : 'Add New Size'}
          </Typography>
          <Card elevation={0} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
              {Object.keys(formValues).map(key => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    label={fieldLabels[key] || key}
                    fullWidth
                    value={formValues[key]}
                    onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fff',
                        '&.Mui-focused fieldset': {
                          borderColor: '#37a6ff'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#37a6ff'
                      }
                    }}
                  />
                </Grid>
              ))}
              </Grid>
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<Save />}
                sx={{
                  bgcolor: '#37a6ff',
                  fontWeight: 'bold',
                  color: 'white',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)',
                  '&:hover': { bgcolor: '#1e88e5' }
                }}
              >
                {selectedSize ? 'Update' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<Clear />}
                sx={{
                  borderColor: '#ddd',
                  color: '#666',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' }
                }}
              >
                Clear
              </Button>
            </CardActions>
          </Card>
        </Box>
      )}

      {activeTab === 'list' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>Size List</Typography>
          <Box sx={{ height: 600, width: '100%', bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <DataGrid
              rows={sizes}
              columns={columns}
              getRowId={(row) => row._id}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              density="compact"
              sx={{
                border: 'none',
                color: '#333',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0'
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8f9fa',
                  color: '#555',
                  borderBottom: '1px solid #ddd'
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold'
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: '#fcfdfe'
                }
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Size;
