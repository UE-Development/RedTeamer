/**
 * Scans Page - Real-time Scan Monitoring
 * Live monitoring and management of security scans
 * Supports both demo mode (mock data) and real backend data
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Grid,
  Paper,
  List,
  ListItemText,
  Divider,
  ListItemButton,
  Snackbar,
  Alert,
  ButtonGroup,
} from '@mui/material';
import RadarIcon from '@mui/icons-material/Radar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoIcon from '@mui/icons-material/Info';
import { ScanCreationWizard, ScanExporter, ScanComparisonTool } from '../components/scans';
import type { ScanData } from '../components/scans';
import { useAppSelector } from '../store';
import { apiClient } from '../services/api';

interface Scan {
  id: string;
  target: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentPhase: string;
  phases: ScanPhase[];
  startTime: Date;
  duration: number;
  vulnerabilitiesFound: number;
  toolsUsed: string[];
}

interface ScanPhase {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  details?: string;
}

// Backend scan response interface
interface BackendScan {
  id: string;
  target: string;
  type: string;
  status: string;
  progress: number;
  currentPhase: string;
  phases?: ScanPhase[];
  startTime?: string;
  duration?: number;
  vulnerabilitiesFound?: number;
  toolsUsed?: string[];
}

// Valid scan statuses - extracted as module constant for reuse
const VALID_SCAN_STATUSES: Scan['status'][] = ['queued', 'running', 'completed', 'failed', 'paused'];

// Helper to validate scan status
function validateScanStatus(status: string): Scan['status'] {
  return VALID_SCAN_STATUSES.includes(status as Scan['status']) ? (status as Scan['status']) : 'queued';
}

// Helper to transform backend scan to frontend scan
function transformBackendScan(scan: BackendScan): Scan {
  return {
    id: scan.id,
    target: scan.target,
    type: scan.type || 'Standard',
    status: validateScanStatus(scan.status),
    progress: scan.progress || 0,
    currentPhase: scan.currentPhase || 'Initializing',
    phases: scan.phases || [
      { name: 'Phase 1: Reconnaissance', status: 'pending', progress: 0 },
      { name: 'Phase 2: Scanning', status: 'pending', progress: 0 },
      { name: 'Phase 3: Vulnerability Testing', status: 'pending', progress: 0 },
    ],
    startTime: scan.startTime ? new Date(scan.startTime) : new Date(),
    duration: scan.duration || 0,
    vulnerabilitiesFound: scan.vulnerabilitiesFound || 0,
    toolsUsed: scan.toolsUsed || [],
  };
}

// Mock scan data for demo mode
const MOCK_SCANS: Scan[] = [
  {
    id: '1',
    target: 'example.com',
    type: 'Comprehensive',
    status: 'running',
    progress: 78,
    currentPhase: 'Phase 2: Scanning',
    phases: [
      { name: 'Phase 1: Reconnaissance', status: 'completed', progress: 100, details: '45 subdomains found' },
      { name: 'Phase 2: Scanning', status: 'running', progress: 78, details: 'Service detection in progress' },
      { name: 'Phase 3: Vulnerability Testing', status: 'pending', progress: 0 },
    ],
    startTime: new Date(Date.now() - 12 * 60 * 1000),
    duration: 12,
    vulnerabilitiesFound: 3,
    toolsUsed: ['Nmap', 'Amass', 'Nuclei', 'Nikto'],
  },
  {
    id: '2',
    target: 'testsite.org',
    type: 'Quick',
    status: 'completed',
    progress: 100,
    currentPhase: 'Completed',
    phases: [
      { name: 'Phase 1: Reconnaissance', status: 'completed', progress: 100 },
      { name: 'Phase 2: Scanning', status: 'completed', progress: 100 },
      { name: 'Phase 3: Vulnerability Testing', status: 'completed', progress: 100 },
    ],
    startTime: new Date(Date.now() - 45 * 60 * 1000),
    duration: 35,
    vulnerabilitiesFound: 8,
    toolsUsed: ['Nmap', 'Gobuster', 'SQLMap'],
  },
  {
    id: '3',
    target: 'target.net',
    type: 'Deep',
    status: 'running',
    progress: 25,
    currentPhase: 'Phase 1: Reconnaissance',
    phases: [
      { name: 'Phase 1: Reconnaissance', status: 'running', progress: 75 },
      { name: 'Phase 2: Scanning', status: 'pending', progress: 0 },
      { name: 'Phase 3: Vulnerability Testing', status: 'pending', progress: 0 },
      { name: 'Phase 4: Exploitation', status: 'pending', progress: 0 },
    ],
    startTime: new Date(Date.now() - 8 * 60 * 1000),
    duration: 8,
    vulnerabilitiesFound: 1,
    toolsUsed: ['Amass', 'Subfinder', 'Masscan'],
  },
];

const ScansPage = () => {
  const mockDataEnabled = useAppSelector((state) => state.settings.developer.mockDataEnabled);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [exporterOpen, setExporterOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch scans from backend
  const fetchScansFromBackend = useCallback(async () => {
    if (mockDataEnabled) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.listScans();
      if (response.success && Array.isArray(response.data)) {
        const transformedScans = response.data.map((scan: BackendScan) => transformBackendScan(scan));
        setScans(transformedScans);
        if (transformedScans.length > 0 && !selectedScan) {
          setSelectedScan(transformedScans[0]);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch scans from backend:', error instanceof Error ? error.message : 'Unknown error');
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  }, [mockDataEnabled, selectedScan]);

  // Initialize scans based on mock data setting
  useEffect(() => {
    if (mockDataEnabled) {
      setScans(MOCK_SCANS);
      setSelectedScan(MOCK_SCANS[0]);
    } else {
      fetchScansFromBackend();
    }
  }, [mockDataEnabled, fetchScansFromBackend]);

  // Generate deterministic demo values based on scan ID
  const getDemoValues = (scanId: string) => {
    const hash = scanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      hosts: (hash % 10) + 5,
      ports: (hash % 50) + 20,
      services: (hash % 20) + 10,
    };
  };

  // Convert Scan to ScanData for export
  const convertToScanData = (scan: Scan): ScanData => {
    const demoValues = getDemoValues(scan.id);
    return {
      ...scan,
      results: {
        hosts: demoValues.hosts,
        ports: demoValues.ports,
        services: demoValues.services,
        vulnerabilities: [
          { severity: 'critical', title: 'SQL Injection in /admin/login' },
          { severity: 'high', title: 'XSS vulnerability in search form' },
          { severity: 'medium', title: 'Missing HTTPS redirect' },
        ].slice(0, scan.vulnerabilitiesFound),
      },
    };
  };

  // Convert scans for comparison tool
  const scansForComparison = useMemo(() => {
    return scans
      .filter((s) => s.status === 'completed')
      .map((scan) => {
        const demoValues = getDemoValues(scan.id);
        return {
          ...scan,
          results: {
            hosts: demoValues.hosts,
            ports: demoValues.ports,
            services: demoValues.services,
            vulnerabilities: [
              { id: 'vuln-1', severity: 'critical', title: 'SQL Injection', location: '/admin' },
              { id: 'vuln-2', severity: 'high', title: 'XSS Vulnerability', location: '/search' },
              { id: 'vuln-3', severity: 'medium', title: 'Missing Headers', location: '/' },
            ].slice(0, scan.vulnerabilitiesFound),
          },
        };
      });
  }, [scans]);

  // Handle new scan creation
  const handleCreateScan = async (scanConfig: { target: string; scanType: string; selectedTools: string[] }) => {
    if (!mockDataEnabled) {
      // Create scan via backend API
      try {
        const response = await apiClient.createScan({
          target: scanConfig.target,
          type: scanConfig.scanType,
          selectedTools: scanConfig.selectedTools,
        });
        
        if (response.success && response.data) {
          const newScan = transformBackendScan(response.data);
          setScans((prev) => [newScan, ...prev]);
          setSelectedScan(newScan);
          setSnackbar({
            open: true,
            message: `Scan started for ${scanConfig.target}`,
            severity: 'success',
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to create scan',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Failed to create scan:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error instanceof Error ? error.message : 'Failed to create scan'}`,
          severity: 'error',
        });
      }
    } else {
      // Demo mode: create local scan
      const newScan: Scan = {
        id: `scan-${Date.now()}`,
        target: scanConfig.target,
        type: scanConfig.scanType.charAt(0).toUpperCase() + scanConfig.scanType.slice(1),
        status: 'running',
        progress: 0,
        currentPhase: 'Phase 1: Reconnaissance',
        phases: [
          { name: 'Phase 1: Reconnaissance', status: 'running', progress: 0 },
          { name: 'Phase 2: Scanning', status: 'pending', progress: 0 },
          { name: 'Phase 3: Vulnerability Testing', status: 'pending', progress: 0 },
        ],
        startTime: new Date(),
        duration: 0,
        vulnerabilitiesFound: 0,
        toolsUsed: scanConfig.selectedTools,
      };

      setScans((prev) => [newScan, ...prev]);
      setSelectedScan(newScan);
      setSnackbar({
        open: true,
        message: `Scan started for ${scanConfig.target}`,
        severity: 'success',
      });
    }
  };

  // Simulate real-time progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setScans((prevScans) =>
        prevScans.map((scan) => {
          if (scan.status === 'running' && scan.progress < 100) {
            const newProgress = Math.min(scan.progress + Math.random() * 2, 100);
            return {
              ...scan,
              progress: newProgress,
              duration: scan.duration + 1,
            };
          }
          return scan;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  const getStatusColor = (status: Scan['status']): ChipColor => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Scan['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'running':
        return <AccessTimeIcon />;
      default:
        return null;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Info banner when demo mode is off */}
      {!mockDataEnabled && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          {isLoading 
            ? 'Loading scans from backend...' 
            : scans.length > 0 
              ? `Showing ${scans.length} scan(s) from the backend. Create a new scan to start!`
              : 'No scans found. Create a new scan to get started!'}
        </Alert>
      )}
      
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: { xs: 1.5, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          <RadarIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          Security Scans
        </Typography>
        <ButtonGroup variant="contained" size="small">
          <Button startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
            New Scan
          </Button>
          <Button
            startIcon={<CompareArrowsIcon />}
            onClick={() => setComparisonOpen(true)}
            disabled={scansForComparison.length < 2}
          >
            Compare
          </Button>
        </ButtonGroup>
      </Box>

      {/* Scan Creation Wizard */}
      <ScanCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={handleCreateScan}
      />

      {/* Scan Exporter */}
      <ScanExporter
        open={exporterOpen}
        onClose={() => setExporterOpen(false)}
        scan={selectedScan ? convertToScanData(selectedScan) : null}
        onExport={(_, filename) => {
          setSnackbar({
            open: true,
            message: `Exported: ${filename}`,
            severity: 'success',
          });
        }}
      />

      {/* Scan Comparison Tool */}
      <ScanComparisonTool
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        scans={scansForComparison}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Scans List */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ height: { xs: 'auto', md: '70vh' }, maxHeight: { xs: '50vh', md: '70vh' }, overflow: 'auto' }}>
            <List>
              {scans.map((scan, index) => (
                <Box key={scan.id}>
                  <ListItemButton
                    selected={selectedScan?.id === scan.id}
                    onClick={() => setSelectedScan(scan)}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {scan.target}
                          </Typography>
                          <Chip
                            label={scan.status}
                            size="small"
                            color={getStatusColor(scan.status)}
                            icon={getStatusIcon(scan.status) || undefined}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" display="block">
                            {scan.type} Scan • {formatDuration(scan.duration)} • {scan.vulnerabilitiesFound} vulns
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={scan.progress}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {scan.progress.toFixed(0)}% complete
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {index < scans.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Scan Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          {selectedScan ? (
            <Card sx={{ height: { xs: 'auto', md: '70vh' }, overflow: 'auto' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
                  mb: 3,
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: { xs: '1.1rem', sm: '1.5rem' },
                        wordBreak: 'break-all'
                      }}
                    >
                      {selectedScan.target}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedScan.type} Security Scan
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedScan.status.toUpperCase()}
                    color={getStatusColor(selectedScan.status)}
                    icon={getStatusIcon(selectedScan.status) || undefined}
                    size="small"
                  />
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedScan.currentPhase}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {selectedScan.progress.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={selectedScan.progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'action.hover',
                    }}
                  />
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {selectedScan.vulnerabilitiesFound}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Vulnerabilities
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {selectedScan.toolsUsed.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tools Used
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatDuration(selectedScan.duration)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duration
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Phases */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Scan Phases
                </Typography>
                {selectedScan.phases.map((phase, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {phase.status === 'completed' && <CheckCircleIcon color="success" />}
                      {phase.status === 'running' && <AccessTimeIcon color="primary" />}
                      {phase.status === 'pending' && <AccessTimeIcon color="disabled" />}
                      <Typography variant="body1" fontWeight={phase.status === 'running' ? 600 : 400}>
                        {phase.name}
                      </Typography>
                      <Chip
                        label={phase.status}
                        size="small"
                        color={phase.status === 'completed' ? 'success' : phase.status === 'running' ? 'primary' : 'default'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    {phase.details && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                        {phase.details}
                      </Typography>
                    )}
                    {phase.status !== 'pending' && (
                      <LinearProgress
                        variant="determinate"
                        value={phase.progress}
                        sx={{ ml: 4, mt: 1, height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                ))}

                {/* Tools Used */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                  Tools Used
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedScan.toolsUsed.map((tool) => (
                    <Chip key={tool} label={tool} variant="outlined" color="primary" />
                  ))}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {selectedScan.status === 'running' && (
                    <>
                      <Button variant="outlined" startIcon={<PauseIcon />}>
                        Pause
                      </Button>
                      <Button variant="outlined" color="error" startIcon={<StopIcon />}>
                        Stop
                      </Button>
                    </>
                  )}
                  {selectedScan.status === 'completed' && (
                    <>
                      <Button variant="contained" startIcon={<VisibilityIcon />}>
                        View Report
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => setExporterOpen(true)}
                      >
                        Export Results
                      </Button>
                    </>
                  )}
                  {selectedScan.status === 'paused' && (
                    <Button variant="contained" startIcon={<PlayArrowIcon />}>
                      Resume
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a scan to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScansPage;
