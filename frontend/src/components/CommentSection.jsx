import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Stack,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { formatTimeAgo } from '../utils/timeAgo';
import { getInitials, stringToColor } from '../utils/avatarHelper';

const CommentSection = ({ postId, comments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postService.addComment(postId, trimmed);
      if (response.success) {
        setCommentText('');
        if (onCommentAdded) {
          onCommentAdded(response.comments, response.commentCount);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to add comment. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ pt: 1.5 }}>
      <Divider sx={{ mb: 2 }} />

      {/* Error alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Comment Input Box */}
      <Box
        component="form"
        onSubmit={handleSubmitComment}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          mb: 2
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: stringToColor(user?.username || 'User'),
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          {getInitials(user?.username || 'User')}
        </Avatar>

        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSubmitting}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              backgroundColor: '#f8fafc',
              fontSize: '0.9rem'
            }
          }}
        />

        <IconButton
          color="primary"
          type="submit"
          disabled={!commentText.trim() || isSubmitting}
          sx={{
            bgcolor: commentText.trim() ? 'primary.main' : 'transparent',
            color: commentText.trim() ? '#ffffff !important' : 'inherit',
            '&:hover': {
              bgcolor: commentText.trim() ? 'primary.dark' : 'rgba(0,0,0,0.04)'
            },
            width: 38,
            height: 38
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* List of comments */}
      {comments && comments.length > 0 ? (
        <Stack spacing={1.2}>
          {comments.map((comment, index) => (
            <Box
              key={comment._id || index}
              className="comment-item"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.2
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: stringToColor(comment.username),
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  mt: 0.3
                }}
              >
                {getInitials(comment.username)}
              </Avatar>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {comment.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {formatTimeAgo(comment.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    mt: 0.2,
                    wordBreak: 'break-word',
                    fontSize: '0.875rem'
                  }}
                >
                  {comment.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', py: 1 }}
        >
          No comments yet. Be the first to start the conversation!
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection;
