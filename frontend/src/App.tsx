/**
 * HexStrike AI Frontend - Main Application
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import ToolsPage from './pages/ToolsPage';
import ScansPage from './pages/ScansPage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import ReportsPage from './pages/ReportsPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import { wsService } from './services/websocket';

function App() {
  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect();

    return () => {
      // Cleanup WebSocket connection on unmount
      wsService.disconnect();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="scans" element={<ScansPage />} />
          <Route path="vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
