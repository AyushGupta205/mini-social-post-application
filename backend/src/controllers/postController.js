const Post = require('../models/Post');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc    Get all posts with pagination and like status
 * @route   GET /api/posts
 * @access  Public (Optional auth for like status)
 */
const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit) || 1;

    const rawPosts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    // Format posts with like/comment counts and user like status
    const currentUserId = req.user ? req.user._id.toString() : null;
    const currentUsername = req.user ? req.user.username : null;

    const posts = rawPosts.map((post) => {
      const likesArray = post.likes || [];
      const commentsArray = post.comments || [];
      const isLiked = currentUserId
        ? likesArray.includes(currentUserId) || (currentUsername && likesArray.includes(currentUsername))
        : false;

      return {
        _id: post._id,
        userId: post.userId,
        username: post.username,
        text: post.text || '',
        imageUrl: post.imageUrl || null,
        likes: likesArray,
        likeCount: likesArray.length,
        comments: commentsArray,
        commentCount: commentsArray.length,
        isLiked,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };
    });

    return sendSuccess(res, 200, 'Posts fetched successfully', {
      posts,
      page,
      limit,
      totalPages,
      totalPosts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new post (text, image, or text + image)
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    let imageUrl = null;

    // Determine imageUrl from uploaded file
    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        // Cloudinary upload returns absolute URL in path
        imageUrl = req.file.path;
      } else if (req.file.filename) {
        // Local upload fallback: serve from /uploads/
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      }
    }

    const trimmedText = text ? text.trim() : '';

    // Validate: At least one of text or image must be provided
    if (!trimmedText && !imageUrl) {
      return sendError(
        res,
        400,
        'Cannot create an empty post. Please provide text, an image, or both.'
      );
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      text: trimmedText,
      imageUrl: imageUrl,
      likes: [],
      comments: []
    });

    const responsePost = {
      _id: post._id,
      userId: post.userId,
      username: post.username,
      text: post.text,
      imageUrl: post.imageUrl,
      likes: post.likes,
      likeCount: 0,
      comments: post.comments,
      commentCount: 0,
      isLiked: false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    return sendSuccess(res, 201, 'Post created successfully', {
      post: responsePost
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like / unlike on a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const username = req.user.username;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const likeIndex = post.likes.findIndex(
      (liked) => liked === username || liked === userId
    );
    let isLiked = false;

    if (likeIndex > -1) {
      // Already liked -> Remove like (Unlike)
      post.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      // Not liked yet -> Add username to likes array
      post.likes.push(username);
      isLiked = true;
    }

    await post.save();

    return sendSuccess(res, 200, isLiked ? 'Post liked' : 'Post unliked', {
      postId: post._id,
      isLiked,
      likeCount: post.likes.length,
      likes: post.likes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return sendError(res, 400, 'Comment text cannot be empty');
    }

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    return sendSuccess(res, 201, 'Comment added successfully', {
      postId: post._id,
      comment: savedComment,
      comments: post.comments,
      commentCount: post.comments.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  addComment
};
