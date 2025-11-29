/**
 * Main Layout Component
 * Includes top navigation bar and sidebar with mobile optimization
 * Responsive breakpoints: xs (0-600), sm (600-900), md (900-1200), lg (1200-1536), xl (1536+)
 */

import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

// Responsive drawer widths based on screen size
const getDrawerWidth = (isTablet: boolean, isLargeScreen: boolean): number => {
  if (isLargeScreen) return 260; // Larger sidebar for big screens
  if (isTablet) return 220; // Slightly smaller for tablets
  return 240; // Default for medium screens
};

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1200px
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl')); // >= 1536px
  
  // Mobile sidebar toggle state - only used for mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Calculate drawer width based on screen size
  const drawerWidth = useMemo(() => 
    getDrawerWidth(isTablet, isLargeScreen), 
    [isTablet, isLargeScreen]
  );

  const handleDrawerToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Auto-close sidebar on mobile when navigation happens
  const handleMobileClose = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  // On desktop, sidebar is always visible. On mobile, it's controlled by mobileSidebarOpen
  const sidebarOpen = isMobile ? mobileSidebarOpen : true;

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <TopBar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} open={!isMobile} />
      <Sidebar 
        open={sidebarOpen} 
        drawerWidth={drawerWidth} 
        onClose={handleDrawerToggle}
        isMobile={isMobile}
        onNavigate={handleMobileClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Responsive padding
          p: { xs: 1, sm: 1.5, md: 2, lg: 3, xl: 4 },
          // Dynamic width calculation
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)`
          },
          // Margin for sidebar offset on desktop
          ml: { xs: 0, md: `${drawerWidth}px` },
          // Ensure content doesn't overflow
          maxWidth: '100%',
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
          overflowY: 'auto',
          boxSizing: 'border-box',
          // Smooth transition for responsive changes
          transition: theme.transitions.create(['width', 'margin', 'padding'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
