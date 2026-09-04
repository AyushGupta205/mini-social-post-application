import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern vibrant blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ec4899', // Pink / Rose accent
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc', // Very subtle cool grey background
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a', // Deep slate for high readability
      secondary: '#64748b'
    },
    divider: '#e2e8f0',
    error: {
      main: '#ef4444'
    },
    success: {
      main: '#10b981'
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    subtitle1: {
      fontWeight: 600
    },
    subtitle2: {
      fontWeight: 500,
      color: '#64748b'
    },
    body1: {
      fontSize: '0.975rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          color: '#0f172a'
        }
      }
    }
  }
});

export default theme;
