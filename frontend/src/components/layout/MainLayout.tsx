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
  // Initialize sidebar state: closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-close sidebar on mobile when navigation happens
  const handleMobileClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // On mobile, sidebar is always an overlay (temporary drawer)
  // On desktop, sidebar can push content
  const effectiveSidebarOpen = isMobile ? sidebarOpen : sidebarOpen;

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <TopBar onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} open={effectiveSidebarOpen && !isMobile} />
      <Sidebar 
        open={effectiveSidebarOpen} 
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
            md: effectiveSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%'
          },
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
