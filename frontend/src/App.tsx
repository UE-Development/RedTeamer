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
import LoginPage from './pages/LoginPage';
import { ErrorBoundary } from './components/common';
import { wsService } from './services/websocket';

// Check if user is authenticated
const isAuthenticated = () => {
  return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Initialize WebSocket connection only if authenticated
    if (isAuthenticated()) {
      wsService.connect();
    }

    return () => {
      // Cleanup WebSocket connection on unmount
      wsService.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
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
    </ErrorBoundary>
  );
}

export default App;
