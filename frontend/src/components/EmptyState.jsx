import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';

const EmptyState = ({
  title = 'No posts yet',
  description = 'Be the first one to share an update, photo, or thought with the community!',
  actionText,
  onAction
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        border: '1px dashed #cbd5e1',
        my: 3
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'primary.main'
        }}
      >
        <DynamicFeedIcon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 400, mx: 'auto', mb: actionText ? 2.5 : 0 }}
      >
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ mt: 1 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
