import React, { useState, useEffect, useMemo } from "react";
import instance from "../constant/instance";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  MenuItem,
  Chip,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  Category,
  Image,
  Label,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { uploadUrl } from '../constant/url';
const getSectionKey = (value) => {
  const key = String(value || "general").trim();
  return key || "general";
};

const formatSectionLabel = (value) =>
  getSectionKey(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeSection, setActiveSection] = useState("all");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    section: "jackets",
    showOnLanding: true,
    serial: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const sectionTabs = useMemo(() => {
    const counts = categories.reduce((acc, category) => {
      const key = getSectionKey(category.section);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const tabs = Object.keys(counts)
      .sort((a, b) => formatSectionLabel(a).localeCompare(formatSectionLabel(b)))
      .map((key) => ({
        key,
        label: formatSectionLabel(key),
        count: counts[key],
      }));

    return [{ key: "all", label: "All", count: categories.length }, ...tabs];
  }, [categories]);

  const visibleCategories = useMemo(() => {
    if (activeSection === "all") return categories;
    return categories.filter((category) => getSectionKey(category.section) === activeSection);
  }, [activeSection, categories]);

  useEffect(() => {
    if (
      activeSection !== "all" &&
      !categories.some((category) => getSectionKey(category.section) === activeSection)
    ) {
      setActiveSection("all");
    }
  }, [activeSection, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/category/get-category");
      setCategories(response.data.category || []);
    } catch (error) {
      console.error("Error fetching categories", error);
      setMessage({ type: "error", text: "Failed to fetch categories" });
    } finally {
      setLoading(false);
    }
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setDialogMode("add");
    setFormData({ name: "", code: "", section: "jackets", showOnLanding: true, serial: categories.length });
    setImageFile(null);
    setImagePreview(null);
    setCurrentCategory(null);
    setOpenDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (category) => {
    setDialogMode("edit");
    setFormData({
      name: category.name || "",
      code: category.code || "",
      section: category.section || "jackets",
      showOnLanding: category.showOnLanding !== undefined ? category.showOnLanding : true,
      serial: category.serial !== undefined ? category.serial : 0,
    });
    setImagePreview(category.image || null);
    setImageFile(null);
    setCurrentCategory(category);
    setOpenDialog(true);
  };

  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: "", code: "" });
    setImageFile(null);
    setImagePreview(null);
    setCurrentCategory(null);
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);

      if (dialogMode === "add") {
        // Create new category
        const createData = new FormData();
        createData.append("name", formData.name);
        createData.append(
          "code",
          formData.code || formData.name.toLowerCase().replace(/\s+/g, '-')
        );
        createData.append("section", formData.section);
        createData.append("showOnLanding", formData.showOnLanding);
        createData.append("serial", formData.serial);
        if (imageFile) {
          createData.append("image", imageFile);
        }

        const response = await instance.post("/category/create-category", createData);

        if (response.data.success) {
          toast.success(`Category "${formData.name}" created successfully!`);
          handleCloseDialog();
          fetchCategories();
        } else {
          toast.error(response.data.message || "Failed to create category");
        }
      } else {
        // Update category
        const updateData = new FormData();
        updateData.append("name", formData.name);
        updateData.append("section", formData.section);
        updateData.append("showOnLanding", formData.showOnLanding);
        updateData.append("serial", formData.serial);
        if (imageFile) {
          updateData.append("image", imageFile);
        } else if (currentCategory?.image) {
          // Send existing image URL so backend preserves it
          updateData.append("existingImage", currentCategory.image);
        }

        const response = await instance.put(
          `/category/update-category/${currentCategory._id}`,
          updateData
        );

        if (response.data.success) {
          toast.success(`Category "${formData.name}" updated successfully!`);
          handleCloseDialog();
          fetchCategories();
        } else {
          toast.error(response.data.message || "Failed to update category");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setSubmitting(true);
      const response = await instance.delete(
        `/category/delete-category/${categoryToDelete._id}`
      );

      if (response.data.success) {
        toast.success(`Category "${categoryToDelete.name}" deleted!`);
        setDeleteDialog(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused fieldset': {
        borderColor: '#37a6ff',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#37a6ff',
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <Category sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Category Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {activeSection === "all"
                    ? `${categories.length} Active Categories`
                    : `${visibleCategories.length} ${formatSectionLabel(activeSection)} Categories`}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleOpenAdd}
              sx={{
                bgcolor: "white",
                color: "#37a6ff",
                fontWeight: "bold",
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
              Add New Category
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Messages */}
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
          <CircularProgress sx={{ color: "#37a6ff" }} />
        </Box>
      )}

      {!loading && sectionTabs.length > 1 && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid #eef2f6",
            bgcolor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeSection}
              onChange={(_, value) => setActiveSection(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 64,
                px: 2,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 3,
                  bgcolor: "#37a6ff",
                },
                "& .MuiTab-root": {
                  minHeight: 64,
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  textTransform: "none",
                  color: "#333",
                  fontWeight: 700,
                },
                "& .Mui-selected": {
                  color: "#168eed",
                },
              }}
            >
              {sectionTabs.map((tab) => {
                const selected = activeSection === tab.key;
                return (
                  <Tab
                    key={tab.key}
                    value={tab.key}
                    icon={<Category sx={{ fontSize: 22, color: selected ? "#168eed" : "#5f6368" }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>{tab.label}</span>
                        <Chip
                          label={`${tab.count} Total`}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            bgcolor: selected ? "rgba(55, 166, 255, 0.12)" : "#eef4fb",
                            color: selected ? "#168eed" : "#2f83d5",
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
      )}

      {/* Categories Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {visibleCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                bgcolor: '#ffffff',
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                border: '1px solid #f0f0f0',
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  borderColor: '#37a6ff'
                },
              }}
            >
              <Box sx={{ p: 2, bgcolor: '#fcfcfc', borderBottom: '1px solid #f5f5f5' }}>
                {category.image ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={uploadUrl(category.image)}
                    alt={category.name}
                    sx={{
                      objectFit: "contain",
                      borderRadius: 2
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f8f9fa",
                      borderRadius: 2
                    }}
                  >
                    <Image sx={{ fontSize: 64, color: "#ddd" }} />
                  </Box>
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#333' }}>
                  {category.name}
                </Typography>
                <Chip
                  label={category.section || 'General'}
                  size="small"
                  sx={{ mt: 1, bgcolor: 'rgba(55, 166, 255, 0.08)', color: '#37a6ff', fontWeight: 'bold' }}
                />
                <Chip
                  label={`Serial: ${category.serial || 0}`}
                  size="small"
                  sx={{ mt: 1, ml: 0.5, bgcolor: 'rgba(173, 93, 48, 0.08)', color: '#ad5d30', fontWeight: 'bold' }}
                />
                {category.showOnLanding === false && (
                  <Chip
                    icon={<VisibilityOff sx={{ fontSize: 14 }} />}
                    label="Hidden on Landing"
                    size="small"
                    sx={{ mt: 1, ml: 0.5, bgcolor: 'rgba(255,82,82,0.08)', color: '#ff5252', fontWeight: 'bold' }}
                  />
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleOpenEdit(category)}
                  sx={{ color: "#37a6ff", fontWeight: 'bold', textTransform: 'none' }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleOpenDelete(category)}
                  sx={{ color: "#ff5252", fontWeight: 'bold', textTransform: 'none' }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && visibleCategories.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: '#ffffff', border: '1px dashed #ddd' }}>
          <Category sx={{ fontSize: 64, color: "#eee", mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#999' }}>
            {categories.length === 0
              ? 'No categories found. Click "Add New Category" to get started.'
              : `No categories found in ${formatSectionLabel(activeSection)}.`}
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#ffffff' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {dialogMode === "add" ? <Add /> : <Edit />}
            <Typography variant="h6" fontWeight="bold">
              {dialogMode === "add" ? "Create Category" : "Modify Category"}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 4 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              margin="normal"
              disabled={submitting}
              sx={textFieldStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Label sx={{ color: '#37a6ff' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Assigned Section"
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              margin="normal"
              disabled={submitting}
              sx={textFieldStyle}
            >
              <MenuItem value="jackets">Jackets</MenuItem>
              <MenuItem value="sports">Sports & Spirit Wears</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Display Order (Serial)"
              type="number"
              value={formData.serial}
              onChange={(e) =>
                setFormData({ ...formData, serial: parseInt(e.target.value) || 0 })
              }
              margin="normal"
              disabled={submitting}
              sx={textFieldStyle}
              helperText="Determines the order in which categories are shown (Lower numbers appear first)"
            />

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {formData.showOnLanding ? <Visibility sx={{ color: '#37a6ff' }} /> : <VisibilityOff sx={{ color: '#999' }} />}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Show on Landing Page
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    {formData.showOnLanding ? 'Category is visible on the homepage' : 'Category is hidden from the homepage'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={formData.showOnLanding}
                onChange={(e) => setFormData({ ...formData, showOnLanding: e.target.checked })}
                disabled={submitting}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#37a6ff' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#37a6ff' },
                }}
              />
            </Box>

            {(
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ color: '#555', mb: 1.5, fontWeight: 'bold' }}>
                  Category Branding Image
                </Typography>
                {imagePreview && (
                  <Box
                    sx={{
                      width: "100%",
                      height: 150,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: "white",
                      borderRadius: 2,
                      mb: 2,
                      border: '1px solid #ddd',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={uploadUrl(imagePreview)}
                      alt="Preview"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                    {/* Show a badge indicating if this is current or new */}
                    <Chip
                      label={imageFile ? "New Image" : "Current Image"}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: imageFile ? '#4caf50' : '#37a6ff',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />
                    {/* Remove button to clear the selected new image */}
                    {imageFile && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(currentCategory?.image || null);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,82,82,0.9)',
                          color: 'white',
                          '&:hover': { bgcolor: '#ff5252' },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Image />}
                  sx={{
                    color: '#37a6ff',
                    borderColor: '#37a6ff',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: '#1e88e5',
                      bgcolor: 'rgba(55, 166, 255, 0.05)'
                    }
                  }}
                >
                  {imageFile ? imageFile.name : dialogMode === "edit" && imagePreview ? "Change Image" : "Select Image File"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Button onClick={handleCloseDialog} disabled={submitting} sx={{ color: '#888', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: "#37a6ff",
                "&:hover": { bgcolor: "#1e88e5" },
                px: 6,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : dialogMode === "add" ? (
                "Create Now"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#ffffff' } }}
      >
        <DialogTitle sx={{ color: "#ff5252", fontWeight: 'bold' }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Delete />
            Remove Category?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#555' }}>
            Are you sure you want to permanently delete{" "}
            <strong>"{categoryToDelete?.name}"</strong>?
          </Typography>
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            This action cannot be undone. Products linked to this category may lose their categorization.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={submitting} sx={{ color: '#888', textTransform: 'none' }}>
            No, Keep it
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={submitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            {submitting ? <CircularProgress size={24} /> : "Yes, Delete Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
