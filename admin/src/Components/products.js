import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  DialogTitle,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  Divider,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import {
  Delete,
  Edit,
  Add,
  Search,
  Inventory,
  SportsFootball,
  AutoAwesome,
  CloudUpload,
  CheckCircle,
  ContentCopy,
  Difference as DifferenceIcon
} from "@mui/icons-material";
import fileInstance from "../constant/filesInstance";
import instance from "../constant/instance";
import Editor from "react-simple-wysiwyg"
import { CUSTOM_URL, uploadUrl } from "../constant/url";
import { toast } from "react-toastify";

const cleanSeoText = (value = "") => {
  const withoutTags = String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (typeof document === "undefined") return withoutTags;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = withoutTags;
  return textarea.value.replace(/\s+/g, " ").trim();
};

const cleanProductTitle = (value = "") =>
  cleanSeoText(value).replace(/\s*[-|]\s*Easy Jackets?$/i, "").trim();

const trimMetaDescription = (value = "") => {
  const text = cleanSeoText(value);
  if (text.length <= 155) return text;
  const clipped = text.slice(0, 154);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}.`;
};

const buildProductMetaDescription = (product) => {
  const source = cleanSeoText(product?.metaDescription)
    || cleanSeoText(product?.shortdescription)
    || cleanSeoText(product?.description);
  const categoryName = cleanSeoText(product?.category?.name);

  if (source) {
    const suffix = categoryName && !source.toLowerCase().includes(categoryName.toLowerCase())
      ? ` Available in our ${categoryName} collection.`
      : "";
    return trimMetaDescription(`${source}${suffix}`);
  }

  const title = cleanProductTitle(product?.name);
  return trimMetaDescription(
    categoryName
      ? `Shop ${title} from our ${categoryName} collection at Easy Jackets. Premium materials, custom styling, and worldwide shipping.`
      : `Shop ${title} at Easy Jackets. Premium materials, custom styling, and worldwide shipping.`
  );
};

const getMeaningfulProductDescription = (product) =>
  cleanSeoText(product?.description) ? product?.description : (product?.shortdescription || "");

const DEFAULT_CARE_INSTRUCTIONS_HTML =
  '<h5>Care Instructions</h5><p><strong>Wool</strong> &mdash; Brush your jacket gently with a suede soft brush.</p><p><strong>Cowhide Leather</strong> &mdash; Don&apos;t leave the leather wet, dry immediately.</p>';

const getProductCareInstructions = (product) =>
  cleanSeoText(product?.careInstructions) ? product.careInstructions : DEFAULT_CARE_INSTRUCTIONS_HTML;

function Products({ section = "jackets" }) {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editorTab, setEditorTab] = useState("description");
  const [materials, setMaterials] = useState([])
  const [colors, setColors] = useState([])
  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    standardPrice: 0,
    discountPrice: 0,
    color: "",
    category: "",
    description: "",
    careInstructions: DEFAULT_CARE_INSTRUCTIONS_HTML,
    metaTitle: "",
    metaDescription: "",
    shortdescription: "",
    imageAlt: "",
    frontImage: null,
    otherImages: [],
    sizes: [],
    material: {
      body: '',
      sleeves: ''
    }
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [otherImagesPreview, setOtherImagesPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState({ category: "", color: "", sku: "" });

  const handleClickOpen = () => {
    setEditorTab("description");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setEditorTab("description");
    setNewProduct({
      sku: "",
      name: "",
      standardPrice: 0,
      discountPrice: 0,
      color: "",
      category: "",
      description: "",
      careInstructions: DEFAULT_CARE_INSTRUCTIONS_HTML,
      metaTitle: "",
      metaDescription: "",
      shortdescription: "",
      imageAlt: "",
      frontImage: null,
      otherImages: [],
      sizes: [],
      material: {
        body: '',
        sleeves: ''
      }
    });
    setPreviewImage(null);
    setOtherImagesPreview([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({ ...prev, frontImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm({ ...searchTerm, [e.target.name]: e.target.value });
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...newProduct.otherImages, ...files];
    setNewProduct((prev) => ({ ...prev, otherImages: newImages }));

    const newPreviews = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then((imageUrls) => {
      setOtherImagesPreview((prev) => [...prev, ...imageUrls]);
    });
  };

  const handleRemoveOtherImage = (index) => {
    const updatedImages = newProduct.otherImages.filter((_, i) => i !== index);
    const updatedPreviews = otherImagesPreview.filter((_, i) => i !== index);
    setNewProduct((prev) => ({ ...prev, otherImages: updatedImages }));
    setOtherImagesPreview(updatedPreviews);
  };

  const handleAddSize = () => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "" }]
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = newProduct?.sizes.map((size, i) =>
      i === index ? { ...size, [field]: value } : size
    );
    setNewProduct((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleMaterialBody = (value) => {
    setNewProduct((prev) => ({ ...prev, material: { ...prev.material, "body": value } }))
  }

  const handleMaterialSleeves = (value) => {
    setNewProduct((prev) => ({ ...prev, material: { ...prev.material, "sleeves": value } }))
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    if (!newProduct?.name || !newProduct?.category || !newProduct?.color) {
      toast.error("Please fill category, name, and color");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', cleanSeoText(newProduct?.name));
    formData.append('sku', cleanSeoText(newProduct?.sku));
    formData.append('description', newProduct?.description);
    formData.append('careInstructions', newProduct?.careInstructions || "");
    formData.append('metaTitle', cleanSeoText(newProduct?.metaTitle) || cleanProductTitle(newProduct?.name));
    formData.append('metaDescription', trimMetaDescription(newProduct?.metaDescription) || buildProductMetaDescription(newProduct));
    formData.append('shortdescription', newProduct?.shortdescription);
    formData.append('standardPrice', newProduct?.standardPrice || 0);
    formData.append('discountPrice', newProduct?.discountPrice || 0);
    formData.append('color', newProduct?.color || "");
    formData.append('imageAlt', cleanSeoText(newProduct?.imageAlt) || cleanProductTitle(newProduct?.name));
    formData.append('category', newProduct?.category);
    formData.append("material", JSON.stringify(newProduct?.material));
    formData.append("sizes", JSON.stringify(newProduct?.sizes));

    if (newProduct.frontImage) {
      formData.append('frontImage', newProduct?.frontImage);
    }

    for (const image of newProduct?.otherImages) {
      formData.append('otherImages', image);
    }

    try {
      if (editingProduct) {
        await fileInstance.put(`/product/update-product/${editingProduct?._id}`, formData);
        toast.success("Product updated successfully");
      } else {
        await fileInstance.post('/product/create-product', formData);
        toast.success("Product created successfully");
      }
      handleClose();
      getProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error?.response?.data?.message || "Error saving product");
    } finally {
      setIsLoading(false);
    }
  };

  const getEditProductPayload = async (product) => {
    const key = product?.slug || product?._id;
    if (!key) return product;

    try {
      const { data } = await instance.get(`/product/get-product/${key}`);
      return data?.product || product;
    } catch (error) {
      console.error("Error fetching product details for edit:", error);
      return product;
    }
  };

  const handleEditProduct = async (product) => {
    const fullProduct = await getEditProductPayload(product);
    const detailDescription = getMeaningfulProductDescription(fullProduct);

    setEditingProduct(fullProduct);
    setNewProduct({
      ...fullProduct,
      name: cleanSeoText(fullProduct?.name),
      sku: cleanSeoText(fullProduct?.sku),
      description: detailDescription,
      careInstructions: getProductCareInstructions(fullProduct),
      metaTitle: cleanSeoText(fullProduct?.metaTitle) || cleanProductTitle(fullProduct?.name),
      metaDescription: buildProductMetaDescription(fullProduct),
      imageAlt: cleanSeoText(fullProduct?.imageAlt) || cleanProductTitle(fullProduct?.name),
      color: fullProduct?.color?._id || "",
      category: fullProduct?.category?._id || "",
      material: fullProduct?.material || { body: "", sleeves: "" },
      sizes: Array.isArray(fullProduct?.sizes) ? fullProduct.sizes : [],
      otherImages: [],
    });
    setPreviewImage(fullProduct?.frontImage);
    setOtherImagesPreview(Array.isArray(fullProduct?.otherImages) ? fullProduct.otherImages : []);
    setOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fileInstance.delete(`/product/delete-product/${id}`);
      toast.success('Product deleted successfully');
      getProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error('Something went wrong');
    }
  };

  const handleDuplicateProduct = async (id) => {
    try {
      await instance.post(`/product/duplicate-product/${id}`);
      toast.success('Product duplicated successfully');
      getProducts();
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error('Error duplicating product');
    }
  };

  const getProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.get(`/product/get-product?category=${searchTerm.category}&color=${searchTerm.color}&sku=${searchTerm.sku}&page=${currentPage}&limit=${rowsPerPage}&section=${section}`);
      setProducts(data.products);
      setTotalPages(data?.totalPages || 1);
      // Use totalProducts from the backend response
      setTotalProducts(data?.totalProducts || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage, section, rowsPerPage]);

  const getProperties = React.useCallback(async () => {
    try {
      const { data } = await instance.get(`/custom/get-properties?section=${section}`);
      setCategories(data.allCategory);
      setColors(data.colors);
      setMaterials(data.materials);
      setSizes(data.sizes);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }, [section]);

  useEffect(() => {
    getProperties();
  }, [getProperties]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleSearch = () => {
    setCurrentPage(1);
    getProducts();
  };

  const handleGenerateProductSeo = async () => {
    if (!window.confirm("Generate clean SEO title, description, and image alt text for products missing them? Existing clean custom SEO will not be overwritten.")) {
      return;
    }

    setIsSeoLoading(true);
    try {
      const { data } = await instance.post("/product/backfill-seo");
      toast.success(data?.message || "Product SEO metadata generated");
      getProducts();
    } catch (error) {
      console.error("Error generating product SEO:", error);
      toast.error(error?.response?.data?.message || "Error generating product SEO");
    } finally {
      setIsSeoLoading(false);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setCurrentPage(1);
  };

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
      backgroundColor: '#fff',
      px: 0.75,
      zIndex: 1,
      '&.Mui-focused': { color: '#37a6ff' },
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      lineHeight: 1.2,
    },
    '& .MuiOutlinedInput-input': { color: '#333' },
    '& .MuiSelect-icon': { color: '#666' }
  };

  const inputLabelProps = { shrink: true };
  const selectLabelSx = {
    color: '#666',
    bgcolor: '#fff',
    px: 0.75,
    zIndex: 1,
    '&.Mui-focused': { color: '#37a6ff' },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

      {/* Header Card */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                {section === 'sports' ? <SportsFootball sx={{ fontSize: 40 }} /> : <Inventory sx={{ fontSize: 40 }} />}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {section === 'sports' ? 'Sports & Spirit Wears' : 'Jackets Inventory'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage catalogs, pricing, and product customizer links
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={!isSeoLoading && <AutoAwesome />}
                onClick={handleGenerateProductSeo}
                disabled={isSeoLoading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.75)',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                {isSeoLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : "Generate Product SEO"}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleClickOpen}
                sx={{
                  bgcolor: 'white',
                  color: '#37a6ff',
                  '&:hover': { bgcolor: '#f0f0f0' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Create New Product
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Card */}
      <Card sx={{ mb: 4, bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink sx={selectLabelSx}>Search Category</InputLabel>
                <Select
                  name="category"
                  value={searchTerm?.category}
                  onChange={handleSearchChange}
                  label="Search Category"
                  sx={textFieldStyle['& .MuiOutlinedInput-root']}
                >
                  <MenuItem value=""><em>All Categories</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink sx={selectLabelSx}>Search Color</InputLabel>
                <Select
                  name="color"
                  value={searchTerm?.color}
                  onChange={handleSearchChange}
                  label="Search Color"
                  sx={textFieldStyle['& .MuiOutlinedInput-root']}
                >
                  <MenuItem value=""><em>All Colors</em></MenuItem>
                  {colors.map((color) => (
                    <MenuItem key={color._id} value={color._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: color.code, mr: 1, border: '1px solid #ddd' }} />
                        {color.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                name="sku"
                placeholder="Search SKU..."
                value={searchTerm.sku}
                onChange={handleSearchChange}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSearch}
                startIcon={<Search />}
                sx={{
                  bgcolor: '#37a6ff',
                  '&:hover': { bgcolor: '#1e88e5' },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  py: 1.1,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                }}
              >
                Search Inventory
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Catalog Items</Typography>
        <Chip
          label={`${products.length} showing`}
          size="small"
          sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontWeight: 'bold' }}
        />
        <Chip
          label={`${totalProducts} Total`}
          size="small"
          sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontWeight: 'bold' }}
        />
      </Box>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ '& td, & th': { borderBottom: 'none' } }}>
          <TableHead>
            <TableRow>
              {[
                { label: '#', align: 'left', width: 56 },
                { label: 'Product', align: 'left' },
                { label: 'Price', align: 'left', width: 140 },
                { label: 'Variant', align: 'left', width: 170 },
                { label: 'SKU', align: 'left', width: 190 },
                ...(section !== 'sports' ? [{ label: 'Customizer', align: 'center', width: 170 }] : []),
                { label: 'Actions', align: 'center', width: 140 },
              ].map((col) => (
                <TableCell
                  key={col.label}
                  align={col.align}
                  sx={{
                    width: col.width,
                    bgcolor: '#f7f9fc',
                    color: '#8496a9',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    py: 1.75,
                    borderBottom: '1px solid #e8edf3 !important',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={section !== "sports" ? 7 : 6} align="center" sx={{ py: 10 }}>
                  <CircularProgress sx={{ color: '#37a6ff' }} />
                </TableCell>
              </TableRow>
            ) : products.map((product, index) => {
              // Same maths the storefront uses (utils/priceUtils.js), so the admin
              // never shows a price the customer would not actually be charged.
              const listPrice = Number(product.standardPrice) || 0;
              const percentOff = Number(product.discountPrice) || 0;
              const finalPrice = percentOff
                ? Math.round((listPrice - (listPrice * percentOff) / 100) * 100) / 100
                : listPrice;

              return (
                <TableRow
                  key={product._id}
                  sx={{
                    '& td': { borderBottom: '1px solid #f1f4f8', py: 1.5 },
                    '&:last-of-type td': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#f9fbfe' },
                    '&:hover .row-actions': { opacity: 1 },
                    transition: 'background-color .16s ease',
                  }}
                >
                  <TableCell sx={{ color: '#aab7c4', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <Avatar
                        variant="rounded"
                        src={uploadUrl(product.frontImage)}
                        sx={{
                          width: 52, height: 52, flexShrink: 0,
                          bgcolor: '#f2f5f9',
                          borderRadius: 2,
                          border: '1px solid #e8edf3',
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#1f2c3d', fontWeight: 600, lineHeight: 1.35,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.name}
                        </Typography>
                        {product.category?.name && (
                          <Typography variant="caption" sx={{ color: '#8496a9', fontWeight: 500 }}>
                            {product.category.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ color: '#1f2c3d', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                      ${finalPrice}
                    </Typography>
                    {percentOff > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#aab7c4', textDecoration: 'line-through' }}>
                          ${listPrice}
                        </Typography>
                        <Box sx={{
                          px: 0.7, py: '1px', borderRadius: 1,
                          bgcolor: 'rgba(76,175,80,.12)', color: '#2e7d32',
                          fontSize: '0.65rem', fontWeight: 800, letterSpacing: '.02em',
                        }}>
                          -{percentOff}%
                        </Box>
                      </Box>
                    )}
                  </TableCell>

                  <TableCell>
                    {product.color?.name && (
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                        px: 1, py: 0.4, mb: 0.6,
                        borderRadius: 5, bgcolor: '#f2f5f9', border: '1px solid #e8edf3',
                      }}>
                        <Box sx={{
                          width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                          bgcolor: product.color?.code || '#ccc',
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.14)',
                        }} />
                        <Typography variant="caption" sx={{ color: '#546274', fontWeight: 600 }}>
                          {product.color.name}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ color: '#8496a9', display: 'block' }}>
                      {product.sizes?.length || 0} sizes
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Tooltip title={`${product.sku || '—'} — click to copy`} placement="top">
                      <Box
                        onClick={() => {
                          if (!product.sku) return;
                          navigator.clipboard?.writeText(product.sku);
                          toast.success('SKU copied');
                        }}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.75, maxWidth: 175,
                          px: 1, py: 0.5, borderRadius: 1.5, cursor: product.sku ? 'pointer' : 'default',
                          bgcolor: '#f7f9fc', border: '1px solid #e8edf3',
                          '&:hover': product.sku ? { borderColor: '#37a6ff', bgcolor: 'rgba(55,166,255,.06)', '& .sku-copy': { opacity: 1 } } : {},
                          transition: 'border-color .16s ease, background-color .16s ease',
                        }}
                      >
                        {/* SKUs here are the product name plus a hash, so they are far
                            too long to show in full — truncate and copy on click. */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.7rem', color: '#546274',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}
                        >
                          {product.sku || '—'}
                        </Typography>
                        <ContentCopy className="sku-copy" sx={{ fontSize: 12, color: '#37a6ff', opacity: 0, transition: 'opacity .16s ease', flexShrink: 0 }} />
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {section !== "sports" && (
                    <TableCell align="center">
                      <Button
                        variant={product.designId ? 'outlined' : 'contained'}
                        size="small"
                        disableElevation
                        startIcon={product.designId ? <Edit sx={{ fontSize: 15 }} /> : <AutoAwesome sx={{ fontSize: 15 }} />}
                        onClick={() => {
                          const baseUrl = CUSTOM_URL;
                          const url = product.designId
                            ? `${baseUrl}/?id=${product.category?.code}&designedit=${product.designId}`
                            : `${baseUrl}/?id=${product.category?.code}&product=${product._id}`;
                          window.location.href = url;
                        }}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          px: 1.5,
                          whiteSpace: 'nowrap',
                          ...(product.designId
                            ? {
                                color: '#546274', borderColor: '#dbe3ec', bgcolor: '#fff',
                                '&:hover': { borderColor: '#37a6ff', color: '#1e88e5', bgcolor: 'rgba(55,166,255,.06)' },
                              }
                            : {
                                bgcolor: '#37a6ff', color: '#fff',
                                '&:hover': { bgcolor: '#1e88e5' },
                              }),
                        }}
                      >
                        {product.designId ? 'Edit Design' : 'Customize'}
                      </Button>
                    </TableCell>
                  )}

                  <TableCell align="center">
                    <Box
                      className="row-actions"
                      sx={{
                        display: 'inline-flex', gap: 0.25, p: 0.4,
                        borderRadius: 2, bgcolor: '#f7f9fc', border: '1px solid #eef2f7',
                        opacity: 0.55, transition: 'opacity .18s ease',
                      }}
                    >
                      <Tooltip title="Edit product">
                        <IconButton size="small" onClick={() => handleEditProduct(product)} sx={{ color: '#546274', '&:hover': { color: '#37a6ff', bgcolor: 'rgba(55,166,255,.1)' } }}>
                          <Edit sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicateProduct(product._id)} sx={{ color: '#546274', '&:hover': { color: '#37a6ff', bgcolor: 'rgba(55,166,255,.1)' } }}>
                          <DifferenceIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteProduct(product._id)} sx={{ color: '#546274', '&:hover': { color: '#ff5252', bgcolor: 'rgba(255,82,82,.1)' } }}>
                          <Delete sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={section !== "sports" ? 7 : 6} align="center" sx={{ py: 9 }}>
                  <Inventory sx={{ fontSize: 52, color: '#dbe3ec', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#8496a9', fontWeight: 600 }}>
                    No products found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#aab7c4' }}>
                    Try clearing the search or filters, or add a new product.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
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
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
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

      {/* Product Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { bgcolor: '#ffffff', borderRadius: 3, color: '#333', maxHeight: 'calc(100vh - 36px)' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' }}>
          {editingProduct ? "Update Product Details" : "Create New Inventory Item"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Product Name" name="name" fullWidth value={newProduct.name} onChange={handleChange} InputLabelProps={inputLabelProps} sx={textFieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="SKU / Internal Code" name="sku" fullWidth value={newProduct.sku} onChange={handleChange} InputLabelProps={inputLabelProps} sx={textFieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink sx={selectLabelSx}>Category</InputLabel>
                    <Select label="Category" name="category" value={newProduct.category} onChange={handleChange} sx={textFieldStyle['& .MuiOutlinedInput-root']}>
                      {categories.map((cat) => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Standard Price ($)" type="number" name="standardPrice" fullWidth value={newProduct.standardPrice} onChange={handleChange} InputLabelProps={inputLabelProps} sx={textFieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Discount (%)" type="number" name="discountPrice" fullWidth value={newProduct.discountPrice} onChange={handleChange} InputLabelProps={inputLabelProps} sx={textFieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink sx={selectLabelSx}>Base Color</InputLabel>
                    <Select label="Base Color" name="color" value={newProduct.color} onChange={handleChange} sx={textFieldStyle['& .MuiOutlinedInput-root']}>
                      {colors.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.code, mr: 1, border: '1px solid #ddd' }} />
                            {c.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink sx={selectLabelSx}>Body Material</InputLabel>
                      <Select label="Body Material" value={newProduct.material?.body} onChange={(e) => handleMaterialBody(e.target.value)} sx={textFieldStyle['& .MuiOutlinedInput-root']}>
                        {materials.map((m) => <MenuItem key={m.name} value={m.name}>{m.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink sx={selectLabelSx}>Sleeves Material</InputLabel>
                      <Select label="Sleeves Material" value={newProduct.material?.sleeves} onChange={(e) => handleMaterialSleeves(e.target.value)} sx={textFieldStyle['& .MuiOutlinedInput-root']}>
                        {materials.map((m) => <MenuItem key={m.name} value={m.name}>{m.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fbff', borderRadius: 2, border: '1px solid #dcefff' }}>
                    <Typography variant="subtitle2" sx={{ color: '#37a6ff', fontWeight: 'bold', mb: 2 }}>
                      Search Engine Metadata
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Meta Title"
                          name="metaTitle"
                          fullWidth
                          value={newProduct.metaTitle || ""}
                          onChange={handleChange}
                          InputLabelProps={inputLabelProps}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Meta Description"
                          name="metaDescription"
                          fullWidth
                          multiline
                          minRows={3}
                          value={newProduct.metaDescription || ""}
                          onChange={handleChange}
                          InputLabelProps={inputLabelProps}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Image Alt Text"
                          name="imageAlt"
                          fullWidth
                          value={newProduct.imageAlt || ""}
                          onChange={handleChange}
                          InputLabelProps={inputLabelProps}
                          sx={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Images Sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 2 }}>Product Images</Typography>

                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ color: '#37a6ff', borderColor: '#37a6ff', mb: 2, textTransform: 'none', fontWeight: 'bold' }}>
                  Upload Front Image
                  <input type="file" hidden accept="image/*" onChange={handleFrontImageChange} />
                </Button>
                {previewImage && (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img src={uploadUrl(previewImage)} alt="front" style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #ddd', bgcolor: '#fff' }} />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Button variant="outlined" component="label" fullWidth startIcon={<Add />} sx={{ color: '#999', borderColor: '#ddd', textTransform: 'none', borderStyle: 'dashed' }}>
                  Add Variant Images
                  <input type="file" hidden multiple accept="image/*" onChange={handleOtherImagesChange} />
                </Button>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {otherImagesPreview.map((img, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      <img src={uploadUrl(img)} alt="variant" style={{ width: 45, height: 45, borderRadius: 4, objectFit: 'cover', border: '1px solid #eee' }} />
                      <IconButton size="small" onClick={() => handleRemoveOtherImage(idx)} sx={{ position: 'absolute', top: -5, right: -5, p: 0.2, bgcolor: 'rgba(255,255,255,0.8)', color: '#ff5252', '&:hover': { bgcolor: '#fff' } }}>
                        <Delete sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Sizes Table */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#37a6ff', fontWeight: 'bold' }}>Available Sizes & Custom Pricing</Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddSize} sx={{ color: '#37a6ff', textTransform: 'none', fontWeight: 'bold' }}>Add Size Row</Button>
                </Box>
                <Grid container spacing={2}>
                  {newProduct.sizes.map((s, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Select size="small" value={s.size} onChange={(e) => handleSizeChange(idx, "size", e.target.value)} sx={{ ...textFieldStyle['& .MuiOutlinedInput-root'], minWidth: 80 }}>
                          {sizes.map((opt) => <MenuItem key={opt.size} value={opt.size}>{opt.size}</MenuItem>)}
                        </Select>
                        <TextField size="small" placeholder="Price" value={s.price} onChange={(e) => handleSizeChange(idx, "price", e.target.value)} sx={textFieldStyle} />
                        <IconButton size="small" onClick={() => {
                          const updated = newProduct.sizes.filter((_, i) => i !== idx);
                          setNewProduct(prev => ({ ...prev, sizes: updated }));
                        }} sx={{ color: '#ff5252' }}><Delete fontSize="inherit" /></IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Product Content */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Product Content</Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#fff',
                }}
              >
                <Tabs
                  value={editorTab}
                  onChange={(_, value) => setEditorTab(value)}
                  sx={{
                    minHeight: 42,
                    borderBottom: '1px solid #ddd',
                    bgcolor: '#f8f9fa',
                    '& .MuiTab-root': {
                      minHeight: 42,
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#666',
                    },
                    '& .Mui-selected': {
                      color: '#37a6ff !important',
                    },
                    '& .MuiTabs-indicator': {
                      bgcolor: '#37a6ff',
                    },
                  }}
                >
                  <Tab value="description" label="Product Description" />
                  <Tab value="careInstructions" label="Care Instructions" />
                </Tabs>
                <Box
                  sx={{
                  '& .rsw-toolbar': {
                    flexWrap: 'wrap',
                    borderBottom: '1px solid #ddd',
                  },
                  '& .rsw-ce': {
                    minHeight: 150,
                    p: 1.5,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }
                  }}
                >
                  {editorTab === "description" ? (
                    <Editor name="description" value={newProduct.description} onChange={handleChange} />
                  ) : (
                    <Editor name="careInstructions" value={newProduct.careInstructions || ""} onChange={handleChange} />
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee', bgcolor: '#fff' }}>
          <Button onClick={handleClose} sx={{ color: '#999', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            disabled={isLoading}
            startIcon={!isLoading && <CheckCircle />}
            sx={{
              bgcolor: '#37a6ff',
              color: 'white',
              '&:hover': { bgcolor: '#1e88e5' },
              px: 4,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (editingProduct ? "Update Product" : "Publish to Catalog")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;
