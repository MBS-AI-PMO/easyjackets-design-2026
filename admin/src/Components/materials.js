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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { AddCircleOutline, Category, Clear, Inventory2, Save, TableChart } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import instance from '../constant/instance';

function Material() {
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [sleeves, setSleeves] = useState('');
  const [bodyPrice, setBodyPrice] = useState('');
  const [sleevesPrice, setSleevesPrice] = useState('');
  const [matParent, setMatParent] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix');

  // Fetch all Materials
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = () => {
    instance.get('/property/materials')
      .then(response => setMaterials(response.data.materials))
      .catch(error => console.error("Error fetching Materials:", error));
  };

  // Handle create or update
  const handleSave = async () => {
    const url = selectedMaterial ? `/property/materials/${selectedMaterial._id}` : '/property/materials';
    const method = selectedMaterial ? 'put' : 'post';
    const data = { name, body, sleeves, bodyPrice, sleevesPrice, matParent };

    await instance[method](url, data)
      .then(response => {
        fetchMaterials(); // Reload to ensure sync
        resetForm();
      })
      .catch(error => console.error("Error saving Material:", error));
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      await instance.delete(`/property/materials/${id}`)
        .then(() => setMaterials(materials.filter(mat => mat._id !== id)))
        .catch(error => console.error("Error deleting Material:", error));
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setBody('');
    setSleeves('');
    setBodyPrice('');
    setSleevesPrice('');
    setMatParent('');
    setSelectedMaterial(null);
  };

  // Handle edit
  const handleEdit = (material) => {
    setName(material.name);
    setBody(material.body);
    setSleeves(material.sleeves);
    // Handle price fields which might be numbers or strings
    setBodyPrice(material["body-price"]);
    setSleevesPrice(material["sleeves-price"]);
    setMatParent(material["mat-parent"]);
    setSelectedMaterial(material);
    setActiveTab('form');
  };

  // --- Matrix UI Logic ---

  // Filter for Body Materials (rows) and Sleeves Materials (columns)
  const bodyMaterials = materials.filter(m => m.body === 'on');
  const sleevesMaterials = materials.filter(m => m.sleeves === 'on');

  // Helper to check if a sleeve is linked to a body
  const isLinked = (bodyMat, sleeveMat) => {
    // Check if mat-parent is array or string
    const parent = sleeveMat["mat-parent"];
    if (Array.isArray(parent)) {
      return parent.includes(bodyMat.name) || (sleeveMat.name === bodyMat.name && sleeveMat.body === 'on' && sleeveMat.sleeves === 'on');
    }
    return parent === bodyMat.name || (sleeveMat.name === bodyMat.name && sleeveMat.body === 'on' && sleeveMat.sleeves === 'on');
  };

  const handleToggle = async (bodyMat, sleeveMat) => {
    // Determine new state
    const currentParents = Array.isArray(sleeveMat["mat-parent"]) ? [...sleeveMat["mat-parent"]] : (sleeveMat["mat-parent"] ? [sleeveMat["mat-parent"]] : []);

    // Check if currently linked
    const isCurrentlyLinked = currentParents.includes(bodyMat.name);

    let newParents;
    if (isCurrentlyLinked) {
      newParents = currentParents.filter(p => p !== bodyMat.name);
    } else {
      newParents = [...currentParents, bodyMat.name];
    }

    // Call API
    const data = {
      ...sleeveMat,
      name: sleeveMat.name,
      body: sleeveMat.body,
      sleeves: sleeveMat.sleeves,
      bodyPrice: sleeveMat["body-price"],
      sleevesPrice: sleeveMat["sleeves-price"],
      matParent: newParents
    };

    try {
      await instance.put(`/property/materials/${sleeveMat._id}`, data);
      if (!isCurrentlyLinked) {
        toast.success(`Success! ${sleeveMat.name} is now available for ${bodyMat.name}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      fetchMaterials();
    } catch (error) {
      console.error("Error updating material link:", error);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 200, headerClassName: 'super-app-theme--header' },
    { field: 'body', headerName: 'Body', flex: 0.65, minWidth: 110, headerClassName: 'super-app-theme--header' },
    { field: 'sleeves', headerName: 'Sleeves', flex: 0.75, minWidth: 120, headerClassName: 'super-app-theme--header' },
    { field: 'bodyPrice', headerName: 'Body Price', flex: 0.75, minWidth: 130, headerClassName: 'super-app-theme--header' },
    { field: 'sleevesPrice', headerName: 'Sleeve Price', flex: 0.8, minWidth: 140, headerClassName: 'super-app-theme--header' },
    {
      field: 'matParent',
      headerName: 'Parent Materials',
      flex: 1.7,
      minWidth: 260,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const value = params.value;
        return Array.isArray(value) ? value.join(', ') : value;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            sx={{ bgcolor: '#37a6ff', color: 'white', '&:hover': { bgcolor: '#1e88e5' } }}
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: '#ff5252' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const rows = materials.map((mat) => ({
    id: mat._id,
    _id: mat._id,
    name: mat.name,
    body: mat.body,
    sleeves: mat.sleeves,
    bodyPrice: mat["body-price"],
    sleevesPrice: mat["sleeves-price"],
    matParent: mat["mat-parent"],
    ...mat
  }));

  const tabItems = [
    {
      value: 'matrix',
      label: 'Compatibility Matrix',
      count: `${bodyMaterials.length} x ${sleevesMaterials.length}`,
      icon: TableChart,
      tone: 'blue',
    },
    {
      value: 'form',
      label: selectedMaterial ? 'Edit Material' : 'Add New Material',
      count: selectedMaterial ? 'Editing' : 'Form',
      icon: AddCircleOutline,
      tone: selectedMaterial ? 'orange' : 'blue',
    },
    {
      value: 'inventory',
      label: 'Material Inventory',
      count: `${materials.length} Total`,
      icon: Inventory2,
      tone: 'blue',
    },
  ];

  const getTabChipSx = (selected, tone) => {
    if (tone === 'orange') {
      return {
        bgcolor: selected ? 'rgba(173, 93, 48, 0.12)' : 'rgba(173, 93, 48, 0.08)',
        color: '#ad5d30',
      };
    }

    return {
      bgcolor: selected ? 'rgba(55, 166, 255, 0.12)' : '#eef4fb',
      color: selected ? '#168eed' : '#2f83d5',
    };
  };

  // Reusable styles for inputs
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#fff',
      color: '#333',
      '& fieldset': {
        borderColor: '#ddd',
      },
      '&:hover fieldset': {
        borderColor: '#37a6ff',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#37a6ff',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#37a6ff',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: '#333'
    }
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
              <Category sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Material Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage body materials, sleeves options, and compatibility rules
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
          bgcolor: '#ffffff',
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
                bgcolor: '#37a6ff',
              },
              '& .MuiTab-root': {
                minHeight: 64,
                px: 2,
                py: 1.5,
                mr: 1,
                textTransform: 'none',
                color: '#333',
                fontWeight: 700,
              },
              '& .Mui-selected': {
                color: '#168eed',
              },
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
                          ...getTabChipSx(selected, item.tone),
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

      {activeTab === 'matrix' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
            Material Compatibility Matrix (Body vs. Sleeves)
          </Typography>
          <Card elevation={0} sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                Configure which Sleeve materials (Columns) can be paired with which Body materials (Rows).
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600, border: '1px solid #eee' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f4f7fa', color: '#333', zIndex: 10, borderBottom: '2px solid #ddd' }}>
                        Body \ Sleeves
                      </TableCell>
                      {sleevesMaterials.map(sleeve => (
                        <TableCell key={sleeve._id} align="center" sx={{ bgcolor: '#f4f7fa', color: '#555', minWidth: 100, fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          <div style={{ transform: 'rotate(0deg)', whiteSpace: 'nowrap' }}>
                            {sleeve.name}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bodyMaterials.map(bodyMat => (
                      <TableRow key={bodyMat._id} hover sx={{ '&:hover': { bgcolor: '#f9f9f9 !important' } }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#fff', color: '#333', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>
                          {bodyMat.name}
                        </TableCell>
                        {sleevesMaterials.map(sleeveMat => {
                          const active = isLinked(bodyMat, sleeveMat);
                          return (
                            <TableCell key={sleeveMat._id} align="center" sx={{ borderBottom: '1px solid #eee', bgcolor: active ? 'rgba(55, 166, 255, 0.05)' : 'transparent' }}>
                              <Switch
                                checked={active}
                                onChange={() => handleToggle(bodyMat, sleeveMat)}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#37a6ff',
                                    '&:hover': {
                                      backgroundColor: 'rgba(55, 166, 255, 0.1)',
                                    },
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#37a6ff',
                                  },
                                }}
                                size="small"
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 'form' && (
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
            {selectedMaterial ? 'Edit Material' : 'Add New Material'}
          </Typography>
          <Card elevation={0} sx={{ bgcolor: '#ffffff', color: '#333', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                label="Material Name"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={textFieldStyle}
                placeholder="e.g. Wool, Leather"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Is Body? (on/off)"
                    fullWidth
                    margin="normal"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Is Sleeve? (on/off)"
                    fullWidth
                    margin="normal"
                    value={sleeves}
                    onChange={(e) => setSleeves(e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Body Price ($)"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={bodyPrice}
                    onChange={(e) => setBodyPrice(e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Sleeve Price ($)"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={sleevesPrice}
                    onChange={(e) => setSleevesPrice(e.target.value)}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Parent Material (Legacy Link)"
                fullWidth
                margin="normal"
                value={matParent}
                onChange={(e) => setMatParent(e.target.value)}
                sx={textFieldStyle}
              />
            </CardContent>
            <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                fullWidth
                startIcon={<Save />}
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
                {selectedMaterial ? 'Update' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                fullWidth
                startIcon={<Clear />}
                sx={{
                  borderColor: '#ddd',
                  color: '#666',
                  borderRadius: 2,
                  py: 1,
                  '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' },
                  textTransform: 'none'
                }}
              >
                Clear
              </Button>
            </CardActions>
          </Card>
        </Box>
      )}

      {activeTab === 'inventory' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>Material Inventory</Typography>
          <Box sx={{ height: 600, width: '100%', bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              density="standard"
              sx={{
                border: 'none',
                color: '#333',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8f9fa',
                  color: '#555',
                  borderBottom: '1px solid #ddd',
                  fontSize: '0.9rem',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: '#fcfdfe',
                },
                '& .MuiTablePagination-root': {
                  color: '#666',
                },
                '& .MuiIconButton-root': {
                  color: '#555',
                },
                '& .MuiDataGrid-iconSeparator': {
                  color: '#ddd',
                },
                '& .super-app-theme--header': {
                  // Additional header styling if needed
                },
              }}
            />
          </Box>
        </Box>
      )}
      <ToastContainer />
    </Box>

  );
}

export default Material;
