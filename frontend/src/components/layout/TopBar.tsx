/**
 * Top Navigation Bar
 * Mobile-optimized with responsive elements
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
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: { xs: 1, sm: 2 } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 0, 
            fontWeight: 700, 
            fontFamily: "'Roboto', sans-serif",
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          HexStrike AI
        </Typography>

        {/* Hide version on very small screens */}
        <Typography
          variant="body2"
          sx={{
            ml: { xs: 1, sm: 2 },
            color: 'primary.light',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            display: { xs: 'none', sm: 'block' },
          }}
        >
          v6.0
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit" sx={{ mr: { xs: 0.5, sm: 1 } }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          aria-controls={menuOpen ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
        >
          <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: 'primary.dark' }}>
            {userInfo.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        {/* User Menu */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              minWidth: { xs: 200, sm: 220 },
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
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
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
