# Mini Social Post Application - Backend API

Production-ready RESTful API for the 3W Full-Stack Internship Assignment: Mini Social Post Application.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM (Strictly 2 collections: `users` & `posts`)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **File Upload:** Multer (with Cloudinary cloud storage & local `/uploads` fallback)
- **Security:** Helmet, CORS, Data sanitization, Environment configurations

## Database Schema (2 Collections Only)
1. `users`: Stores user credentials (`username`, `email`, hashed `password`, `createdAt`).
2. `posts`: Stores post content (`userId`, `username`, `text`, `imageUrl`, embedded `likes` array, embedded `comments` array `[{ userId, username, text, createdAt }]`, timestamps).

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/signup` - Register a new user (`username`, `email`, `password`)
- `POST /api/auth/login` - Authenticate user & get JWT token (`email`, `password`)
- `GET /api/auth/me` - Get current authenticated user profile (Protected)

### Posts & Feed
- `GET /api/posts?page=1&limit=10` - Get paginated feed sorted newest first (Supports optional auth for like status)
- `POST /api/posts` - Create post with text, image, or text + image (Protected, multipart/form-data)
- `POST /api/posts/:id/like` - Toggle like/unlike on a post (Protected)
- `POST /api/posts/:id/comments` - Add a comment to a post (Protected, `text`)

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start server in development mode:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```
