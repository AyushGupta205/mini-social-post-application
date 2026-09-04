import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { getInitials, stringToColor } from '../utils/avatarHelper';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setError(null);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setText('');
    handleRemoveImage();
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();

    // Validate: At least one of text or image must be provided
    if (!trimmedText && !selectedImage) {
      setError('Please add some text or an image before posting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (trimmedText) {
        formData.append('text', trimmedText);
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await postService.createPost(formData);
      if (response.success && response.post) {
        handleReset();
        if (onPostCreated) {
          onPostCreated(response.post);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create post. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostEmpty = !text.trim() && !selectedImage;

  return (
    <Card
      sx={{
        borderRadius: 4,
        mb: 3,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        background: '#ffffff'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* User Info Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: stringToColor(user?.username || 'User'),
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            {getInitials(user?.username || 'User')}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Share your thoughts with the community
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 2, borderRadius: 2.5 }}
          >
            {error}
          </Alert>
        )}

        {/* Text Input */}
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="What's on your mind? Share an update or post a photo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '1rem',
              px: 1,
              py: 0.5
            }
          }}
        />

        {/* Image Preview Box */}
        {imagePreview && (
          <Box className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview upload" className="image-preview" />
            <Tooltip title="Remove photo">
              <IconButton
                size="small"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Controls Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSubmitting}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startIcon={<ImageOutlinedIcon />}
              variant="text"
              color={selectedImage ? 'success' : 'primary'}
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              sx={{
                fontWeight: 600,
                borderRadius: 2.5,
                bgcolor: selectedImage ? 'rgba(16, 185, 129, 0.08)' : 'rgba(37, 99, 235, 0.06)'
              }}
            >
              {selectedImage ? 'Photo Selected' : 'Add Photo'}
            </Button>

            {(!isPostEmpty || selectedImage) && (
              <Button
                variant="text"
                color="inherit"
                size="small"
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                onClick={handleReset}
                disabled={isSubmitting}
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                Clear
              </Button>
            )}
          </Stack>

          {/* Submit Post Button */}
          <Button
            variant="contained"
            color="primary"
            endIcon={!isSubmitting && <SendIcon fontSize="small" />}
            onClick={handleSubmit}
            disabled={isPostEmpty || isSubmitting}
            sx={{
              fontWeight: 700,
              px: 2.5,
              borderRadius: 2.5
            }}
          >
            {isSubmitting ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} color="inherit" />
                <span>Posting...</span>
              </Stack>
            ) : (
              'Post'
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
