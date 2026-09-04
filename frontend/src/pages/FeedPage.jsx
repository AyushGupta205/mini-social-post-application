import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';

const POSTS_PER_PAGE = 10;

const FeedPage = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNum = 1, isAppend = false) => {
    try {
      if (pageNum === 1 && !isAppend) {
        setError(null);
      }
      const response = await postService.getPosts(pageNum, POSTS_PER_PAGE);

      if (response.success) {
        if (isAppend) {
          // Append new page posts and deduplicate by _id
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const newPosts = (response.posts || []).filter((p) => !existingIds.has(p._id));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(response.posts || []);
        }

        setPage(response.page || pageNum);
        setTotalPages(response.totalPages || 1);
        setTotalPosts(response.totalPosts || 0);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to load social feed. Please check your connection.';
      setError(msg);
    } finally {
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Handle Manual Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(1, false);
  };

  // Handle Load More
  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      fetchPosts(nextPage, true);
    }
  };

  // Handle new post created -> Prepend to feed immediately
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setTotalPosts((prev) => prev + 1);
  };

  // Handle post update (e.g. like, comment count)
  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    );
  };

  const hasMore = page < totalPages;

  return (
    <Box className="feed-container">
      {/* Feed Header Greeting & Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Social Feed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, <span style={{ fontWeight: 600, color: '#2563eb' }}>{user?.username}</span>! Discover what people are sharing.
          </Typography>
        </Box>

        <Tooltip title="Refresh Feed">
          <IconButton
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingInitial}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            {isRefreshing ? (
              <CircularProgress size={20} color="primary" />
            ) : (
              <RefreshIcon sx={{ color: 'text.secondary' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Create Post Section */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error Alert */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchPosts(1, false)}
          sx={{ mb: 3 }}
        />
      )}

      {/* Feed Content */}
      {isLoadingInitial ? (
        <LoadingSpinner message="Loading the latest posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to share an update, quote, or photo with the community!"
        />
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Load More Pagination Section */}
          {hasMore && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 700,
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#eff6ff' }
                }}
              >
                {isLoadingMore ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} color="inherit" />
                    <span>Loading more posts...</span>
                  </Stack>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </Box>
          )}

          {!hasMore && posts.length > 5 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2, display: 'block' }}
            >
              You've reached the end of the feed • {totalPosts} posts loaded
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default FeedPage;
