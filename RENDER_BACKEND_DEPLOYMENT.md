# 🚀 Render Backend Deployment — 3W Mini Social Post Application

**GitHub Repository:** `https://github.com/AyushGupta205/mini-social-post-application`  
**Branch:** `main`  
**Commit:** `f02c36d`  
**Date:** September 5, 2026  

---

## 1. Verification & Git Status
- **GitHub Remote:** `https://github.com/AyushGupta205/mini-social-post-application.git` (Verified & Up-to-date)
- **Security Check:** PASS (0 secrets, no `.env`, no `dist`, no `node_modules` tracked)
- **Localhost Backend Tests:** 22/22 PASS
- **Frontend Production Build:** PASS (0 errors)

---

## 2. Render Web Service Configuration

| Setting | Value |
|---|---|
| **Repository** | `https://github.com/AyushGupta205/mini-social-post-application` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

---

## 3. Required Environment Variables on Render

Configure these in the Render Web Service dashboard under **Environment**:

| Variable | Recommended Value / Notes |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(or let Render set default)* |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mini-social-app?retryWrites=true&w=majority` |
| `JWT_SECRET` | *(Generate a 32+ character secure random string)* |
| `CLIENT_URL` | `http://localhost:5178` *(will be updated to your Vercel URL in next phase)* |
| `CLOUDINARY_CLOUD_NAME` | *(Optional, if using Cloudinary for images)* |
| `CLOUDINARY_API_KEY` | *(Optional, if using Cloudinary for images)* |
| `CLOUDINARY_API_SECRET` | *(Optional, if using Cloudinary for images)* |

---

## 4. Verification Checkpoints
- **Health Check:** `https://<your-render-service>.onrender.com/api/health`
- **Expected Response:** `{"status": "ok", "success": true, "message": "Server is healthy"}`
