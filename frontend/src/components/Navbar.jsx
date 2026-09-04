import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HubIcon from '@mui/icons-material/Hub';
import { useAuth } from '../hooks/useAuth';
import { getInitials, stringToColor } from '../utils/avatarHelper';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLogoutDialog = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ maxWidth: 1000, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          {/* Brand Logo & Name */}
          <Box
            component={RouterLink}
            to={isAuthenticated ? '/social' : '/login'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              gap: 1.2
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              <HubIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              SocialSphere
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Navigation Area */}
          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Username & Avatar Button */}
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  cursor: 'pointer',
                  p: '4px 10px',
                  borderRadius: 3,
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: stringToColor(user.username),
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {getInitials(user.username)}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
                    {user.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Logout Button (Desktop) */}
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleOpenLogoutDialog}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)'
                  }
                }}
              >
                Logout
              </Button>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 3,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <ListItemIcon>
                    <PersonOutlineIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.username}
                    secondary={user.email}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleOpenLogoutDialog} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Log In
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of your account? You will need to sign in again to create posts or interact with the feed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLogoutDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} variant="contained" color="error">
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
