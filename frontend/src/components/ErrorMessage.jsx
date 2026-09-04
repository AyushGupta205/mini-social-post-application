import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

const ErrorMessage = ({
  title = 'Error',
  message,
  onRetry,
  severity = 'error',
  sx = {}
}) => {
  if (!message) return null;

  return (
    <Box sx={{ my: 2, ...sx }}>
      <Alert
        severity={severity}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
        sx={{ borderRadius: 3 }}
      >
        {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
