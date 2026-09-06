import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Button,
  Box,
  Divider,
  Collapse
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { formatTimeAgo } from '../utils/timeAgo';
import { getInitials, stringToColor } from '../utils/avatarHelper';
import CommentSection from './CommentSection';

const PostCard = ({ post, onPostUpdated }) => {
  const { isAuthenticated } = useAuth();

  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentCount || (post.comments ? post.comments.length : 0));
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normalize image URL to HTTPS for secure cross-origin rendering
  const getNormalizedImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') && (url.includes('onrender.com') || url.includes('cloudinary.com'))) {
      return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
  };

  // Handle Like Toggle
  const handleLikeToggle = async () => {
    if (!isAuthenticated || isLiking) return;

    // Optimistic UI update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    const nextIsLiked = !previousIsLiked;
    const nextLikeCount = nextIsLiked ? previousLikeCount + 1 : Math.max(0, previousLikeCount - 1);

    setIsLiked(nextIsLiked);
    setLikeCount(nextLikeCount);
    setIsLiking(true);

    try {
      const response = await postService.toggleLike(post._id);
      if (response.success) {
        setIsLiked(response.isLiked);
        setLikeCount(response.likeCount);
        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            isLiked: response.isLiked,
            likeCount: response.likeCount,
            likes: response.likes
          });
        }
      }
    } catch (error) {
      // Revert optimistic update on failure
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment added callback
  const handleCommentAdded = (updatedComments, newCommentCount) => {
    setComments(updatedComments);
    setCommentCount(newCommentCount);
    if (onPostUpdated) {
      onPostUpdated({
        ...post,
        comments: updatedComments,
        commentCount: newCommentCount
      });
    }
  };

  return (
    <Card className="post-card">
      {/* Header with Avatar, Username, and Timestamp */}
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: stringToColor(post.username),
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}
            aria-label={post.username}
          >
            {getInitials(post.username)}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {post.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {formatTimeAgo(post.createdAt)}
          </Typography>
        }
        sx={{ pb: post.text ? 1 : 1.5 }}
      />

      {/* Post Text */}
      {post.text && (
        <CardContent sx={{ pt: 0, pb: post.imageUrl ? 1.5 : 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: '#1e293b',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }}
          >
            {post.text}
          </Typography>
        </CardContent>
      )}

      {/* Post Image with Graceful Error Fallback */}
      {post.imageUrl && !imageError && (
        <Box className="post-image-container">
          <img
            src={getNormalizedImageUrl(post.imageUrl)}
            alt="Post media attachment"
            className="post-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Box>
      )}

      {/* Like & Comment Status Bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'text.secondary',
          fontSize: '0.825rem'
        }}
      >
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span style={{ fontWeight: 600, color: isLiked ? '#ef4444' : 'inherit' }}>
            {likeCount}
          </span>{' '}
          {likeCount === 1 ? 'Like' : 'Likes'}
        </Typography>

        <Typography
          variant="caption"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setShowComments(!showComments)}
        >
          <span style={{ fontWeight: 600 }}>{commentCount}</span>{' '}
          {commentCount === 1 ? 'Comment' : 'Comments'}
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Action Buttons: Like & Comment Toggle */}
      <CardActions
        sx={{
          px: 2,
          py: 0.5,
          justifyContent: 'space-around'
        }}
      >
        {/* Like Button */}
        <Button
          fullWidth
          size="medium"
          startIcon={
            isLiked ? (
              <FavoriteIcon className="heart-active" sx={{ color: '#ef4444' }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'text.secondary' }} />
            )
          }
          onClick={handleLikeToggle}
          disabled={!isAuthenticated || isLiking}
          sx={{
            color: isLiked ? '#ef4444' : 'text.secondary',
            fontWeight: isLiked ? 700 : 500,
            borderRadius: 2.5,
            py: 0.8,
            '&:hover': {
              backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isLiked ? 'Liked' : 'Like'}
        </Button>

        {/* Comment Toggle Button */}
        <Button
          fullWidth
          size="medium"
          startIcon={<ChatBubbleOutlineIcon sx={{ color: showComments ? 'primary.main' : 'text.secondary' }} />}
          onClick={() => setShowComments((prev) => !prev)}
          sx={{
            color: showComments ? 'primary.main' : 'text.secondary',
            fontWeight: showComments ? 700 : 500,
            borderRadius: 2.5,
            py: 0.8,
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.05)'
            }
          }}
        >
          Comment
        </Button>
      </CardActions>

      {/* Expandable Comments Section */}
      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2.5, pb: 2 }}>
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;
