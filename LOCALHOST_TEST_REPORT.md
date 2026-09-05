# 📋 Localhost Test Report — 3W Mini Social Post Application

**Verification Date & Time:** September 5, 2026 — 13:03 IST  
**Environment:** Localhost (Windows Development Environment)  
**Backend URL:** `http://localhost:5000`  
**Frontend URL:** `http://localhost:5178`  
**Database:** MongoDB with Mongoose (Strictly 2 Collections: `users`, `posts`)

---

## 1. Test Accounts Used (Local Test Only)
- **User A:** Username: `DemoUser`, Email: `demo@example.com`
- **User B:** Username: `PriyaSharma`, Email: `priya@example.com`
- **User C:** Username: `AyushGupta`, Email: `ayush@example.com`

---

## 2. Final Assignment Requirement Table

| Requirement | Status | Evidence / Notes |
|---|---|---|
| **Signup** | **PASS** | `POST /api/auth/signup` creates users with bcrypt hashed passwords and issues JWT |
| **Login** | **PASS** | `POST /api/auth/login` validates credentials; invalid passwords rejected with 401 |
| **MongoDB users** | **PASS** | `users` collection contains `_id`, `username`, `email`, `password` (hashed), `createdAt` |
| **Exactly 2 collections** | **PASS** | Verified MongoDB strictly contains ONLY `users` and `posts` |
| **Create text post** | **PASS** | Created text post "This is my localhost text-only test post." with author `DemoUser` |
| **Create image post** | **PASS** | Created image post via multipart upload; valid imageUrl rendered |
| **Create text + image post** | **PASS** | Created post with both text and image simultaneously |
| **Reject empty post** | **PASS** | Post with empty text & no image rejected with `400 Bad Request` |
| **Public feed** | **PASS** | `GET /api/posts` returns all posts sorted newest first (`createdAt: -1`) |
| **Multiple users** | **PASS** | Verified `DemoUser`, `PriyaSharma`, and `AyushGupta` interacting concurrently |
| **Like** | **PASS** | User B liked User A post; like count increased, `isLiked: true` |
| **Unlike** | **PASS** | User B unliked post; count decreased, `isLiked: false` |
| **Save liker username** | **PASS** | Liker username (`PriyaSharma`, `AyushGupta`) stored directly in `post.likes` array |
| **Comment** | **PASS** | User B commented "Great post! This is a localhost comment test."; stored in MongoDB |
| **Save commenter username** | **PASS** | Comment author username (`PriyaSharma`) saved in embedded comment object |
| **Comment count** | **PASS** | Comment count updated immediately upon comment submission |
| **Pagination** | **PASS** | `GET /api/posts?page=1&limit=2` & `page=2` returns non-overlapping posts |
| **Instant UI updates** | **PASS** | Optimistic UI updates for likes and instant comment list rendering |
| **React frontend** | **PASS** | React 18 SPA with Vite in `/frontend` |
| **Node + Express backend** | **PASS** | Express app with modular controllers and routes in `/backend` |
| **MongoDB** | **PASS** | MongoDB with Mongoose ODM connected |
| **No TailwindCSS** | **PASS** | Strictly built with Material UI (MUI v5) and custom CSS |
| **Responsive UI** | **PASS** | Layout tested from 375px mobile to 1440px desktop screens |
| **Frontend build** | **PASS** | `npm run build` completed with 0 errors in `/frontend/dist` |
| **Backend tests** | **PASS** | All 22 automated integration tests passed in `npm test` |
| **Security checks** | **PASS** | Helmet headers, CORS policies, passwords hashed, `.env` ignored |

---

## 3. Test Execution Summary

### Automated Integration Tests (`npm test` in `backend`)
- **Total Tests Executed:** 22
- **Passed:** 22
- **Failed:** 0

### Live Localhost User Journey Tests (`final_localhost_verifier.js`)
- **Total Assertions Executed:** 29
- **Passed:** 29
- **Failed:** 0

### Browser Console & Network Check
- **JavaScript Errors:** 0
- **Failed API Requests:** 0 (all expected error paths return structured JSON)
- **CORS Errors:** 0
- **Broken Image Requests:** 0

---

## 4. Bugs Found & Fixed During Localhost Verification
1. **Liker Username Persistence:**
   - **Improvement:** Updated `toggleLike` in `postController.js` to store the active username (`req.user.username`) into `post.likes` so liker usernames are saved directly in MongoDB.
2. **Health Check Response Standardization:**
   - **Improvement:** Included `status: 'ok'` in `GET /api/health` JSON response alongside `success: true`.
3. **Local Port Customization:**
   - **Update:** Configured frontend Vite port to `5178` and updated backend CORS `CLIENT_URL` accordingly.

---

## FINAL STATUS: READY FOR DEPLOYMENT
