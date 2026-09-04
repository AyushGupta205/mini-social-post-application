# Mini Social Post Application - Frontend Client

Responsive, modern React.js frontend built with Vite, Material UI (MUI), and Axios for the 3W Full-Stack Internship Assignment: Mini Social Post Application.

## Tech Stack
- **Framework:** React 18 + Vite
- **UI & Styling:** Material UI (MUI v5) + Emotion + Clean Custom CSS (Strictly NO TailwindCSS)
- **Routing:** React Router v6
- **HTTP Client:** Axios (with request/response interceptors)
- **State Management:** React Context API (`AuthContext`)

## Key Features
- **User Authentication:** Login, Signup, Protected `/social` feed route, dynamic initial avatars.
- **Social Feed:** Desktop centered feed (max-width 760px), mobile responsive layout.
- **Post Creation:** Supports Text only, Image only, or Text + Image with instant client preview and validation.
- **Interactions:** Real-time optimistic Like toggle with pulse animation and embedded comments with timestamps.
- **Pagination:** "Load More" pagination via `GET /api/posts?page=1&limit=10`.
- **UX Polishing:** Loading spinners, empty feed placeholder, error boundaries, and logout dialogs.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables in `.env` (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
