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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-close sidebar on mobile when navigation happens
  const handleMobileClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <TopBar onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} open={sidebarOpen} />
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
            md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` 
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
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
