/**
 * Main Layout Component
 * Includes top navigation bar and sidebar with mobile optimization
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Mobile sidebar toggle state - only used for mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      <TopBar onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} open={!isMobile} />
      <Sidebar 
        open={sidebarOpen} 
        drawerWidth={DRAWER_WIDTH} 
        onClose={handleDrawerToggle}
        isMobile={isMobile}
        onNavigate={handleMobileClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { 
            xs: '100%',
            md: `calc(100% - ${DRAWER_WIDTH}px)`
          },
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          maxWidth: '100%',
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
