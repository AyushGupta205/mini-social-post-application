import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
    >
      <CircularProgress size={38} thickness={4} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
