import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
          py: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          component={RouterLink}
          to="/social"
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Back to Feed
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
