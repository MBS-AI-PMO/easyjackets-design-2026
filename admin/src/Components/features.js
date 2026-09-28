import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import fileInstance from '../constant/filesInstance';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

function FeatureForm() {
  const [reviews, setReviews] = useState([{ comment: "", author: "" }]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getFeature();
  }, []);

  const getFeature = async () => {
    try {
      const response = await instance.get("/features");
      const feature = response.data.features[0];

      if (feature) {
        setReviews(feature.review || [{ comment: "", author: "" }]);
        setExistingImageUrls(feature.banner || []);
      }
    } catch (error) {
      console.error("Error fetching feature:", error);
      toast.error("Error loading feature data.");
    }
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);
    setImagePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
  };

  const handleReviewChange = (index, field, value) => {
    const updatedReviews = [...reviews];
    updatedReviews[index][field] = value;
    setReviews(updatedReviews);
  };

  const addReview = () => {
    setReviews([...reviews, { comment: "", author: "" }]);
  };

  const removeReview = (index) => {
    setReviews(reviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("review", JSON.stringify(reviews));
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await fileInstance.post("/features", formData);
      toast.success("Features updated successfully!");
      setIsLoading(false);
      getFeature();
    } catch (error) {
      toast.error("Error updating features.");
      setIsLoading(false);
      console.error("Error:", error);
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <StarIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Feature Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Update homepage banners and customer reviews
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Reviews Section */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Customer Reviews</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addReview}
                    sx={{
                      bgcolor: '#37a6ff',
                      color: 'white',
                      '&:hover': { bgcolor: '#1e88e5' },
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)',
                      textTransform: 'none'
                    }}
                  >
                    Add Review
                  </Button>
                </Box>

                {reviews.map((review, index) => (
                  <Box key={index} sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, position: 'relative', border: '1px solid #eee' }}>
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, color: '#ff5252' }}
                      onClick={() => removeReview(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label={`Review #${index + 1} Comment`}
                          fullWidth
                          multiline
                          rows={4}
                          value={review.comment}
                          onChange={(e) => handleReviewChange(index, "comment", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Author Name"
                          fullWidth
                          value={review.author}
                          onChange={(e) => handleReviewChange(index, "author", e.target.value)}
                          sx={textFieldStyle}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Banner Section */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', mb: 3 }}>Homepage Banners</Typography>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    color: '#37a6ff',
                    borderColor: '#37a6ff',
                    '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' },
                    py: 1.5,
                    borderRadius: 2,
                    mb: 3,
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  Upload New Banners
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                </Button>

                {/* Previews Grid */}
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Existing & New Banners</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* Existing */}
                  {existingImageUrls.map((src, index) => (
                    <Grid item xs={6} key={`ext-${index}`}>
                      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', bgcolor: '#eee' }}>
                        <img src={src} alt="banner" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', color: '#ff5252', '&:hover': { bgcolor: 'white' } }}
                          onClick={() => removeExistingImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  {/* New Previews */}
                  {imagePreviews.map((src, index) => (
                    <Grid item xs={6} key={`new-${index}`}>
                      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '2px dashed #37a6ff', bgcolor: '#f0faff' }}>
                        <img src={src} alt="new" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', color: '#ff5252', '&:hover': { bgcolor: 'white' } }}
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                bgcolor: '#37a6ff',
                color: 'white',
                '&:hover': { bgcolor: '#1e88e5' },
                py: 2,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 8px 16px rgba(55, 166, 255, 0.2)',
                textTransform: 'none'
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Save Changes"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default FeatureForm;
