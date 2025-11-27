/**
 * Error Boundary Component
 * Sprint 1: Build error handling UI
 * Catches JavaScript errors in child components
 */

import React, { Component, type ErrorInfo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to console for debugging
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'error.main',
              borderRadius: 2,
            }}
          >
            <BugReportIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2,
                filter: 'drop-shadow(0 0 10px rgba(244, 67, 54, 0.5))',
              }}
            />

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
              Something went wrong
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred. Don't worry, your data is safe.
              <br />
              Please try refreshing the page or return to the dashboard.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                sx={{ minWidth: 140 }}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ minWidth: 140 }}
              >
                Go to Dashboard
              </Button>
            </Box>

            {/* Error Details (collapsible) */}
            <Box>
              <Button
                size="small"
                onClick={this.toggleDetails}
                endIcon={this.state.showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ textTransform: 'none' }}
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Error Details
              </Button>

              <Collapse in={this.state.showDetails}>
                <Alert
                  severity="error"
                  sx={{
                    mt: 2,
                    textAlign: 'left',
                    '& .MuiAlert-message': { width: '100%' },
                  }}
                >
                  <AlertTitle>Error Message</AlertTitle>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                    }}
                  >
                    {this.state.error?.message || 'Unknown error'}
                  </Typography>

                  {this.state.errorInfo && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Component Stack:
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'background.paper',
                          p: 1,
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                          }}
                        >
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Alert>
              </Collapse>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
