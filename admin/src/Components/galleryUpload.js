import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Divider,
    Paper,
    FormControlLabel,
    Switch
} from "@mui/material";
import { Delete, PhotoLibrary, CloudUpload, Collections, Edit } from "@mui/icons-material";
import fileInstance from "../constant/filesInstance";
import instance from "../constant/instance";
import { toast } from 'react-toastify';

import { uploadUrl } from '../constant/url';
/**
 * A photo collection screen. With no props it is the Photo Gallery; the
 * Embroidery & Patches screen reuses it with its own endpoint, wording and a
 * set of technique tags each photo can carry (the storefront filters on them).
 */
function GalleryUpload({
    endpoint = '/gallery',
    title = 'Photo Gallery',
    subtitle = 'Manage website gallery images and descriptions',
    itemNoun = 'Gallery Image',
    tagOptions = null,
}) {
    const [images, setImages] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    const [newImage, setNewImage] = useState({
        images: [],
        description: "",
        tags: [],
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [editImage, setEditImage] = useState({
        images: [],
        existingImageUrls: [],
        description: "",
        tags: [],
        isActive: true,
    });

    const toggleTag = (setter) => (tag) => setter((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

    // the tag choices: the defaults, every tag already used (from the server), and new ones typed here
    const [extraTags, setExtraTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const allTags = tagOptions ? [...new Set([...tagOptions, ...extraTags])] : [];
    const addTag = (selected, onToggle) => {
        const typed = newTag.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
        if (!typed) return;
        const existing = allTags.find((t) => t.toLowerCase() === typed.toLowerCase());
        const tag = existing || typed;
        if (!existing) setExtraTags((list) => [...list, tag]);
        if (!selected.includes(tag)) onToggle(tag);
        setNewTag('');
    };

    const renderTagPicker = (selected, onToggle) => tagOptions && (
        <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ color: '#555', mb: 1, fontWeight: 700 }}>
                What the photo shows (the site's filter chips)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allTags.map((tag) => {
                    const on = selected.includes(tag);
                    return (
                        <Chip
                            key={tag}
                            label={tag}
                            clickable
                            onClick={() => onToggle(tag)}
                            variant={on ? 'filled' : 'outlined'}
                            sx={on
                                ? { bgcolor: '#37a6ff', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#1e88e5' } }
                                : { borderColor: '#cfd8e3', color: '#475569', fontWeight: 600 }}
                        />
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center', maxWidth: 420 }}>
                <TextField
                    size="small"
                    fullWidth
                    label="Add a new tag"
                    placeholder="e.g. Sequins"
                    value={newTag}
                    inputProps={{ maxLength: 32 }}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(selected, onToggle); } }}
                />
                <Button variant="outlined" onClick={() => addTag(selected, onToggle)} disabled={!newTag.trim()} sx={{ whiteSpace: 'nowrap' }}>
                    Add tag
                </Button>
            </Box>
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 0.5 }}>
                A new tag becomes a filter chip on the site once a visible photo carries it.
            </Typography>
        </Grid>
    );
    const [editPreviewImages, setEditPreviewImages] = useState([]);
    const [editNewPreviewImages, setEditNewPreviewImages] = useState([]);

    const handleClickOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setNewImage({
            images: [],
            description: "",
            tags: [],
        });
        setPreviewImages([]);
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            if (!validateImages(selectedFiles)) return;

            setNewImage((prev) => ({ ...prev, images: selectedFiles }));
            readImagePreviews(selectedFiles, setPreviewImages);
        }
    };

    const handleDescriptionChange = (e) => {
        setNewImage((prev) => ({ ...prev, description: e.target.value }));
    };

    const readImagePreviews = (files, setter) => {
        Promise.all(files.map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }))).then(setter);
    };

    const validateImages = (files) => {
        if (files.some((file) => !file.type.startsWith('image/'))) {
            toast.error("Only image files are allowed. They will be converted to optimized WebP.");
            return false;
        }
        return true;
    };

    const handleUploadImage = async () => {
        if (newImage.images.length === 0) {
            toast.error("Please select at least one image");
            return;
        }

        if (!newImage.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        setUploadLoading(true);

        const formData = new FormData();
        newImage.images.forEach((image) => formData.append('image', image));
        formData.append('description', newImage.description);
        if (tagOptions) formData.append('tags', JSON.stringify(newImage.tags));

        try {
            await fileInstance.post(endpoint, formData);
            toast.success("Image uploaded successfully!");
            handleClose();
            fetchGalleryImages();
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error?.response?.data?.message || "Error uploading image");
        } finally {
            setUploadLoading(false);
        }
    };

    const handleEditOpen = (image) => {
        setEditingImage(image);
        setEditImage({
            images: [],
            existingImageUrls: getGalleryItemImages(image),
            description: image.description || "",
            tags: Array.isArray(image.tags) ? image.tags : [],
            isActive: image.isActive !== false,
        });
        setEditPreviewImages(getGalleryItemImages(image));
        setEditNewPreviewImages([]);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setEditingImage(null);
        setEditImage({ images: [], existingImageUrls: [], description: "", tags: [], isActive: true });
        setEditPreviewImages([]);
        setEditNewPreviewImages([]);
    };

    const handleEditImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;
        if (!validateImages(selectedFiles)) return;

        const nextFiles = [...editImage.images, ...selectedFiles];
        setEditImage((prev) => ({ ...prev, images: nextFiles }));
        Promise.all(selectedFiles.map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }))).then((newPreviews) => {
            const nextNewPreviews = [...editNewPreviewImages, ...newPreviews];
            setEditNewPreviewImages(nextNewPreviews);
            setEditPreviewImages([...editImage.existingImageUrls, ...nextNewPreviews]);
        });
    };

    const handleRemoveEditPreview = (index) => {
        const existingCount = editImage.existingImageUrls.length;

        if (index < existingCount) {
            const nextExistingUrls = editImage.existingImageUrls.filter((_, i) => i !== index);
            setEditImage((prev) => ({ ...prev, existingImageUrls: nextExistingUrls }));
            setEditPreviewImages([...nextExistingUrls, ...editNewPreviewImages]);
            return;
        }

        const newIndex = index - existingCount;
        const nextFiles = editImage.images.filter((_, i) => i !== newIndex);
        const nextNewPreviews = editNewPreviewImages.filter((_, i) => i !== newIndex);
        setEditImage((prev) => ({ ...prev, images: nextFiles }));
        setEditNewPreviewImages(nextNewPreviews);
        setEditPreviewImages([...editImage.existingImageUrls, ...nextNewPreviews]);
    };

    const handleUpdateImage = async () => {
        if (!editingImage) return;

        if (!editImage.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        if (editImage.existingImageUrls.length + editImage.images.length === 0) {
            toast.error("Please keep at least one image in this gallery item");
            return;
        }

        setUploadLoading(true);

        const formData = new FormData();
        formData.append('description', editImage.description);
        formData.append('isActive', String(editImage.isActive));
        formData.append('keepImageUrls', JSON.stringify(editImage.existingImageUrls));
        formData.append('appendImages', 'true');
        if (tagOptions) formData.append('tags', JSON.stringify(editImage.tags));
        editImage.images.forEach((image) => formData.append('image', image));

        try {
            await fileInstance.put(`${endpoint}/${editingImage._id}`, formData);
            toast.success("Gallery item updated successfully");
            handleEditClose();
            fetchGalleryImages();
        } catch (error) {
            console.error("Error updating image:", error);
            toast.error(error?.response?.data?.message || "Error updating gallery item");
        } finally {
            setUploadLoading(false);
        }
    };

    // Delete removes the item for good (the plain DELETE only marked it Inactive, so it stayed in
    // this list). To hide an item from the site without deleting it, edit it and set it Inactive.
    // The image files stay in storage: another item (e.g. an Embroidery & Patches photo) may use them.
    const handleDeleteImage = async (id) => {
        if (!window.confirm("Delete this photo permanently?\n\nTo only hide it from the site, edit it and switch it to Inactive instead.")) {
            return;
        }

        try {
            await instance.delete(`${endpoint}/permanent/${id}`);
            toast.success("Photo deleted");
            fetchGalleryImages();
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Error deleting image");
        }
    };

    const fetchGalleryImages = async () => {
        setLoading(true);
        try {
            const { data } = await instance.get(`${endpoint}/all`);
            setImages(data.data || []);
            if (tagOptions && Array.isArray(data.tags)) setExtraTags((list) => [...new Set([...data.tags.filter((t) => !tagOptions.includes(t)), ...list])]);
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            toast.error("Error fetching images");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleryImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint]);

    const getGalleryItemImages = (item) => {
        const urls = Array.isArray(item?.imageUrls) && item.imageUrls.length > 0
            ? item.imageUrls
            : [item?.imageUrl];

        return urls.filter(Boolean);
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
            '&.Mui-focused': { color: '#37a6ff' },
        },
        '& .MuiOutlinedInput-input': { color: '#333' },
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
                                <Collections sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {title}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {subtitle}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<CloudUpload />}
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
                            Upload {itemNoun}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                    Gallery Items
                </Typography>
                <Chip
                    label={`${images.length} photos`}
                    size="small"
                    sx={{ bgcolor: 'rgba(55, 166, 255, 0.1)', color: '#37a6ff', fontWeight: 'bold' }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: '#37a6ff' }} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {images.map((image) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={image._id}>
                            <Card sx={{
                                bgcolor: '#ffffff',
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderColor: '#37a6ff' }
                            }}>
                                <Box sx={{
                                    height: 200,
                                    display: 'grid',
                                    gridAutoFlow: 'column',
                                    gridAutoColumns: 'minmax(0, 1fr)',
                                    overflow: 'hidden',
                                    bgcolor: '#f8f9fa'
                                }}>
                                    {getGalleryItemImages(image).map((url, imageIndex) => (
                                        <CardMedia
                                            key={`${image._id}-${url}-${imageIndex}`}
                                            component="img"
                                            image={uploadUrl(url)}
                                            alt={image.description || `Gallery image ${imageIndex + 1}`}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', minWidth: 0 }}
                                        />
                                    ))}
                                </Box>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mb: 1, minHeight: '40px' }} noWrap>
                                        {image.description}
                                    </Typography>
                                    {Array.isArray(image.tags) && image.tags.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                            {image.tags.map((tag) => (
                                                <Chip key={tag} label={tag} size="small"
                                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#e0f2fe', color: '#075985' }} />
                                            ))}
                                        </Box>
                                    )}
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                                                {new Date(image.createdAt).toLocaleDateString()}
                                            </Typography>
                                            <Chip
                                                label={image.isActive ? "Active" : "Inactive"}
                                                size="small"
                                                sx={{
                                                    height: '18px',
                                                    fontSize: '0.65rem',
                                                    bgcolor: image.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                                                    color: image.isActive ? '#4caf50' : '#ff5252',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                sx={{ color: '#37a6ff', '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.05)' } }}
                                                onClick={() => handleEditOpen(image)}
                                                size="small"
                                                aria-label="Edit gallery item"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                sx={{ color: '#ff5252', '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.05)' } }}
                                                onClick={() => handleDeleteImage(image._id)}
                                                size="small"
                                                aria-label="Delete gallery item"
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {images.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ py: 10, textAlign: 'center', color: '#999', borderRadius: 3, bgcolor: '#ffffff', border: '1px dashed #ddd' }}>
                                <PhotoLibrary sx={{ fontSize: 64, mb: 2, opacity: 0.1 }} />
                                <Typography variant="h6">No Gallery Images Found</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Upload Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: '#ffffff', borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 2
                }}>
                    Upload New {itemNoun}
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<CloudUpload />}
                                sx={{
                                    color: '#37a6ff',
                                    borderColor: '#37a6ff',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' },
                                    py: 2,
                                    borderStyle: previewImages.length > 0 ? 'solid' : 'dashed',
                                    borderRadius: 2
                                }}
                            >
                                {previewImages.length > 0 ? `Change Images (${previewImages.length})` : 'Select Gallery Images'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Grid>

                        {previewImages.length > 0 && (
                            <Grid item xs={12}>
                                <Box sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #ddd',
                                    bgcolor: '#f8f9fa',
                                    p: 1,
                                    display: 'grid',
                                    gridAutoFlow: 'column',
                                    gridAutoColumns: 'minmax(0, 1fr)',
                                    gap: 1,
                                    height: 'min(60vh, 520px)'
                                }}>
                                    {previewImages.map((previewImage, index) => (
                                        <img
                                            key={`${previewImage}-${index}`}
                                            src={uploadUrl(previewImage)}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                display: 'block',
                                                borderRadius: 8,
                                                minWidth: 0,
                                                background: '#fff'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                label="Image Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={newImage.description}
                                onChange={handleDescriptionChange}
                                placeholder="Describe this photo for your users..."
                                sx={textFieldStyle}
                            />
                        </Grid>
                        {renderTagPicker(newImage.tags, toggleTag(setNewImage))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={handleClose} sx={{ color: '#888', textTransform: 'none' }} disabled={uploadLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUploadImage}
                        variant="contained"
                        disabled={uploadLoading}
                        sx={{
                            bgcolor: '#37a6ff',
                            color: 'white',
                            '&:hover': { bgcolor: '#1e88e5' },
                            px: 6,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                        }}
                    >
                        {uploadLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Upload to Gallery"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editOpen}
                onClose={handleEditClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: '#ffffff', borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 2
                }}>
                    Edit Gallery Item
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<CloudUpload />}
                                sx={{
                                    color: '#37a6ff',
                                    borderColor: '#37a6ff',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' },
                                    py: 2,
                                    borderRadius: 2
                                }}
                            >
                                Add One or Multiple Images
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleEditImageChange}
                                />
                            </Button>
                        </Grid>

                        {editPreviewImages.length > 0 && (
                            <Grid item xs={12}>
                                <Box sx={{
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #ddd',
                                    bgcolor: '#fff',
                                    display: 'grid',
                                    gridAutoFlow: 'column',
                                    gridAutoColumns: 'minmax(0, 1fr)',
                                    aspectRatio: '1 / 1',
                                    width: '100%'
                                }}>
                                    {editPreviewImages.map((previewImage, index) => (
                                        <Box
                                            key={`${previewImage}-${index}`}
                                            sx={{
                                                position: 'relative',
                                                minWidth: 0,
                                                height: '100%',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                bgcolor: '#fff'
                                            }}
                                        >
                                            <img
                                                src={uploadUrl(previewImage)}
                                                alt={`Edit preview ${index + 1}`}
                                                style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                display: 'block'
                                            }}
                                        />
                                            <IconButton
                                                size="small"
                                                aria-label="Remove image from gallery item"
                                                onClick={() => handleRemoveEditPreview(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    width: 30,
                                                    height: 30,
                                                    bgcolor: 'rgba(255,255,255,0.92)',
                                                    color: '#ff5252',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                                                    '&:hover': { bgcolor: '#fff' }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    {editImage.description && (
                                        <Box sx={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            px: 2,
                                            py: 1.75,
                                            background: 'linear-gradient(to top, rgba(20,18,16,.74), rgba(20,18,16,.38), transparent)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: 15,
                                            lineHeight: 1.35,
                                            textAlign: 'center',
                                            textShadow: '0 2px 12px rgba(0,0,0,.45)',
                                            pointerEvents: 'none',
                                            zIndex: 1
                                        }}>
                                            {editImage.description}
                                        </Box>
                                    )}
                                </Box>
                                {editImage.images.length > 0 && (
                                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                                        {editImage.images.length} new image{editImage.images.length > 1 ? 's' : ''} will be added to this gallery box.
                                    </Typography>
                                )}
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                label="Image Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={editImage.description}
                                onChange={(e) => setEditImage((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe this photo for your users..."
                                sx={textFieldStyle}
                            />
                        </Grid>
                        {renderTagPicker(editImage.tags, toggleTag(setEditImage))}

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editImage.isActive}
                                        onChange={(e) => setEditImage((prev) => ({ ...prev, isActive: e.target.checked }))}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#37a6ff' },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#37a6ff' },
                                        }}
                                    />
                                }
                                label={editImage.isActive ? 'Active on website' : 'Hidden from website'}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={handleEditClose} sx={{ color: '#888', textTransform: 'none' }} disabled={uploadLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateImage}
                        variant="contained"
                        disabled={uploadLoading}
                        sx={{
                            bgcolor: '#37a6ff',
                            color: 'white',
                            '&:hover': { bgcolor: '#1e88e5' },
                            px: 6,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                        }}
                    >
                        {uploadLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GalleryUpload;
