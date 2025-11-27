/**
 * Dashboard Page - Main Overview with Data Visualization
 * Enhanced with Recharts for real-time analytics
 * Shows real data from backend API when demo mode is off
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import BugReportIcon from '@mui/icons-material/BugReport';
import RadarIcon from '@mui/icons-material/Radar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import { useAppSelector, useAppDispatch } from '../store';
import { setMetrics, updateMetric } from '../store/slices/dashboardSlice';
import { apiClient } from '../services/api';
import {
  VulnerabilityTrendChart,
  SeverityPieChart,
  ScanActivityChart,
  ToolUsageChart,
  ResourceUsageGauge,
  VulnerabilityHeatMap,
} from '../components/charts';

// Mock scan data for demo mode
const MOCK_ACTIVE_SCANS = [
  { name: 'example.com', progress: 78, status: 'running' },
  { name: 'testsite.org', progress: 100, status: 'completed' },
  { name: 'target.net', progress: 25, status: 'running' },
];

// Mock critical vulnerabilities for demo mode
const MOCK_CRITICAL_VULNS = [
  { id: 1, title: 'SQL Injection in example.com/login', severity: 'critical', cvss: 9.8 },
  { id: 2, title: 'XSS vulnerability in testsite.org/search', severity: 'high', cvss: 7.5 },
  { id: 3, title: 'SSRF in target.net/api/fetch', severity: 'high', cvss: 8.1 },
];

interface RealScan {
  name: string;
  progress: number;
  status: string;
}

interface RealVulnerability {
  id: number;
  title: string;
  severity: string;
  cvss: number;
}

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector((state) => state.dashboard.metrics);
  const mockDataEnabled = useAppSelector((state) => state.settings.developer.mockDataEnabled);
  const [analyticsTab, setAnalyticsTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realScans, setRealScans] = useState<RealScan[]>([]);
  const [realVulns, setRealVulns] = useState<RealVulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data from backend
  const fetchRealData = useCallback(async () => {
    if (mockDataEnabled) return;
    
    setIsLoading(true);
    try {
      // Try to fetch real data from backend
      const [scansResponse, vulnsResponse] = await Promise.allSettled([
        apiClient.listScans(),
        apiClient.listVulnerabilities(),
      ]);
      
      // Process scans response
      if (scansResponse.status === 'fulfilled' && scansResponse.value?.data) {
        const scans = scansResponse.value.data;
        setRealScans(Array.isArray(scans) ? scans : []);
        const activeScansCount = Array.isArray(scans) ? scans.filter((s: RealScan) => s.status === 'running').length : 0;
        dispatch(updateMetric({ key: 'activeScans', value: activeScansCount }));
      }
      
      // Process vulnerabilities response
      if (vulnsResponse.status === 'fulfilled' && vulnsResponse.value?.data) {
        const vulns = vulnsResponse.value.data;
        setRealVulns(Array.isArray(vulns) ? vulns : []);
        dispatch(updateMetric({ key: 'vulnerabilitiesFound', value: Array.isArray(vulns) ? vulns.length : 0 }));
      }
    } catch {
      // Backend may not have these endpoints yet, that's okay
      // Just show empty state
      setRealScans([]);
      setRealVulns([]);
    } finally {
      setIsLoading(false);
    }
  }, [mockDataEnabled, dispatch]);

  useEffect(() => {
    if (mockDataEnabled) {
      // Use mock data for demonstration
      dispatch(
        setMetrics({
          activeScans: 3,
          toolsUsed: 45,
          vulnerabilitiesFound: 12,
          projectsActive: 5,
          agentsOnline: 8,
        })
      );
    } else {
      // Reset to empty state and try to fetch real data
      dispatch(
        setMetrics({
          activeScans: 0,
          toolsUsed: 0,
          vulnerabilitiesFound: 0,
          projectsActive: 0,
          agentsOnline: 0,
        })
      );
      setRealScans([]);
      setRealVulns([]);
      fetchRealData();
    }
  }, [dispatch, mockDataEnabled, fetchRealData]);

  // Refresh data handler
  const handleRefresh = () => {
    if (mockDataEnabled) {
      dispatch(
        setMetrics({
          activeScans: Math.floor(Math.random() * 5) + 1,
          toolsUsed: Math.floor(Math.random() * 50) + 30,
          vulnerabilitiesFound: Math.floor(Math.random() * 20) + 5,
          projectsActive: Math.floor(Math.random() * 10) + 3,
          agentsOnline: Math.floor(Math.random() * 12) + 4,
        })
      );
    } else {
      fetchRealData();
    }
    setLastUpdated(new Date());
  };

  // Get active scans based on mock data setting
  const activeScans = mockDataEnabled ? MOCK_ACTIVE_SCANS : realScans;

  // Get critical vulnerabilities based on mock data setting
  const criticalVulns = mockDataEnabled ? MOCK_CRITICAL_VULNS : realVulns;

  // Metric card configuration with trends (trends only shown in demo mode)
  const metricCards = [
    {
      title: 'Active Scans',
      value: metrics.activeScans,
      icon: <RadarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
      trend: mockDataEnabled ? +15 : 0,
      trendLabel: mockDataEnabled ? 'from last week' : '',
    },
    {
      title: 'Tools Used',
      value: metrics.toolsUsed,
      icon: <BuildIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
      trend: mockDataEnabled ? +23 : 0,
      trendLabel: mockDataEnabled ? 'from last week' : '',
    },
    {
      title: 'Vulnerabilities',
      value: metrics.vulnerabilitiesFound,
      icon: <BugReportIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.main',
      trend: mockDataEnabled ? -8 : 0,
      trendLabel: mockDataEnabled ? 'from last week' : '',
    },
    {
      title: 'AI Agents',
      value: metrics.agentsOnline,
      icon: <SmartToyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
      trend: 0,
      trendLabel: mockDataEnabled ? 'no change' : '',
    },
  ];

  return (
    <Box>
      {/* Info banner when demo mode is off */}
      {!mockDataEnabled && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          Demo mode is off. Showing real data from the backend. Enable Demo Mode in Settings to see sample data.
        </Alert>
      )}
      
      {/* Header with Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Security Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary" disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Metrics Cards with Trends */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: metric.color }}>
                    {metric.value}
                  </Typography>
                  {metric.trend !== 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {metric.trend > 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: metric.trend > 0 ? 'success.main' : 'error.main' }}
                      >
                        {Math.abs(metric.trend)}% {metric.trendLabel}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {metric.icon}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Analytics Section with Tabs */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={analyticsTab}
          onChange={(_, newValue) => setAnalyticsTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="📈 Trends" />
          <Tab label="🎯 Distribution" />
          <Tab label="🛠️ Tools" />
          <Tab label="🔥 Heat Map" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mb: 4 }}>
        {analyticsTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <VulnerabilityTrendChart height={280} data={mockDataEnabled ? undefined : []} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ResourceUsageGauge cpu={mockDataEnabled ? 45 : 0} memory={mockDataEnabled ? 67 : 0} disk={mockDataEnabled ? 32 : 0} height={220} />
            </Grid>
          </Grid>
        )}
        {analyticsTab === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SeverityPieChart height={280} data={mockDataEnabled ? undefined : []} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ScanActivityChart height={280} data={mockDataEnabled ? undefined : []} />
            </Grid>
          </Grid>
        )}
        {analyticsTab === 2 && (
          <ToolUsageChart height={350} data={mockDataEnabled ? undefined : []} />
        )}
        {analyticsTab === 3 && (
          <VulnerabilityHeatMap data={mockDataEnabled ? undefined : []} />
        )}
      </Box>

      {/* Recent Activity and Critical Alerts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
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
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              🚨 Critical Vulnerabilities
            </Typography>
            {criticalVulns.map((vuln) => (
              <Box
                key={vuln.id}
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  borderLeft: 4,
                  borderColor: vuln.severity === 'critical' ? 'error.main' : 'warning.main',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {vuln.title}
                  </Typography>
                  <Chip
                    label={`CVSS ${vuln.cvss}`}
                    size="small"
                    sx={{
                      bgcolor: vuln.severity === 'critical' ? '#b71c1c' : '#ff5252',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              🎯 Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Chip
                label="🚀 New Scan"
                color="primary"
                sx={{ py: 2, fontWeight: 600 }}
                onClick={() => {}}
              />
              <Chip
                label="📊 View Reports"
                color="secondary"
                sx={{ py: 2, fontWeight: 600 }}
                onClick={() => {}}
              />
              <Chip
                label="🤖 Agent Chat"
                color="info"
                sx={{ py: 2, fontWeight: 600 }}
                onClick={() => {}}
              />
              <Chip
                label="🛠️ Run Tool"
                variant="outlined"
                sx={{ py: 2, fontWeight: 600 }}
                onClick={() => {}}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
