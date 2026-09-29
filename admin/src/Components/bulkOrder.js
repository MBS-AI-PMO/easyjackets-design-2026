import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Avatar,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import {
  ArrowBack,
  ReceiptLong,
  History
} from '@mui/icons-material';
import moment from "moment";
import instance from '../constant/instance';
import { useParams, useNavigate } from 'react-router-dom';

import { uploadUrl } from '../constant/url';
const BulkOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});

  const getOrderDetails = useCallback(async () => {
    try {
      const { data } = await instance.get(`/order/bulk/${id}`);
      setData(data.bulkorder);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  }, [id]);

  const formatDesignLocations = (designLocations) => {
    if (!designLocations) return 'None';
    return Object.keys(designLocations)
      .filter(location => designLocations[location])
      .join(', ');
  };

  useEffect(() => {
    getOrderDetails();
  }, [getOrderDetails]);

  const detailItem = (label, value, isLink = false) => (
    <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.05)' } }}>
      <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: '1px solid #eee', width: '30%' }}>{label}</TableCell>
      <TableCell sx={{ color: '#333', borderBottom: '1px solid #eee' }}>
        {isLink ? (
          <a href={`mailto:${value}`} style={{ color: '#37a6ff', textDecoration: 'none' }}>{value}</a>
        ) : (value?.toString() || 'N/A')}
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

      {/* Header Card */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(55, 166, 255, 0.2)',
        }}
      >
        <CardContent sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">Inquiry Details</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Viewing bulk order request from {data.name}</Typography>
            </Box>
          </Box>
          <ReceiptLong sx={{ fontSize: 48, opacity: 0.5 }} />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Table>
              <TableBody>
                {detailItem("Customer Name", data.name)}
                {detailItem("Email Address", data.email, true)}
                {detailItem("Phone Number", data.phone)}
                {data.country ? detailItem("Country", data.country) : null}
                {data.organization ? detailItem("Organisation", `${data.organization}${data.orderType ? ` (${data.orderType})` : ''}`) : null}
                {data.quantityRange ? detailItem("Quantity Range", `${data.quantityRange} jackets`) : null}
                {data.neededBy ? detailItem("Needed By", moment(data.neededBy).isValid() ? moment(data.neededBy).format('MMMM D, YYYY') : data.neededBy) : null}
                {data.budget ? detailItem("Budget per Jacket", data.budget) : null}
                <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' }}>Message / Inquiry</TableCell>
                  <TableCell sx={{ color: '#333', borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 2, borderRadius: 1, border: '1px solid #eee' }}>
                      {data.message || 'No additional message.'}
                    </Typography>
                  </TableCell>
                </TableRow>
                {detailItem("Selected Product", data.selectedProduct)}
                {detailItem("Quantity Requested", data.quantity)}
                {detailItem("Selected Lining", data.selectedLining)}
                {detailItem("Zipout Lining", data.zipoutLining ? 'Included' : 'Not Requested')}
                {detailItem("Closure Type", data.selectedClosure)}
                {detailItem("Flap Closure", data.flapClosure ? 'Yes' : 'No')}
                <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' }}>Design Locations</TableCell>
                  <TableCell sx={{ color: '#333', borderBottom: '1px solid #eee' }}>
                    {formatDesignLocations(data.designLocations).split(', ').map(loc => (
                      <Chip key={loc} label={loc} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#37a6ff', color: 'white' }} />
                    ))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: 'none' }}>Reference Date</TableCell>
                  <TableCell sx={{ color: '#888', borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <History fontSize="small" />
                      {moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'white', borderRadius: 2, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 'bold' }}>Attached Images</Typography>
              <Divider sx={{ bgcolor: '#eee', mb: 3 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {data.images && data.images.length > 0 ? (
                  data.images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative', width: 'calc(50% - 8px)' }}>
                      <a href={image} target="_blank" rel="noopener noreferrer">
                        <Avatar
                          variant="rounded"
                          src={uploadUrl(image)}
                          sx={{
                            width: '100%',
                            height: 120,
                            borderRadius: 2,
                            border: '2px solid #eee',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)', borderColor: '#37a6ff' }
                          }}
                        />
                      </a>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ py: 4, width: '100%', textAlign: 'center', color: '#999' }}>
                    <Typography>No reference images provided.</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BulkOrder;
