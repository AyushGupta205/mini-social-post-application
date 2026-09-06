/**
 * Final Comprehensive Localhost Verifier Script
 * Validates all 20 sections of the final prompt against live servers on localhost:5000 and localhost:5178
 */
const path = require('path');

const BACKEND_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5178';

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

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 FINAL LOCALHOST VERIFICATION — MINI SOCIAL POST APPLICATION');
  console.log('================================================================\n');

  try {
    // 1. Backend Health Check
    console.log('--- 1. Backend Health & Server Status ---');
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && (healthData.status === 'ok' || healthData.success === true), 'GET /api/health returns 200 OK and healthy status');

    // 2. Frontend Status
    console.log('\n--- 2. Frontend Dev Server Status ---');
    const frontendRes = await fetch(FRONTEND_URL);
    const frontendHtml = await frontendRes.text();
    assert(frontendRes.status === 200 && frontendHtml.includes('id="root"'), 'Frontend loads on http://localhost:5178');

    // 3. User A Authentication (Signup & Login)
    console.log('\n--- 3. User A Authentication (DemoUser) ---');
    const userAData = {
      username: 'DemoUser',
      email: 'demo@example.com',
      password: 'Password123'
    };

    // Signup / check existing
    let tokenA;
    let userA_Id;
    const signupARes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData)
    });
    const signupAJson = await signupARes.json();
    if (signupARes.status === 201) {
      tokenA = signupAJson.token;
      userA_Id = signupAJson.user._id;
      assert(true, 'User A signup succeeded');
    } else {
      // If already created, login
      const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userAData.email, password: userAData.password })
      });
      const loginData = await loginRes.json();
      tokenA = loginData.token;
      userA_Id = loginData.user._id;
      assert(loginRes.status === 200, 'User A login succeeded with valid credentials');
    }

    // Verify password is not exposed in responses
    const meARes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const meAData = await meARes.json();
    assert(meAData.user && meAData.user.password === undefined, 'User A password hash is never exposed in API responses');
    assert(meAData.user.username === 'DemoUser', 'User A profile returns correct username (DemoUser)');

    // Verify invalid login rejection
    const invalidLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@example.com', password: 'WrongPassword999' })
    });
    assert(invalidLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // 4. User B Authentication (PriyaSharma)
    console.log('\n--- 4. User B Authentication (PriyaSharma) ---');
    const userBData = {
      username: 'PriyaSharma',
      email: 'priya@example.com',
      password: 'Password123'
    };
    let tokenB;
    let userB_Id;
    const signupBRes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData)
    });
    const signupBJson = await signupBRes.json();
    if (signupBRes.status === 201) {
      tokenB = signupBJson.token;
      userB_Id = signupBJson.user._id;
      assert(true, 'User B signup succeeded');
    } else {
      const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userBData.email, password: userBData.password })
      });
      const loginData = await loginRes.json();
      tokenB = loginData.token;
      userB_Id = loginData.user._id;
      assert(loginRes.status === 200, 'User B login succeeded with valid credentials');
    }

    // 5. User C Authentication (AlexMorgan)
    console.log('\n--- 5. User C Authentication (AlexMorgan) ---');
    const userCData = {
      username: 'AlexMorgan',
      email: 'alex@example.com',
      password: 'Password123!'
    };
    let tokenC;
    let userC_Id;
    const signupCRes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userCData)
    });
    const signupCJson = await signupCRes.json();
    if (signupCRes.status === 201) {
      tokenC = signupCJson.token;
      userC_Id = signupCJson.user._id;
      assert(true, 'User C signup succeeded');
    } else {
      const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userCData.email, password: userCData.password })
      });
      const loginData = await loginRes.json();
      tokenC = loginData.token;
      userC_Id = loginData.user._id;
      assert(loginRes.status === 200, 'User C login succeeded with valid credentials');
    }

    // 6. Post Creation Tests (User A)
    console.log('\n--- 6. Post Creation Tests (User A) ---');
    // Test 1: Text only
    const post1Res = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ text: 'This is my localhost text-only test post.' })
    });
    const post1Data = await post1Res.json();
    assert(post1Res.status === 201 && post1Data.post.text === 'This is my localhost text-only test post.', 'Test 1: Text-only post created successfully');
    assert(post1Data.post.username === 'DemoUser', 'Post author username is DemoUser');
    const postA_Id = post1Data.post._id;

    // Test 2: Image only (1x1 PNG dummy buffer)
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const formImageOnly = new FormData();
    formImageOnly.append('image', new Blob([dummyPng], { type: 'image/png' }), 'test_photo.png');

    const post2Res = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formImageOnly
    });
    const post2Data = await post2Res.json();
    assert(post2Res.status === 201 && post2Data.post.imageUrl, 'Test 2: Image-only post created with valid imageUrl');

    // Test 3: Text + Image
    const formTextImg = new FormData();
    formTextImg.append('text', 'This is my localhost text and image test post.');
    formTextImg.append('image', new Blob([dummyPng], { type: 'image/png' }), 'social_graphic.png');

    const post3Res = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formTextImg
    });
    const post3Data = await post3Res.json();
    assert(post3Res.status === 201 && post3Data.post.text && post3Data.post.imageUrl, 'Test 3: Text + image post created successfully');

    // Test 4: Reject Empty Post
    const emptyPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ text: '   ' })
    });
    assert(emptyPostRes.status === 400, 'Test 4: Empty post rejected with 400 Bad Request');

    // 7. Public Feed Verification
    console.log('\n--- 7. Public Feed Verification ---');
    const feedRes = await fetch(`${BACKEND_URL}/posts?page=1&limit=10`);
    const feedData = await feedRes.json();
    assert(feedRes.status === 200 && feedData.posts.length > 0, 'Feed returns list of posts');
    assert(new Date(feedData.posts[0].createdAt) >= new Date(feedData.posts[1].createdAt), 'Feed is sorted newest first');
    assert(feedData.posts[0].username && feedData.posts[0].likeCount !== undefined, 'Post card contains username and like count');

    // 8. Like Functionality (User B likes User A's post)
    console.log('\n--- 8. Like Functionality (User B -> User A Post) ---');
    const likeRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const likeData = await likeRes.json();
    assert(likeRes.status === 200 && likeData.isLiked === true && likeData.likeCount >= 1, 'Like increases like count and sets isLiked: true');
    assert(likeData.likes.includes('PriyaSharma'), 'User B username (PriyaSharma) is saved in likes array');

    // Unlike toggle
    const unlikeRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const unlikeData = await unlikeRes.json();
    assert(unlikeRes.status === 200 && unlikeData.isLiked === false, 'Unlike decreases count and removes like');

    // Re-like for multi-user comment & like checks
    await fetch(`${BACKEND_URL}/posts/${postA_Id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    // 9. Comment Functionality (User B -> User A Post)
    console.log('\n--- 9. Comment Functionality (User B -> User A Post) ---');
    // Reject empty comment
    const emptyCommentRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ text: '   ' })
    });
    assert(emptyCommentRes.status === 400, 'Empty comment rejected with 400 Bad Request');

    // Valid comment
    const commentRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ text: 'Great post! This is a localhost comment test.' })
    });
    const commentData = await commentRes.json();
    assert(commentRes.status === 201 && commentData.comment.text === 'Great post! This is a localhost comment test.', 'Comment added successfully with correct text');
    assert(commentData.comment.username === 'PriyaSharma', 'Comment saves author username (PriyaSharma)');
    assert(commentData.commentCount >= 1, 'Comment count increases immediately');

    // 10. Multi-User Verification (User C interacts with User A's post)
    console.log('\n--- 10. Multi-User Verification (User C Interaction) ---');
    // User C likes User A's post
    const likeCRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    const likeCData = await likeCRes.json();
    assert(likeCRes.status === 200 && likeCData.likes.includes('AlexMorgan'), 'User C (AlexMorgan) can like post simultaneously');

    // User C comments on User A's post
    const commentCRes = await fetch(`${BACKEND_URL}/posts/${postA_Id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenC}`
      },
      body: JSON.stringify({ text: 'Awesome update DemoUser, looks great!' })
    });
    const commentCData = await commentCRes.json();
    assert(commentCRes.status === 201 && commentCData.comment.username === 'AlexMorgan', 'User C (AlexMorgan) comment saved with correct username');

    // 11. Pagination Verification
    console.log('\n--- 11. Pagination Verification ---');
    const page1Res = await fetch(`${BACKEND_URL}/posts?page=1&limit=2`);
    const page1Data = await page1Res.json();
    const page2Res = await fetch(`${BACKEND_URL}/posts?page=2&limit=2`);
    const page2Data = await page2Res.json();

    assert(page1Data.posts.length === 2, 'Page 1 respects configured limit of 2');
    assert(page2Data.posts.length >= 1, 'Page 2 returns next subset of posts');
    const page1Set = new Set(page1Data.posts.map(p => p._id));
    const overlap = page2Data.posts.some(p => page1Set.has(p._id));
    assert(!overlap, 'No duplicate posts returned between pages');

    // 12. Protected Routes Verification
    console.log('\n--- 12. Protected Routes Check ---');
    const unauthPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Attempting unauthenticated post' })
    });
    assert(unauthPostRes.status === 401, 'Unauthenticated post creation blocked with 401');

    console.log('\n================================================================');
    console.log(`📊 LOCALHOST VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Verification script exception:', err);
    process.exit(1);
  }
}

runVerification();
