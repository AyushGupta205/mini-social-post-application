const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  toggleLike,
  addComment
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public / optional auth for feed
router.get('/', optionalAuth, getPosts);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

module.exports = router;
