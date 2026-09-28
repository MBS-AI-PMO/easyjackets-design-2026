import React, { useState, useEffect } from 'react';
import {
  TextField, Switch, Button, Typography, Grid, Box,
  Card, CardContent, FormControlLabel, CircularProgress, Tabs, Tab, Chip
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ShareIcon from '@mui/icons-material/Share';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import instance from '../constant/instance';
import { toast } from 'react-toastify';
import SiteTagsManager from './SiteTagsManager';

const WebsiteDetails = () => {
  const [contactDetails, setContactDetails] = useState({
    phoneNumber: '',
    email: '',
    address: '',
    address1: ''
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  });

  const [isActive, setIsActive] = useState({
    facebook: true,
    twitter: true,
    instagram: true,
    linkedin: true
  });

  const [checkoutSettings, setCheckoutSettings] = useState({
    cod: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await instance.get('/features/website/details');
        const data = response.data.website;

        if (data) {
          setContactDetails({
            phoneNumber: data.phoneNumber || '',
            email: data.email || '',
            address: data.address || '',
            address1: data.address1 || ''
          });

          setSocialLinks({
            facebook: data.socialLinks?.facebook || '',
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
            linkedin: data.socialLinks?.linkedin || ''
          });

          setIsActive({
            facebook: data.isActive?.facebook ?? true,
            twitter: data.isActive?.twitter ?? true,
            instagram: data.isActive?.instagram ?? true,
            linkedin: data.isActive?.linkedin ?? true
          });

          setCheckoutSettings({
            cod: data.checkout?.cod ?? false
          });
        }
      } catch (error) {
        console.error('Error fetching contact details:', error);
        toast.error('Error loading website details');
      }
    };

    fetchContactDetails();
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value
    }));
  };

  const handleActiveChange = (e) => {
    const { name, checked } = e.target;
    setIsActive((prevState) => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleCheckoutChange = (e) => {
    const { name, checked } = e.target;
    setCheckoutSettings((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...contactDetails,
        ...contactDetails,
        socialLinks,
        isActive,
        checkout: checkoutSettings
      };
      await instance.put('/features/website/details', updatedData);
      toast.success('Website details updated successfully');
    } catch (error) {
      console.error('Error updating contact details:', error);
      toast.error('Error updating website details');
    } finally {
      setIsLoading(false);
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
    '& .Mui-disabled': {
      color: '#999',
      WebkitTextFillColor: '#999',
      bgcolor: '#f8f9fa'
    }
  };

  const sectionCardSx = {
    bgcolor: '#ffffff',
    borderRadius: 3,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
  };

  const renderSaveButton = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
        sx={{
          bgcolor: '#37a6ff',
          color: 'white',
          '&:hover': { bgcolor: '#1e88e5' },
          px: 8,
          py: 2,
          borderRadius: 2,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)',
          textTransform: 'none'
        }}
      >
        {isLoading ? 'Saving Changes...' : 'Save Website Details'}
      </Button>
    </Box>
  );

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
              <PublicIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Website Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage contact info and social media profiles
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ ...sectionCardSx, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              minHeight: 58,
              '& .MuiTabs-indicator': { bgcolor: '#37a6ff', height: 3 },
              '& .MuiTab-root': {
                minHeight: 58,
                textTransform: 'none',
                fontWeight: 700,
                color: '#333',
                mr: 1.5,
                px: 2,
              },
              '& .Mui-selected': { color: '#1e88e5 !important' },
            }}
          >
            <Tab
              icon={<ContactPhoneIcon fontSize="small" sx={{ color: activeTab === 0 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Contact Information
                  <Chip label="4 fields" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
            <Tab
              icon={<ShoppingCartIcon fontSize="small" sx={{ color: activeTab === 1 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Checkout Settings
                  <Chip label="1 setting" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
            <Tab
              icon={<ShareIcon fontSize="small" sx={{ color: activeTab === 2 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Social Media Profiles
                  <Chip label="4 links" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
            <Tab
              icon={<PublicIcon fontSize="small" sx={{ color: activeTab === 3 ? '#1e88e5' : '#555' }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Site Tags
                  <Chip label="Manage" size="small" sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 'bold', borderRadius: '6px' }} />
                </Box>
              }
            />
          </Tabs>
        </CardContent>
      </Card>

      {activeTab === 0 && (
        <>
          <Card sx={sectionCardSx}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ContactPhoneIcon sx={{ color: '#37a6ff' }} />
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Contact Information</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={contactDetails.phoneNumber}
                    onChange={handleContactChange}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={contactDetails.email}
                    onChange={handleContactChange}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Primary Address"
                    name="address"
                    value={contactDetails.address}
                    onChange={handleContactChange}
                    multiline
                    rows={3}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Secondary Address (Optional)"
                    name="address1"
                    value={contactDetails.address1}
                    onChange={handleContactChange}
                    multiline
                    rows={3}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {renderSaveButton()}
        </>
      )}

      {activeTab === 1 && (
        <>
          <Card sx={sectionCardSx}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShoppingCartIcon sx={{ color: '#37a6ff' }} />
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Checkout Settings</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 'bold' }}>
                          Cash on Delivery (COD)
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Enable or disable COD option at checkout
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={checkoutSettings.cod}
                            onChange={handleCheckoutChange}
                            name="cod"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#37a6ff' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#37a6ff' }
                            }}
                          />
                        }
                        label={<Typography variant="caption" sx={{ color: '#666' }}>{checkoutSettings.cod ? 'Enabled' : 'Disabled'}</Typography>}
                        labelPlacement="start"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {renderSaveButton()}
        </>
      )}

      {activeTab === 2 && (
        <>
          <Card sx={sectionCardSx}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShareIcon sx={{ color: '#37a6ff' }} />
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>Social Media Profiles</Typography>
              </Box>

              <Grid container spacing={3}>
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                  <Grid item xs={12} key={platform}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {platform}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isActive[platform]}
                              onChange={handleActiveChange}
                              name={platform}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#37a6ff' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#37a6ff' }
                              }}
                            />
                          }
                          label={<Typography variant="caption" sx={{ color: '#666' }}>Active</Typography>}
                          labelPlacement="start"
                        />
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                        name={platform}
                        value={socialLinks[platform]}
                        onChange={handleSocialLinkChange}
                        disabled={!isActive[platform]}
                        sx={textFieldStyle}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          {renderSaveButton()}
        </>
      )}

      {activeTab === 3 && (
        <Card sx={sectionCardSx}>
            <CardContent sx={{ p: 4 }}>
              <SiteTagsManager />
            </CardContent>
          </Card>
      )}
    </Box>
  );
};

export default WebsiteDetails;
