import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, IconButton, Typography } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const DesignBulkModal = ({ open, onClose, order }) => {
  const renderStatusIcon = (status) => {
    return status ? (
      <CheckCircle sx={{ color: 'green' }} />
    ) : (
      <Cancel sx={{ color: 'red' }} />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Order Details - {order.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {Object.keys(order.designLocations).map((location, index) => (
            <Grid item xs={6} key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ flexGrow: 1, textTransform: 'capitalize' }}>
                {location.replace(/([A-Z])/g, ' $1').toLowerCase()} {/* Make camelCase more readable */}
              </Typography>
              <IconButton>{renderStatusIcon(order.designLocations[location])}</IconButton>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
       
      </DialogActions>
    </Dialog>
  );
};

export default DesignBulkModal;
