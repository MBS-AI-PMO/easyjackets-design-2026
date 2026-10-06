import React from 'react';
import { Alert, Box, Button } from '@mui/material';

// One admin screen that fails to draw (e.g. an order with a damaged design) shows this message instead
// of blanking the whole admin; the menu keeps working. Pages/DashboardAdmin.js wraps every screen; a new
// screen starts fresh (`key` is the address).
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('An admin screen failed to draw:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" onClick={() => window.location.reload()}>Reload</Button>}>
          This screen could not be shown, probably because some of its data is damaged. Other screens still work.
        </Alert>
      </Box>
    );
  }
}

export default PageErrorBoundary;
