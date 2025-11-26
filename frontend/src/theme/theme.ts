import { createTheme } from '@mui/material/styles';

/**
 * HexStrike AI Theme
 * Hacker/Cybersecurity reddish theme as defined in FEATURES.md
 */
export const hexstrikeTheme = createTheme({
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
      fontSize: '2.5rem',
      fontWeight: 700,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Inter', sans-serif",
      color: '#fffde7',
    },
    body1: {
      fontSize: '1rem',
      color: '#fffde7',
    },
    body2: {
      fontSize: '0.875rem',
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
        },
        contained: {
          boxShadow: '0 2px 8px rgba(183, 28, 28, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(183, 28, 28, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #616161',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
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
