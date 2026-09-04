const mongoose = require('mongoose');

// Embedded Comment Schema (NOT a separate collection)
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a comment']
    },
    username: {
      type: String,
      required: [true, 'Username is required for a comment'],
      trim: true
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true,
    versionKey: false
  }
);

// Post Schema (Collection: posts)
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post text cannot exceed 2000 characters'],
      default: ''
    },
    imageUrl: {
      type: String,
      default: null
    },
    // Array of user IDs who liked the post
    likes: [
      {
        type: String, // String representation of userId (or username)
        trim: true
      }
    ],
    // Array of embedded comments
    comments: [commentSchema]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Validation: At least one of text or imageUrl must be provided
postSchema.pre('validate', function (next) {
  const hasText = this.text && this.text.trim().length > 0;
  const hasImage = this.imageUrl && this.imageUrl.trim().length > 0;

  if (!hasText && !hasImage) {
    this.invalidate('text', 'A post must contain either text, an image, or both.');
  }
  next();
});

// Virtual for likeCount and commentCount
postSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Configure JSON output to include virtuals
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema, 'posts');

module.exports = Post;
