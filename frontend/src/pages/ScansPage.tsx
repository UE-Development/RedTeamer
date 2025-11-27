/**
 * Scans Page - Real-time Scan Monitoring
 * Live monitoring and management of security scans
 */

import { useState, useEffect } from 'react';
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
import { ScanCreationWizard } from '../components/scans';

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

// Mock scan data
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
  const [scans, setScans] = useState<Scan[]>(MOCK_SCANS);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(scans[0]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle new scan creation
  const handleCreateScan = (scanConfig: { target: string; scanType: string; selectedTools: string[] }) => {
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

  const getStatusColor = (status: Scan['status']) => {
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
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <RadarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Security Scans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
          New Scan
        </Button>
      </Box>

      {/* Scan Creation Wizard */}
      <ScanCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={handleCreateScan}
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

      <Grid container spacing={3}>
        {/* Scans List */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ height: '70vh', overflow: 'auto' }}>
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
                            color={getStatusColor(scan.status) as any}
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
            <Card sx={{ height: '70vh', overflow: 'auto' }}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedScan.target}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedScan.type} Security Scan
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedScan.status.toUpperCase()}
                    color={getStatusColor(selectedScan.status) as any}
                    icon={getStatusIcon(selectedScan.status) || undefined}
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
                      <Button variant="outlined" startIcon={<DownloadIcon />}>
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
