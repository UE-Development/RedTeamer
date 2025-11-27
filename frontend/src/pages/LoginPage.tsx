/**
 * Login Page - Authentication Flow
 * Sprint 1: Implement authentication flow
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate authentication - in production, this would call the backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo credentials for testing
      if (credentials.email === 'admin@hexstrike.ai' && credentials.password === 'admin') {
        // Store auth token
        const token = btoa(`${credentials.email}:${Date.now()}`);
        if (credentials.rememberMe) {
          localStorage.setItem('auth_token', token);
        } else {
          sessionStorage.setItem('auth_token', token);
        }

        // Store user info
        const userInfo = {
          email: credentials.email,
          name: 'Admin User',
          role: 'admin',
        };
        sessionStorage.setItem('user_info', JSON.stringify(userInfo));

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Demo: admin@hexstrike.ai / admin');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(183, 28, 28, 0.1) 0%, transparent 50%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 8px 32px rgba(183, 28, 28, 0.2)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SecurityIcon
              sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2,
                filter: 'drop-shadow(0 0 10px rgba(183, 28, 28, 0.5))',
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              HexStrike AI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Advanced Penetration Testing Platform
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={credentials.email}
              onChange={handleInputChange('email')}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="admin@hexstrike.ai"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleInputChange('password')}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="••••••••"
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={credentials.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Button size="small" sx={{ textTransform: 'none' }}>
                Forgot password?
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LockOutlinedIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(183, 28, 28, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(183, 28, 28, 0.4)',
                },
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Demo Credentials
            </Typography>
          </Divider>

          {/* Demo Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Use these credentials to explore the platform:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <strong>Email:</strong> admin@hexstrike.ai
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <strong>Password:</strong> admin
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
