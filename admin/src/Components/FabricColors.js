import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Clear, CloudUpload, Delete, Edit, Palette, Save } from "@mui/icons-material";
import { toast } from "react-toastify";
import instance from "../constant/instance";
import fileInstance from "../constant/filesInstance";
import { FRONTEND_URL } from "../constant/url";

const DEFAULT_SECTIONS = [
  {
    key: "premium-leather",
    eyebrow: "Leather Collection",
    title: "Premium Leathers",
    description: "Click on any swatch to explore the texture and grain of our hand-selected leathers.",
    sortOrder: 1,
    isActive: true,
  },
  {
    key: "polyester-satin",
    eyebrow: "Satin Collection",
    title: "Polyester Satin Colors",
    description: "Smooth, lightweight satin shades for custom varsity jackets with a clean reflective finish.",
    sortOrder: 2,
    isActive: true,
  },
];

const emptyColorForm = {
  name: "",
  group: "polyester-satin",
  imageUrl: "",
  altText: "",
  sortOrder: 1,
  isActive: true,
  image: null,
};

const emptySectionForm = {
  key: "",
  eyebrow: "",
  title: "",
  description: "",
  sortOrder: 1,
  isActive: true,
};

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#fff",
    color: "#333",
    "& fieldset": { borderColor: "#ddd" },
    "&:hover fieldset": { borderColor: "#37a6ff" },
    "&.Mui-focused fieldset": { borderColor: "#37a6ff" },
  },
  "& .MuiInputLabel-root": {
    color: "#666",
    "&.Mui-focused": { color: "#37a6ff" },
  },
  "& .MuiOutlinedInput-input": { color: "#333" },
};

