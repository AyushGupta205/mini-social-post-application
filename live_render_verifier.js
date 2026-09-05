/**
 * Production Live Render Backend Verification Script
 * Usage: node live_render_verifier.js <RENDER_BACKEND_URL>
 * Example: node live_render_verifier.js https://mini-social-post-backend.onrender.com
 */
const renderUrl = (process.argv[2] || process.env.RENDER_URL || '').replace(/\/+$/, '');

if (!renderUrl) {
  console.error('Error: Please provide your live Render backend URL.');
  console.error('Usage: node live_render_verifier.js https://your-backend-service.onrender.com');
  process.exit(1);
}

const API_URL = `${renderUrl}/api`;

let passed = 0;
let failed = 0;

const assert = (condition, name) => {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name}`);
    failed++;
  }
};

async function testProductionBackend() {
  console.log('================================================================');
  console.log(`🚀 TESTING LIVE RENDER BACKEND: ${API_URL}`);
  console.log('================================================================\n');

  try {
    // 1. Health Check
    console.log('--- 1. Live Health Check Endpoint ---');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json().catch(() => ({}));
    assert(
      healthRes.status === 200 && (healthData.status === 'ok' || healthData.success === true),
      'GET /api/health returned 200 OK with healthy status'
    );

    // 2. User 1 Registration (Signup)
    console.log('\n--- 2. Production User Registration (Signup) ---');
    const user1 = {
      username: `ProdUserA_${Date.now().toString().slice(-4)}`,
      email: `proda_${Date.now()}@example.com`,
      password: 'ProdSecurePassword123!'
    };

    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user1)
    });
    const signupData = await signupRes.json().catch(() => ({}));
    assert(signupRes.status === 201 && signupData.token, 'Signup creates user and returns JWT token');
    assert(signupData.user && signupData.user.password === undefined, 'Password is not exposed in API response');
    const token1 = signupData.token;

    // 3. User 1 Login & Invalid Login
    console.log('\n--- 3. Production User Login & Validation ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user1.email, password: user1.password })
    });
    const loginData = await loginRes.json().catch(() => ({}));
    assert(loginRes.status === 200 && loginData.token, 'Login with valid credentials succeeds');

    const invalidLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user1.email, password: 'WrongPassword999' })
    });
    assert(invalidLoginRes.status === 401, 'Invalid login rejected with 401 Unauthorized');

    // Profile /me endpoint
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const meData = await meRes.json().catch(() => ({}));
    assert(meRes.status === 200 && meData.user && meData.user.username === user1.username, 'GET /api/auth/me returns authenticated user profile');

    // 4. Create Post (Text-Only)
    console.log('\n--- 4. Post Creation (Text, Empty Validation) ---');
    const textPostRes = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({ text: 'Hello from production live test on Render!' })
    });
    const textPostData = await textPostRes.json().catch(() => ({}));
    assert(textPostRes.status === 201 && textPostData.post && textPostData.post.text, 'Create text-only post succeeds');
    const postId = textPostData.post ? textPostData.post._id : null;

    // Reject empty post
    const emptyPostRes = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({ text: '   ' })
    });
    assert(emptyPostRes.status === 400, 'Empty post rejected with 400 Bad Request');

    // 5. User 2 Registration for Social Interactions
    console.log('\n--- 5. User 2 Signup & Social Interactions ---');
    const user2 = {
      username: `ProdUserB_${Date.now().toString().slice(-4)}`,
      email: `prodb_${Date.now()}@example.com`,
      password: 'ProdSecurePassword456!'
    };
    const signup2Res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user2)
    });
    const signup2Data = await signup2Res.json().catch(() => ({}));
    assert(signup2Res.status === 201 && signup2Data.token, 'Second user signup succeeds');
    const token2 = signup2Data.token;

    // 6. Like & Unlike Toggle (User 2 -> User 1 Post)
    console.log('\n--- 6. Like / Unlike Functionality ---');
    if (postId) {
      const likeRes = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token2}` }
      });
      const likeData = await likeRes.json().catch(() => ({}));
      assert(likeRes.status === 200 && likeData.isLiked === true && likeData.likeCount >= 1, 'Like increases count and returns isLiked: true');
      assert(likeData.likes && likeData.likes.includes(user2.username), 'Liker username is saved in likes array');

      // Unlike
      const unlikeRes = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token2}` }
      });
      const unlikeData = await unlikeRes.json().catch(() => ({}));
      assert(unlikeRes.status === 200 && unlikeData.isLiked === false, 'Unlike decreases count and returns isLiked: false');

      // Re-like
      await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token2}` }
      });
    }

    // 7. Comment Functionality (User 2 -> User 1 Post)
    console.log('\n--- 7. Comment Functionality ---');
    if (postId) {
      // Empty comment rejection
      const emptyCommentRes = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token2}`
        },
        body: JSON.stringify({ text: '   ' })
      });
      assert(emptyCommentRes.status === 400, 'Empty comment rejected with 400 Bad Request');

      // Valid comment
      const commentRes = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token2}`
        },
        body: JSON.stringify({ text: 'Great production deployment! Comment working smoothly.' })
      });
      const commentData = await commentRes.json().catch(() => ({}));
      assert(commentRes.status === 201 && commentData.comment && commentData.comment.text, 'Comment added successfully');
      assert(commentData.comment && commentData.comment.username === user2.username, 'Commenter username is saved');
      assert(commentData.commentCount >= 1, 'Comment count incremented');
    }

    // 8. Feed & Pagination
    console.log('\n--- 8. Public Feed & Pagination ---');
    const feedRes = await fetch(`${API_URL}/posts?page=1&limit=10`);
    const feedData = await feedRes.json().catch(() => ({}));
    assert(feedRes.status === 200 && Array.isArray(feedData.posts), 'GET /api/posts returns posts array');
    assert(feedData.totalPosts !== undefined && feedData.totalPages !== undefined, 'Feed includes totalPosts and totalPages pagination metadata');

    // 9. Protected Endpoint Check
    console.log('\n--- 9. Protected Routes Check ---');
    const unauthRes = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Unauthorized test post' })
    });
    assert(unauthRes.status === 401, 'Unauthenticated post creation blocked with 401 Unauthorized');

    console.log('\n================================================================');
    console.log(`📊 LIVE PRODUCTION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Live production test exception:', err);
    process.exit(1);
  }
}

testProductionBackend();
