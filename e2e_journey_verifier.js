/**
 * Localhost Live End-to-End Journey Verification Script
 * Validates the complete user journey against live running servers on localhost:5000 and localhost:5173
 */
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000/api';

async function runE2EJourney() {
  console.log('===========================================================');
  console.log('🚀 LIVE LOCALHOST END-TO-END USER JOURNEY VERIFICATION');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  const test = (condition, name) => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('\n--- 1. Live Backend Health Check ---');
    const healthRes = await fetch(`${BACKEND_URL}/health`).then(r => r.json());
    test(healthRes.success === true && healthRes.message === 'Server is healthy', 'GET /api/health returned healthy status');

    // 2. User A Signup
    console.log('\n--- 2. User A Signup ---');
    const userAData = {
      username: 'TestUserA',
      email: `testusera_${Date.now()}@example.com`,
      password: 'TestPassword123'
    };
    const signupARes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData)
    });
    const signupAData = await signupARes.json();
    test(signupARes.status === 201 && signupAData.token, 'User A signup succeeds and returns JWT');
    test(signupAData.user && !signupAData.user.password, 'User A password is not exposed in response');
    const tokenA = signupAData.token;
    const userAId = signupAData.user._id;

    // 3. User A Login
    console.log('\n--- 3. User A Login ---');
    const loginARes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAData.email, password: userAData.password })
    });
    const loginAData = await loginARes.json();
    test(loginARes.status === 200 && loginAData.token, 'User A login with valid credentials succeeds');

    // Test invalid password
    const loginAInvalidRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAData.email, password: 'WrongPassword999' })
    });
    test(loginAInvalidRes.status === 401, 'User A login with invalid password rejected with 401');

    // 4. Create Posts as User A
    console.log('\n--- 4. Post Creation: Text, Image, Text+Image, Empty Rejection ---');
    // Test 1: Text-only post
    const textPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ text: 'This is my first text-only social post.' })
    });
    const textPostData = await textPostRes.json();
    test(textPostRes.status === 201 && textPostData.post.text === 'This is my first text-only social post.', 'Test 1: Text-only post created successfully');
    test(textPostData.post.username === 'TestUserA', 'Post contains correct author username (TestUserA)');
    const postA1_Id = textPostData.post._id;

    // Test 2: Image-only post (using a multipart sample file upload)
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    // Create a 1x1 png image dummy buffer
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    const blob = new Blob([dummyPng], { type: 'image/png' });
    formData.append('image', blob, 'sample.png');

    const imagePostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`
      },
      body: formData
    });
    const imagePostData = await imagePostRes.json();
    test(imagePostRes.status === 201 && imagePostData.post.imageUrl, 'Test 2: Image-only post created with valid imageUrl');

    // Test 3: Text + Image post
    const textImgFormData = new FormData();
    textImgFormData.append('text', 'Enjoying a sunny day with social feeds!');
    textImgFormData.append('image', blob, 'landscape.png');

    const textImgPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`
      },
      body: textImgFormData
    });
    const textImgPostData = await textImgPostRes.json();
    test(textImgPostRes.status === 201 && textImgPostData.post.text && textImgPostData.post.imageUrl, 'Test 3: Text + Image post created successfully');

    // Test 4: Reject Empty Post
    const emptyPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ text: '   ' })
    });
    test(emptyPostRes.status === 400, 'Test 4: Reject empty post (no text & no image) with 400 Bad Request');

    // 5. Feed Verification
    console.log('\n--- 5. Feed Verification ---');
    const feedRes = await fetch(`${BACKEND_URL}/posts?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const feedData = await feedRes.json();
    test(feedRes.status === 200 && feedData.posts.length >= 3, 'Feed returns posts successfully');
    test(new Date(feedData.posts[0].createdAt) >= new Date(feedData.posts[1].createdAt), 'Feed is sorted newest first');
    test(feedData.posts[0].username && feedData.posts[0].likeCount !== undefined && feedData.posts[0].commentCount !== undefined, 'Post objects contain username, likeCount, and commentCount');

    // 6. User B Signup, Like, and Unlike
    console.log('\n--- 6. User B Signup & Like Functionality ---');
    const userBData = {
      username: 'TestUserB',
      email: `testuserb_${Date.now()}@example.com`,
      password: 'TestPassword123'
    };
    const signupBRes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData)
    });
    const signupBData = await signupBRes.json();
    test(signupBRes.status === 201 && signupBData.token, 'User B signup succeeds');
    const tokenB = signupBData.token;

    // User B likes User A's post
    const likeRes = await fetch(`${BACKEND_URL}/posts/${postA1_Id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const likeData = await likeRes.json();
    test(likeRes.status === 200 && likeData.isLiked === true && likeData.likeCount === 1, 'User B liking post returns isLiked: true and likeCount: 1');

    // User B unlikes
    const unlikeRes = await fetch(`${BACKEND_URL}/posts/${postA1_Id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const unlikeData = await unlikeRes.json();
    test(unlikeRes.status === 200 && unlikeData.isLiked === false && unlikeData.likeCount === 0, 'User B unliking post returns isLiked: false and likeCount: 0');

    // Re-like for comment test
    await fetch(`${BACKEND_URL}/posts/${postA1_Id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    // 7. Comments Test
    console.log('\n--- 7. Comments Functionality ---');
    // Reject empty comment
    const emptyCommentRes = await fetch(`${BACKEND_URL}/posts/${postA1_Id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ text: '   ' })
    });
    test(emptyCommentRes.status === 400, 'Reject empty comment with 400 Bad Request');

    // Add valid comment
    const commentRes = await fetch(`${BACKEND_URL}/posts/${postA1_Id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ text: 'This is a test comment.' })
    });
    const commentData = await commentRes.json();
    test(commentRes.status === 201 && commentData.comment.text === 'This is a test comment.', 'Comment created and returned with text');
    test(commentData.comment.username === 'TestUserB', 'Comment contains author username (TestUserB)');
    test(commentData.commentCount === 1, 'Comment count updated to 1');

    // Verify comment persists on feed refresh
    const refreshedFeedRes = await fetch(`${BACKEND_URL}/posts?page=1&limit=10`);
    const refreshedFeed = await refreshedFeedRes.json();
    const targetPost = refreshedFeed.posts.find(p => p._id === postA1_Id);
    test(targetPost && targetPost.comments.length === 1 && targetPost.comments[0].text === 'This is a test comment.', 'Comment persists across feed fetch requests');

    // 8. Pagination Test
    console.log('\n--- 8. Pagination & Limit Test ---');
    const page1Res = await fetch(`${BACKEND_URL}/posts?page=1&limit=2`);
    const page1Data = await page1Res.json();
    test(page1Data.posts.length === 2, 'Page 1 respects configured limit of 2');
    test(page1Data.totalPages >= 2, 'Total pages calculated correctly');

    const page2Res = await fetch(`${BACKEND_URL}/posts?page=2&limit=2`);
    const page2Data = await page2Res.json();
    test(page2Data.posts.length >= 1, 'Page 2 returns remaining posts');
    // Ensure no duplicate IDs between pages
    const page1Ids = new Set(page1Data.posts.map(p => p._id));
    const hasDuplicates = page2Data.posts.some(p => page1Ids.has(p._id));
    test(!hasDuplicates, 'Pagination returns distinct non-overlapping posts per page');

    // 9. Protected Routes Check
    console.log('\n--- 9. Protected Route Check ---');
    const unauthPostRes = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Unauthorized post attempt' })
    });
    test(unauthPostRes.status === 401, 'Unauthenticated post creation is blocked with 401');

    console.log('\n===========================================================');
    console.log(`📊 LIVE USER JOURNEY RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ E2E Journey Error:', err);
    process.exit(1);
  }
}

runE2EJourney();