const resolveImageSrc = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${FRONTEND_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const toSectionKey = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sortSections = (items = []) =>
  [...items].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

const getDefaultGroup = (sections = []) => sections[0]?.key || "polyester-satin";

const getNextSortOrder = (items = [], group = "polyester-satin") => {
  const groupOrders = items
    .filter((item) => item.group === group)
    .map((item) => Number(item.sortOrder))
    .filter(Number.isFinite);

  return groupOrders.length ? Math.max(...groupOrders) + 1 : 1;
};

const getNextSectionSortOrder = (sections = []) => {
  const orders = sections.map((section) => Number(section.sortOrder)).filter(Number.isFinite);
  return orders.length ? Math.max(...orders) + 1 : 1;
};

const createEmptyColorForm = (items = [], sections = DEFAULT_SECTIONS, group = getDefaultGroup(sections)) => ({
  ...emptyColorForm,
  group,
  sortOrder: getNextSortOrder(items, group),
});

const createEmptySectionForm = (sections = []) => ({
  ...emptySectionForm,
  sortOrder: getNextSectionSortOrder(sections),
});

function FabricColors() {
  const [colors, setColors] = useState([]);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [form, setForm] = useState(() => createEmptyColorForm([], DEFAULT_SECTIONS));
  const [sectionForm, setSectionForm] = useState(() => createEmptySectionForm(DEFAULT_SECTIONS));
  const [editingColor, setEditingColor] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeTab, setActiveTab] = useState("sections");

  const sortedSections = useMemo(() => sortSections(sections), [sections]);

  const groupedCounts = useMemo(() => {
    return sortedSections.reduce((acc, section) => {
      acc[section.key] = colors.filter((color) => color.group === section.key).length;
      return acc;
    }, {});
  }, [colors, sortedSections]);

  const getSectionLabel = (key) => {
    return sortedSections.find((section) => section.key === key)?.title || key;
  };

  const fetchColors = async () => {
    setLoading(true);
    try {
      const { data } = await instance.get("/fabric-colors/all");
      const nextColors = Array.isArray(data?.data) ? data.data : [];
      const nextSections = sortSections(
        Array.isArray(data?.sections) && data.sections.length ? data.sections : DEFAULT_SECTIONS
      );
      const nextGroup = nextSections.some((section) => section.key === form.group)
        ? form.group
        : getDefaultGroup(nextSections);

      setColors(nextColors);
      setSections(nextSections);
      setForm((prev) => {
        if (editingColor || prev.name || prev.imageUrl || prev.altText || prev.image) return prev;
        return { ...prev, group: nextGroup, sortOrder: getNextSortOrder(nextColors, nextGroup) };
      });
      setSectionForm((prev) => {
        if (editingSection || prev.key || prev.eyebrow || prev.title || prev.description) return prev;
        return createEmptySectionForm(nextSections);
      });
    } catch (error) {
      console.error("Error fetching fabric colors:", error);
      toast.error(error?.response?.data?.message || "Error fetching fabric colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (field) => (event) => {
    const value = field === "isActive" ? event.target.checked : event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "group" && !editingColor ? { sortOrder: getNextSortOrder(colors, value) } : {}),
    }));
  };

  const handleSectionChange = (field) => (event) => {
    const value = field === "isActive" ? event.target.checked : event.target.value;
    setSectionForm((prev) => {
      const next = {
        ...prev,
        [field]: field === "key" ? toSectionKey(value) : value,
      };

      if (field === "title" && !editingSection && !prev.key) {
        next.key = toSectionKey(value);
      }

      return next;
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setForm((prev) => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setForm(createEmptyColorForm(colors, sortedSections, form.group));
    setEditingColor(null);
    setPreviewUrl("");
  };

  const resetSectionForm = () => {
    setSectionForm(createEmptySectionForm(sortedSections));
    setEditingSection(null);
  };

  const handleEdit = (color) => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setActiveTab("pictures");
    setEditingColor(color);
    setForm({
      name: color.name || "",
      group: color.group || getDefaultGroup(sortedSections),
      imageUrl: color.imageUrl || "",
      altText: color.altText || "",
      sortOrder: color.sortOrder ?? 0,
      isActive: color.isActive !== false,
      image: null,
    });
    setPreviewUrl(resolveImageSrc(color.imageUrl));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditSection = (section) => {
    setActiveTab("sections");
    setEditingSection(section);
    setSectionForm({
      key: section.key || "",
      eyebrow: section.eyebrow || "",
      title: section.title || "",
      description: section.description || "",
      sortOrder: section.sortOrder ?? 0,
      isActive: section.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("group", form.group);
    data.append("imageUrl", form.imageUrl.trim());
    data.append("altText", form.altText.trim());
    data.append("sortOrder", String(form.sortOrder || 0));
    data.append("isActive", String(form.isActive));
    if (form.image) data.append("image", form.image);
    return data;
  };

  const buildSectionPayload = () => ({
    key: sectionForm.key.trim(),
    eyebrow: sectionForm.eyebrow.trim(),
    title: sectionForm.title.trim(),
    description: sectionForm.description.trim(),
    sortOrder: Number(sectionForm.sortOrder) || 0,
    isActive: Boolean(sectionForm.isActive),
  });

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) {
      toast.error("Please enter the section heading");
      return;
    }

    const payload = buildSectionPayload();
    if (!payload.key) payload.key = toSectionKey(payload.title);

    if (!payload.key) {
      toast.error("Please enter a section key");
      return;
    }

    setSavingSection(true);
    try {
      const url = editingSection ? `/fabric-colors/sections/${editingSection._id}` : "/fabric-colors/sections";
      const method = editingSection ? "put" : "post";
      await instance[method](url, payload);
      toast.success(editingSection ? "Fabric section updated" : "Fabric section added");
      resetSectionForm();
      fetchColors();
    } catch (error) {
      console.error("Error saving fabric section:", error);
      toast.error(error?.response?.data?.message || "Error saving fabric section");
    } finally {
      setSavingSection(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a color name");
      return;
    }

    if (!form.group) {
      toast.error("Please select a section");
      return;
    }

    if (!form.image && !form.imageUrl.trim() && !editingColor) {
      toast.error("Please upload an image or paste an image URL");
      return;
    }

    setSaving(true);
    try {
      const url = editingColor ? `/fabric-colors/${editingColor._id}` : "/fabric-colors";
      const method = editingColor ? "put" : "post";
      await fileInstance[method](url, buildFormData());
      toast.success(editingColor ? "Fabric color updated" : "Fabric color added");
      resetForm();
      fetchColors();
    } catch (error) {
      console.error("Error saving fabric color:", error);
      toast.error(error?.response?.data?.message || "Error saving fabric color");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (section) => {
    if (!window.confirm(`Delete "${section.title}"?`)) return;

    try {
      await instance.delete(`/fabric-colors/sections/${section._id}`);
      toast.success("Fabric section deleted");
      if (editingSection?._id === section._id) resetSectionForm();
      fetchColors();
    } catch (error) {
      console.error("Error deleting fabric section:", error);
      toast.error(error?.response?.data?.message || "Error deleting fabric section");
    }
  };

  const handleDelete = async (color) => {
    if (!window.confirm(`Delete "${color.name}"?`)) return;

    try {
      await instance.delete(`/fabric-colors/${color._id}`);
      toast.success("Fabric color deleted");
      if (editingColor?._id === color._id) resetForm();
      fetchColors();
    } catch (error) {
      console.error("Error deleting fabric color:", error);
      toast.error(error?.response?.data?.message || "Error deleting fabric color");
    }
  };

  const selectedPreview = previewUrl || resolveImageSrc(form.imageUrl);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f4f7fa" }}>
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)",
          color: "white",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(55, 166, 255, 0.2)",
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2 }}>
                <Palette sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Fabric Sections
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage fabric page sections, section copy, and swatch images
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {sortedSections.map((section) => (
                <Chip
                  key={section.key}
                  label={`${section.title}: ${groupedCounts[section.key] || 0}`}
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: "bold" }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mb: 4, borderRadius: 3, overflow: "hidden", bgcolor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": { fontWeight: 800, textTransform: "none", py: 1.8 },
            "& .Mui-selected": { color: "#37a6ff" },
            "& .MuiTabs-indicator": { backgroundColor: "#37a6ff", height: 3 },
          }}
        >
          <Tab label="Sections" value="sections" />
          <Tab label="Pictures" value="pictures" />
        </Tabs>
      </Paper>

      {activeTab === "sections" && (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
            {editingSection ? "Edit Section" : "Add Section"}
          </Typography>
          <Card elevation={0} sx={{ bgcolor: "#ffffff", color: "#333", borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                label="Section Key"
                fullWidth
                margin="normal"
                value={sectionForm.key}
                onChange={handleSectionChange("key")}
                sx={textFieldStyle}
                placeholder="premium-leather"
              />
              <TextField
                label="Line 1"
                fullWidth
                margin="normal"
                value={sectionForm.eyebrow}
                onChange={handleSectionChange("eyebrow")}
                sx={textFieldStyle}
                placeholder="Leather Collection"
              />
              <TextField
                label="Line 2"
                fullWidth
                margin="normal"
                value={sectionForm.title}
                onChange={handleSectionChange("title")}
                sx={textFieldStyle}
                placeholder="Premium Leathers"
              />
              <TextField
                label="Line 3"
                fullWidth
                multiline
                minRows={3}
                margin="normal"
                value={sectionForm.description}
                onChange={handleSectionChange("description")}
                sx={textFieldStyle}
                placeholder="Click on any swatch to explore the texture and grain..."
              />
              <TextField
                label="Section Sort Order"
                type="number"
                fullWidth
                margin="normal"
                value={sectionForm.sortOrder}
                onChange={handleSectionChange("sortOrder")}
                sx={textFieldStyle}
              />
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={sectionForm.isActive}
                    onChange={handleSectionChange("isActive")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#37a6ff" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#37a6ff" },
                    }}
                  />
                }
                label={sectionForm.isActive ? "Active on website" : "Hidden from website"}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSection}
                  disabled={savingSection}
                  fullWidth
                  startIcon={savingSection ? <CircularProgress size={18} sx={{ color: "white" }} /> : <Save />}
                  sx={{ bgcolor: "#37a6ff", color: "white", fontWeight: "bold", borderRadius: 2, py: 1, textTransform: "none", "&:hover": { bgcolor: "#1e88e5" } }}
                >
                  {editingSection ? "Update" : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetSectionForm}
                  fullWidth
                  startIcon={<Clear />}
                  sx={{ borderColor: "#ddd", color: "#666", borderRadius: 2, py: 1, textTransform: "none", "&:hover": { borderColor: "#bbb", bgcolor: "#f5f5f5" } }}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
            Website Sections
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#37a6ff" }} />
            </Box>
          ) : sortedSections.length === 0 ? (
            <Paper sx={{ py: 10, textAlign: "center", color: "#999", borderRadius: 3, bgcolor: "#ffffff", border: "1px dashed #ddd" }}>
              <Palette sx={{ fontSize: 64, mb: 2, opacity: 0.15 }} />
              <Typography variant="h6">No fabric sections found</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sortedSections.map((section) => (
                <Grid item xs={12} md={6} key={section._id || section.key}>
                  <Card sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: "#37a6ff", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
                            {section.eyebrow || section.key}
                          </Typography>
                          <Typography variant="h6" title={section.title} sx={{ color: "#333", fontWeight: 800, lineHeight: 1.25, mt: 0.3 }}>
                            {section.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={section.isActive ? "Active" : "Hidden"}
                          size="small"
                          sx={{
                            bgcolor: section.isActive ? "rgba(76, 175, 80, 0.1)" : "rgba(255, 82, 82, 0.1)",
                            color: section.isActive ? "#4caf50" : "#ff5252",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#777", mt: 1.5, minHeight: 42 }}>
                        {section.description}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          Sort {section.sortOrder ?? 0} - {groupedCounts[section.key] || 0} pictures
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={() => handleEditSection(section)} sx={{ color: "#37a6ff" }} aria-label={`Edit ${section.title}`}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteSection(section)} sx={{ color: "#ff5252" }} aria-label={`Delete ${section.title}`}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      )}

      {activeTab === "pictures" && (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
            {editingColor ? "Edit Picture" : "Add Picture"}
          </Typography>
          <Card elevation={0} sx={{ bgcolor: "#ffffff", color: "#333", borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                label="Picture Name"
                fullWidth
                margin="normal"
                value={form.name}
                onChange={handleChange("name")}
                sx={textFieldStyle}
                placeholder="Black Satin"
              />
              <TextField
                select
                label="Section"
                fullWidth
                margin="normal"
                value={form.group}
                onChange={handleChange("group")}
                sx={textFieldStyle}
                disabled={sortedSections.length === 0}
              >
                {sortedSections.map((section) => (
                  <MenuItem key={section.key} value={section.key}>
                    {section.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Image URL"
                fullWidth
                margin="normal"
                value={form.imageUrl}
                onChange={handleChange("imageUrl")}
                sx={textFieldStyle}
                placeholder="/fabric-colors/polyester-satin/black.jfif"
              />
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{
                  mt: 2,
                  py: 1.4,
                  color: "#37a6ff",
                  borderColor: "#37a6ff",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": { borderColor: "#1e88e5", bgcolor: "rgba(55, 166, 255, 0.05)" },
                }}
              >
                {form.image ? form.image.name : "Upload Image"}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {selectedPreview && (
                <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", border: "1px solid #eee", bgcolor: "#f8f9fa", aspectRatio: "4 / 2.6" }}>
                  <img src={selectedPreview} alt={form.altText || form.name || "Fabric preview"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </Box>
              )}
              <TextField
                label="Alt Text"
                fullWidth
                margin="normal"
                value={form.altText}
                onChange={handleChange("altText")}
                sx={textFieldStyle}
              />
              <TextField
                label="Picture Sort Order"
                type="number"
                fullWidth
                margin="normal"
                value={form.sortOrder}
                onChange={handleChange("sortOrder")}
                sx={textFieldStyle}
              />
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={handleChange("isActive")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#37a6ff" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#37a6ff" },
                    }}
                  />
                }
                label={form.isActive ? "Active on website" : "Hidden from website"}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || sortedSections.length === 0}
                  fullWidth
                  startIcon={saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : <Save />}
                  sx={{ bgcolor: "#37a6ff", color: "white", fontWeight: "bold", borderRadius: 2, py: 1, textTransform: "none", "&:hover": { bgcolor: "#1e88e5" } }}
                >
                  {editingColor ? "Update" : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  fullWidth
                  startIcon={<Clear />}
                  sx={{ borderColor: "#ddd", color: "#666", borderRadius: 2, py: 1, textTransform: "none", "&:hover": { borderColor: "#bbb", bgcolor: "#f5f5f5" } }}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
            Website Pictures
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#37a6ff" }} />
            </Box>
          ) : colors.length === 0 ? (
            <Paper sx={{ py: 10, textAlign: "center", color: "#999", borderRadius: 3, bgcolor: "#ffffff", border: "1px dashed #ddd" }}>
              <Palette sx={{ fontSize: 64, mb: 2, opacity: 0.15 }} />
              <Typography variant="h6">No fabric pictures found</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {colors.map((color) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={color._id}>
                  <Card sx={{ bgcolor: "#fff", borderRadius: 3, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <Box sx={{ height: 170, bgcolor: "#f8f9fa" }}>
                      <img src={resolveImageSrc(color.imageUrl)} alt={color.altText || color.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            title={color.name}
                            sx={{ color: "#333", fontWeight: 800, lineHeight: 1.25, maxWidth: "100%" }}
                          >
                            {color.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#777" }}>
                            {getSectionLabel(color.group)}
                          </Typography>
                        </Box>
                        <Chip
                          label={color.isActive ? "Active" : "Hidden"}
                          size="small"
                          sx={{
                            bgcolor: color.isActive ? "rgba(76, 175, 80, 0.1)" : "rgba(255, 82, 82, 0.1)",
                            color: color.isActive ? "#4caf50" : "#ff5252",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          Sort {color.sortOrder ?? 0}
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={() => handleEdit(color)} sx={{ color: "#37a6ff" }} aria-label={`Edit ${color.name}`}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(color)} sx={{ color: "#ff5252" }} aria-label={`Delete ${color.name}`}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      )}
    </Box>
  );
}

export default FabricColors;
