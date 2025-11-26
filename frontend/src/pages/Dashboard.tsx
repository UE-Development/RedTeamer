/**
 * Dashboard Page - Main Overview
 */

import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import BugReportIcon from '@mui/icons-material/BugReport';
import RadarIcon from '@mui/icons-material/Radar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAppSelector, useAppDispatch } from '../store';
import { setMetrics } from '../store/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector((state) => state.dashboard.metrics);
  // const recentActivity = useAppSelector((state) => state.dashboard.recentActivity);

  useEffect(() => {
    // Fetch dashboard metrics
    // For now, using mock data
    dispatch(
      setMetrics({
        activeScans: 3,
        toolsUsed: 45,
        vulnerabilitiesFound: 12,
        projectsActive: 5,
        agentsOnline: 8,
      })
    );
  }, [dispatch]);

  const metricCards = [
    {
      title: 'Active Scans',
      value: metrics.activeScans,
      icon: <RadarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Tools Used',
      value: metrics.toolsUsed,
      icon: <BuildIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
    {
      title: 'Vulnerabilities',
      value: metrics.vulnerabilitiesFound,
      icon: <BugReportIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.main',
    },
    {
      title: 'AI Agents',
      value: metrics.agentsOnline,
      icon: <SmartToyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
  ];

  // Mock scan data for demo
  const activeScans = [
    { name: 'example.com', progress: 78, status: 'running' },
    { name: 'testsite.org', progress: 100, status: 'completed' },
    { name: 'target.net', progress: 25, status: 'running' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Security Overview
      </Typography>

      {/* Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {metricCards.map((metric) => (
          <Card
            key={metric.title}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: metric.color }}>
                    {metric.value}
                  </Typography>
                </Box>
                {metric.icon}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📈 Recent Activity
          </Typography>
          {activeScans.map((scan, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {scan.name}
                </Typography>
                <Chip
                  label={scan.status === 'completed' ? 'Complete' : `${scan.progress}% done`}
                  size="small"
                  color={scan.status === 'completed' ? 'success' : 'primary'}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={scan.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: scan.status === 'completed' ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🎯 Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label="New Scan" color="primary" onClick={() => {}} />
            <Chip label="View Reports" color="secondary" onClick={() => {}} />
            <Chip label="Agent Chat" color="info" onClick={() => {}} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
