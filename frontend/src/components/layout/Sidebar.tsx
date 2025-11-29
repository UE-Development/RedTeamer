/**
 * Sidebar Navigation Component
 * Mobile-optimized with temporary drawer for small screens
 * Responsive sizing adapts to screen width
 */

import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  SwipeableDrawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BuildIcon from '@mui/icons-material/Build';
import RadarIcon from '@mui/icons-material/Radar';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  onClose: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'AI Agents', icon: <SmartToyIcon />, path: '/agents' },
  { text: 'Tools', icon: <BuildIcon />, path: '/tools' },
  { text: 'Scans', icon: <RadarIcon />, path: '/scans' },
  { text: 'Vulnerabilities', icon: <BugReportIcon />, path: '/vulnerabilities' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Projects', icon: <FolderIcon />, path: '/projects' },
];

const Sidebar = ({ open, drawerWidth, onClose, isMobile = false, onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const handleNavigate = (path: string) => {
    navigate(path);
    // Call onNavigate to close sidebar on mobile after navigation
    if (onNavigate) {
      onNavigate();
    }
  };

  // Responsive icon and text sizing
  const iconSize = isLargeScreen ? 26 : 22;
  const fontSize = isLargeScreen ? '0.95rem' : '0.875rem';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 },
      }}>
        <Box
          component="img"
          src="/hexstrike-logo.png"
          alt="HexStrike Logo"
          sx={{ 
            height: { xs: 32, sm: 36, lg: 40 }, 
            width: 'auto',
            transition: 'height 0.2s ease',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            // Fallback if image not found
            e.currentTarget.style.display = 'none';
          }}
        />
      </Toolbar>
      
      {/* Scrollable navigation area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ py: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  py: { xs: 1.25, sm: 1, lg: 1.25 },
                  px: { xs: 1.5, sm: 2 },
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: { xs: 36, sm: 40, lg: 44 },
                  '& .MuiSvgIcon-root': {
                    fontSize: iconSize,
                  },
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontSize: { xs: '0.9rem', sm: fontSize },
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Settings at bottom */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1 }}>
        <List sx={{ py: 0 }}>
          <ListItem disablePadding sx={{ px: 1 }}>
            <ListItemButton 
              selected={location.pathname === '/settings'}
              onClick={() => handleNavigate('/settings')}
              sx={{ 
                py: { xs: 1.25, sm: 1, lg: 1.25 },
                px: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: { xs: 36, sm: 40, lg: 44 },
                '& .MuiSvgIcon-root': {
                  fontSize: iconSize,
                },
              }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{
                  fontSize: { xs: '0.9rem', sm: fontSize },
                  fontWeight: location.pathname === '/settings' ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  // Use SwipeableDrawer for mobile, permanent Drawer for desktop
  if (isMobile) {
    return (
      <SwipeableDrawer
        variant="temporary"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '80vw', sm: drawerWidth },
            maxWidth: 300,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </SwipeableDrawer>
    );
  }

  // Permanent drawer for desktop - always visible, doesn't overlap content
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
