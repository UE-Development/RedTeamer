/**
 * Sidebar Navigation Component
 * Mobile-optimized with temporary drawer for small screens
 */

import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar,
  SwipeableDrawer,
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

  const handleNavigate = (path: string) => {
    navigate(path);
    // Call onNavigate to close sidebar on mobile after navigation
    if (onNavigate) {
      onNavigate();
    }
  };

  const drawer = (
    <>
      <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box
          component="img"
          src="/hexstrike-logo.png"
          alt="HexStrike Logo"
          sx={{ height: 40, width: 'auto' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            // Fallback if image not found
            e.currentTarget.style.display = 'none';
          }}
        />
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                py: { xs: 1.5, sm: 1 },
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigate('/settings')}
            sx={{ py: { xs: 1.5, sm: 1 } }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{
                fontSize: { xs: '1rem', sm: '0.875rem' },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
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
            width: drawerWidth,
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
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
