import { createTheme } from '@mui/material/styles';

/**
 * HexStrike AI Theme
 * Hacker/Cybersecurity reddish theme as defined in FEATURES.md
 * Enhanced with responsive breakpoints for dynamic sizing
 */
export const hexstrikeTheme = createTheme({
  // Responsive breakpoints for dynamic sizing
  breakpoints: {
    values: {
      xs: 0,     // Mobile portrait
      sm: 600,   // Mobile landscape / small tablet
      md: 900,   // Tablet / small desktop
      lg: 1200,  // Desktop
      xl: 1536,  // Large desktop / wide screens
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#b71c1c', // Critical Red
      light: '#ff5252', // Alert Red
      dark: '#7f0000',
      contrastText: '#fffde7', // White Text
    },
    secondary: {
      main: '#ff5252', // Alert Red
      light: '#ff8a80', // Light Red
      dark: '#b71c1c',
      contrastText: '#fffde7',
    },
    error: {
      main: '#b71c1c',
      light: '#ff5252',
      dark: '#7f0000',
    },
    warning: {
      main: '#ff9800', // Warning Orange
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#00bcd4', // Info Blue
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    success: {
      main: '#00ff41', // Success Green (hacker green)
      light: '#69ff7a',
      dark: '#00c92e',
    },
    background: {
      default: '#0a0a0a', // Deep Black
      paper: '#1a1a1a',
    },
    text: {
      primary: '#fffde7', // White Text
      secondary: '#b0bec5', // Gray Text
      disabled: '#757575',
    },
    divider: '#616161', // Border Gray
  },
  typography: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
    h1: {
      fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', // Fluid typography
      fontWeight: 700,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
      fontWeight: 600,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
      fontWeight: 600,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h4: {
      fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h5: {
      fontSize: 'clamp(1rem, 1.25vw, 1.125rem)',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h6: {
      fontSize: 'clamp(0.875rem, 1vw, 1rem)',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    body1: {
      fontSize: 'clamp(0.875rem, 1vw, 1rem)',
      color: '#fffde7',
    },
    body2: {
      fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
      color: '#b0bec5',
    },
    caption: {
      fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)',
      color: '#b0bec5',
    },
  },
  spacing: 8, // Base unit: 8px
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          // Responsive button padding
          padding: '8px 16px',
          '@media (min-width:600px)': {
            padding: '10px 20px',
          },
          '@media (min-width:1200px)': {
            padding: '12px 24px',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(183, 28, 28, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(183, 28, 28, 0.5)',
          },
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #616161',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          // Responsive card padding
          '& .MuiCardContent-root': {
            padding: '12px',
            '@media (min-width:600px)': {
              padding: '16px',
            },
            '@media (min-width:1200px)': {
              padding: '20px',
            },
            '&:last-child': {
              paddingBottom: '12px',
              '@media (min-width:600px)': {
                paddingBottom: '16px',
              },
              '@media (min-width:1200px)': {
                paddingBottom: '20px',
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #616161',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #616161',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
        },
        sizeSmall: {
          fontSize: '0.7rem',
          height: 24,
        },
        sizeMedium: {
          fontSize: '0.8rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: 'clamp(0.875rem, 1vw, 1rem)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
          padding: '8px 12px',
          '@media (min-width:600px)': {
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
          minWidth: 'auto',
          padding: '8px 12px',
          '@media (min-width:600px)': {
            padding: '12px 16px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
        },
      },
    },
  },
});

// Severity colors for vulnerability display
export const severityColors = {
  critical: '#b71c1c', // Critical Red
  high: '#ff5252', // Alert Red
  medium: '#ff9800', // Warning Orange
  low: '#00bcd4', // Info Blue
  info: '#b0bec5', // Gray Text
};

// Agent status colors
export const agentStatusColors = {
  active: '#00ff41', // Success Green
  standby: '#00bcd4', // Info Blue
  busy: '#ff9800', // Warning Orange
  error: '#b71c1c', // Critical Red
};

export default hexstrikeTheme;
