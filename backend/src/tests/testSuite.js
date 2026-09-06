/**
 * Automated Verification & Integration Test Suite
 * Tests all requirements: Auth, Post Creation, Likes, Comments, Pagination, and DB Collections.
 */
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');

let server;
let baseUrl;
let mongod;

const startTestServer = () => {
  return new Promise((resolve, reject) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`🚀 Test server listening on ${baseUrl}`);
      resolve();
    });
    server.on('error', reject);
  });
};

const stopTestServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
};

// Helper for fetch JSON requests
const request = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const headers = { ...(options.headers || {}) };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

// Assertion helper
let passedCount = 0;
let failedCount = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
};

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Mini Social App Automated Test Suite');
  console.log('====================================================');

  try {
    // 1. In-Memory Database Connection for Isolated Robust Testing
    console.log('Starting In-Memory MongoDB engine...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to In-Memory MongoDB Test Database');

    // Clean test collections
    await User.deleteMany({});
    await Post.deleteMany({});

    await startTestServer();

    // 2. Health Endpoint Test
    console.log('\n--- 1. Health Check ---');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200 && healthRes.data.success === true, 'GET /api/health returns 200 and healthy status');

    // 3. User Registration (Signup)
    console.log('\n--- 2. Authentication: Signup ---');
    const user1Data = {
      username: 'demo_dev',
      email: 'demo.test@example.com',
      password: 'Password123!'
    };

    const signupRes = await request('/api/auth/signup', {
      method: 'POST',
      body: user1Data
    });
    assert(signupRes.status === 201 && signupRes.data.token, 'Signup creates user and returns JWT token');
    assert(signupRes.data.user && signupRes.data.user.password === undefined, 'Password is never exposed in response');

    const tokenUser1 = signupRes.data.token;
    const user1Id = signupRes.data.user._id;

    // Duplicate email test
    const duplicateRes = await request('/api/auth/signup', {
      method: 'POST',
      body: user1Data
    });
    assert(duplicateRes.status === 409, 'Duplicate signup with same email is rejected with 409 Conflict');

    // Register second user for interaction tests
    const user2Data = {
      username: 'priya_sharma',
      email: 'priya.test@example.com',
      password: 'Password456!'
    };
    const signupUser2Res = await request('/api/auth/signup', {
      method: 'POST',
      body: user2Data
    });
    const tokenUser2 = signupUser2Res.data.token;
    const user2Id = signupUser2Res.data.user._id;
    assert(signupUser2Res.status === 201 && tokenUser2, 'Second user signup succeeds');

    // 4. User Login
    console.log('\n--- 3. Authentication: Login ---');
    const loginValidRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: user1Data.email, password: user1Data.password }
    });
    assert(loginValidRes.status === 200 && loginValidRes.data.token, 'Login with valid credentials returns 200 & token');

    const loginInvalidPwdRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: user1Data.email, password: 'WrongPassword' }
    });
    assert(loginInvalidPwdRes.status === 401, 'Login with wrong password is rejected with 401');

    const loginNonexistentRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@example.com', password: 'Password123!' }
    });
    assert(loginNonexistentRes.status === 401, 'Login with non-existent email is rejected with 401');

    // Protected /api/auth/me test
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    assert(meRes.status === 200 && meRes.data.user.username === 'demo_dev', 'GET /api/auth/me returns authenticated user profile');

    // 5. Post Creation Tests
    console.log('\n--- 4. Post Creation (Text, Image, Text+Image, Validation) ---');
    
    // Text-only post
    const textPostRes = await request('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: { text: 'Hello from demo user! This is my first text-only post.' }
    });
    assert(textPostRes.status === 201 && textPostRes.data.post.text, 'Create text-only post succeeds');
    const textPostId = textPostRes.data.post._id;

    // Reject completely empty post
    const emptyPostRes = await request('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: { text: '   ' }
    });
    assert(emptyPostRes.status === 400, 'Reject empty post (no text, no image) with 400 Bad Request');

    // Create an image-only post directly via model
    const imgPost = await Post.create({
      userId: user2Id,
      username: 'priya_sharma',
      text: '',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      likes: [],
      comments: []
    });
    assert(imgPost._id && imgPost.imageUrl, 'Create image-only post succeeds');

    // Create a text + image post
    const textImgPost = await Post.create({
      userId: user1Id,
      username: 'demo_dev',
      text: 'Exploring beautiful landscapes today!',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      likes: [],
      comments: []
    });
    assert(textImgPost._id && textImgPost.text && textImgPost.imageUrl, 'Create text + image post succeeds');

    // 6. Feed & Pagination Tests
    console.log('\n--- 5. Feed & Pagination ---');
    const feedRes = await request('/api/posts?page=1&limit=2', {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    assert(feedRes.status === 200 && feedRes.data.posts.length === 2, 'GET /api/posts respects pagination limit');
    assert(feedRes.data.totalPosts === 3 && feedRes.data.totalPages === 2, 'Pagination metadata (totalPosts, totalPages) is correct');
    assert(new Date(feedRes.data.posts[0].createdAt) >= new Date(feedRes.data.posts[1].createdAt), 'Posts are sorted newest first');

    // 7. Like / Unlike Functionality
    console.log('\n--- 6. Like Functionality & Duplicate Prevention ---');
    // User 2 likes User 1's text post
    const likeRes1 = await request(`/api/posts/${textPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` }
    });
    assert(likeRes1.status === 200 && likeRes1.data.isLiked === true && likeRes1.data.likeCount === 1, 'Liking a post returns isLiked: true and likeCount: 1');

    // User 2 toggles like again (Unlike)
    const unlikeRes = await request(`/api/posts/${textPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` }
    });
    assert(unlikeRes.status === 200 && unlikeRes.data.isLiked === false && unlikeRes.data.likeCount === 0, 'Liking again toggles unlike with likeCount: 0');

    // Like once more to keep state for subsequent checks
    await request(`/api/posts/${textPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` }
    });

    // 8. Comment Functionality
    console.log('\n--- 7. Comment Functionality ---');
    // Reject empty comment
    const emptyCommentRes = await request(`/api/posts/${textPostId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: { text: '   ' }
    });
    assert(emptyCommentRes.status === 400, 'Reject empty comment with 400 Bad Request');

    // Add valid comment
    const commentRes = await request(`/api/posts/${textPostId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: { text: 'Awesome post! Looking forward to more.' }
    });
    assert(commentRes.status === 201 && commentRes.data.comment.username === 'priya_sharma', 'Adding comment saves username and comment text');
    assert(commentRes.data.commentCount === 1, 'Comment count updates immediately to 1');

    // 9. Storage & Image Upload Integration Tests
    console.log('\n--- 8. Storage & Image Upload Architecture ---');
    const { isCloudinaryConfigured, configureCloudinary } = require('../config/cloudinary');
    assert(typeof isCloudinaryConfigured === 'function', 'Cloudinary configuration validator is exported as function');
    assert(typeof configureCloudinary === 'function', 'Cloudinary dynamic configuration function is available');

    // Test creating post with HTTPS image URL
    const httpsImgPost = await Post.create({
      userId: user1Id,
      username: 'demo_dev',
      text: 'Post with secure HTTPS cloud image',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      likes: [],
      comments: []
    });
    assert(httpsImgPost.imageUrl.startsWith('https://'), 'Post stores HTTPS image URL properly');

    // Verify GET /api/posts returns the HTTPS URL intact
    const getHttpsPostRes = await request('/api/posts?limit=1');
    assert(getHttpsPostRes.status === 200 && getHttpsPostRes.data.posts[0].imageUrl.startsWith('https://'), 'GET /api/posts returns secure HTTPS image URL');

    // 10. Verify Only TWO MongoDB Collections Exist
    console.log('\n--- 9. Database Collections Strict Audit ---');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`  Found MongoDB collections in DB: [ ${collectionNames.join(', ')} ]`);

    const hasOnlyTwoCollections =
      collectionNames.length === 2 &&
      collectionNames.includes('users') &&
      collectionNames.includes('posts');

    assert(hasOnlyTwoCollections, 'Strict database constraint satisfied: EXACTLY 2 collections (`users` and `posts`)');

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================');

    await stopTestServer();
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Test suite fatal exception:', error);
    await stopTestServer();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
    process.exit(1);
  }
}

runTests();
