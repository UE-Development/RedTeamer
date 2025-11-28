/**
 * Top Navigation Bar
 * Mobile-optimized with responsive elements
 * Fluid sizing adapts to screen width
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useAppSelector } from '../../store';

interface TopBarProps {
  onMenuClick: () => void;
  drawerWidth: number;
  open: boolean;
}

const TopBar = ({ onMenuClick, drawerWidth, open }: TopBarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const unreadCount = notifications.length;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Get user info from session
  const userInfoStr = sessionStorage.getItem('user_info');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { name: 'User', email: 'user@hexstrike.ai' };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear authentication tokens
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
    
    handleMenuClose();
    navigate('/login');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  // Responsive toolbar height
  const toolbarHeight = isSmallScreen ? 56 : 64;
  
  // Responsive avatar size
  const avatarSize = isLargeScreen ? 36 : isSmallScreen ? 28 : 32;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { 
          xs: '100%',
          md: open ? `calc(100% - ${drawerWidth}px)` : '100%' 
        },
        ml: { md: open ? `${drawerWidth}px` : 0 },
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar sx={{ 
        px: { xs: 1, sm: 2, lg: 3 },
        minHeight: { xs: 56, sm: 64 },
        height: toolbarHeight,
      }}>
        {/* Only show menu icon on mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: { xs: 0.5, sm: 1.5 }, 
            display: { md: 'none' },
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <MenuIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 0, 
            fontWeight: 700, 
            fontFamily: "'Roboto', sans-serif",
            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem', lg: '1.35rem' },
            letterSpacing: { xs: 0, sm: 0.5 },
          }}
        >
          HexStrike AI
        </Typography>

        {/* Hide version on very small screens */}
        <Typography
          variant="body2"
          sx={{
            ml: { xs: 0.5, sm: 1, md: 2 },
            color: 'primary.light',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: { sm: '0.75rem', md: '0.85rem', lg: '0.9rem' },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          v6.0
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notification icon with responsive sizing */}
        <IconButton 
          color="inherit" 
          sx={{ 
            mr: { xs: 0.5, sm: 1, lg: 1.5 },
            p: { xs: 0.75, sm: 1 },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: { xs: 20, sm: 22, lg: 24 } }} />
          </Badge>
        </IconButton>

        {/* User avatar with responsive sizing */}
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          aria-controls={menuOpen ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
          sx={{ p: { xs: 0.5, sm: 0.75 } }}
        >
          <Avatar 
            sx={{ 
              width: avatarSize, 
              height: avatarSize, 
              bgcolor: 'primary.dark',
              fontSize: { xs: '0.8rem', sm: '0.9rem', lg: '1rem' },
            }}
          >
            {userInfo.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        {/* User Menu with responsive sizing */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              minWidth: { xs: 200, sm: 220, lg: 240 },
              mt: 1,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {userInfo.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {userInfo.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ py: { xs: 1, sm: 1.25 } }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings} sx={{ py: { xs: 1, sm: 1.25 } }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: { xs: 1, sm: 1.25 } }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
