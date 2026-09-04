import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedPage from './pages/FeedPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {/* Root redirects to /social or /login based on auth */}
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/social' : '/login'} replace />}
            />

            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/social" replace /> : <LoginPage />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/social" replace /> : <SignupPage />}
            />

            {/* Protected Social Feed Route */}
            <Route
              path="/social"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
