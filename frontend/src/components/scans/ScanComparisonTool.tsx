/**
 * Scan Comparison Tool Component
 * Compare two scans side-by-side to analyze security changes over time
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface ScanForComparison {
  id: string;
  target: string;
  type: string;
  status: string;
  startTime: Date;
  duration: number;
  vulnerabilitiesFound: number;
  toolsUsed: string[];
  results?: {
    hosts?: number;
    ports?: number;
    services?: number;
    vulnerabilities?: Array<{
      id: string;
      severity: string;
      title: string;
      location?: string;
    }>;
  };
}

interface ScanComparisonToolProps {
  open: boolean;
  onClose: () => void;
  scans: ScanForComparison[];
  initialScanA?: string;
  initialScanB?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const ScanComparisonTool = ({
  open,
  onClose,
  scans,
  initialScanA,
  initialScanB,
}: ScanComparisonToolProps) => {
  const [scanAId, setScanAId] = useState<string>(initialScanA || '');
  const [scanBId, setScanBId] = useState<string>(initialScanB || '');
  const [activeTab, setActiveTab] = useState(0);

  const scanA = useMemo(() => scans.find((s) => s.id === scanAId), [scans, scanAId]);
  const scanB = useMemo(() => scans.find((s) => s.id === scanBId), [scans, scanBId]);

  const comparisonData = useMemo(() => {
    if (!scanA || !scanB) return null;

    // Calculate differences
    const vulnDiff = scanB.vulnerabilitiesFound - scanA.vulnerabilitiesFound;
    const durationDiff = scanB.duration - scanA.duration;
    const hostsDiff = (scanB.results?.hosts || 0) - (scanA.results?.hosts || 0);
    const portsDiff = (scanB.results?.ports || 0) - (scanA.results?.ports || 0);
    const servicesDiff = (scanB.results?.services || 0) - (scanA.results?.services || 0);

    // Find new, removed, and common vulnerabilities
    const vulnsA = new Set(scanA.results?.vulnerabilities?.map((v) => v.id) || []);
    const vulnsB = new Set(scanB.results?.vulnerabilities?.map((v) => v.id) || []);

    const newVulns =
      scanB.results?.vulnerabilities?.filter((v) => !vulnsA.has(v.id)) || [];
    const removedVulns =
      scanA.results?.vulnerabilities?.filter((v) => !vulnsB.has(v.id)) || [];
    const commonVulns =
      scanA.results?.vulnerabilities?.filter((v) => vulnsB.has(v.id)) || [];

    // Find new and removed tools
    const toolsA = new Set(scanA.toolsUsed);
    const toolsB = new Set(scanB.toolsUsed);
    const newTools = scanB.toolsUsed.filter((t) => !toolsA.has(t));
    const removedTools = scanA.toolsUsed.filter((t) => !toolsB.has(t));

    return {
      vulnDiff,
      durationDiff,
      hostsDiff,
      portsDiff,
      servicesDiff,
      newVulns,
      removedVulns,
      commonVulns,
      newTools,
      removedTools,
      totalVulnsA: scanA.vulnerabilitiesFound,
      totalVulnsB: scanB.vulnerabilitiesFound,
    };
  }, [scanA, scanB]);

  const handleScanAChange = (event: SelectChangeEvent<string>) => {
    setScanAId(event.target.value);
  };

  const handleScanBChange = (event: SelectChangeEvent<string>) => {
    setScanBId(event.target.value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getTrendIcon = (diff: number) => {
    if (diff > 0)
      return <TrendingUpIcon color="error" fontSize="small" />;
    if (diff < 0)
      return <TrendingDownIcon color="success" fontSize="small" />;
    return <RemoveIcon color="disabled" fontSize="small" />;
  };

  const getDiffColor = (diff: number, inverse = false) => {
    if (diff === 0) return 'text.secondary';
    const isPositive = diff > 0;
    if (inverse) {
      return isPositive ? 'error.main' : 'success.main';
    }
    return isPositive ? 'success.main' : 'error.main';
  };

  const renderMetricRow = (
    label: string,
    valueA: number,
    valueB: number,
    diff: number,
    inverse = false
  ) => (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell align="center">{valueA}</TableCell>
      <TableCell align="center">{valueB}</TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ color: getDiffColor(diff, inverse), fontWeight: 600 }}
          >
            {diff > 0 ? '+' : ''}
            {diff}
          </Typography>
          {inverse ? (
            diff > 0 ? (
              <ArrowUpwardIcon color="error" fontSize="small" />
            ) : diff < 0 ? (
              <ArrowDownwardIcon color="success" fontSize="small" />
            ) : null
          ) : (
            getTrendIcon(diff)
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrowsIcon color="primary" />
          Scan Comparison Tool
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Scan Selection */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth>
              <InputLabel>Baseline Scan (Before)</InputLabel>
              <Select value={scanAId} onChange={handleScanAChange} label="Baseline Scan (Before)">
                {scans.map((scan) => (
                  <MenuItem key={scan.id} value={scan.id} disabled={scan.id === scanBId}>
                    {scan.target} - {formatDate(scan.startTime)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{ xs: 12, md: 2 }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CompareArrowsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth>
              <InputLabel>Comparison Scan (After)</InputLabel>
              <Select value={scanBId} onChange={handleScanBChange} label="Comparison Scan (After)">
                {scans.map((scan) => (
                  <MenuItem key={scan.id} value={scan.id} disabled={scan.id === scanAId}>
                    {scan.target} - {formatDate(scan.startTime)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {!scanA || !scanB ? (
          <Alert severity="info">Select two scans to compare their results</Alert>
        ) : scanA.target !== scanB.target ? (
          <Alert severity="warning">
            Warning: These scans are for different targets ({scanA.target} vs {scanB.target}). The
            comparison may not be meaningful.
          </Alert>
        ) : null}

        {scanA && scanB && comparisonData && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: comparisonData.vulnDiff > 0 ? 'error.dark' : comparisonData.vulnDiff < 0 ? 'success.dark' : 'background.default',
                  }}
                >
                  <BugReportIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4">
                    {comparisonData.vulnDiff > 0 ? '+' : ''}
                    {comparisonData.vulnDiff}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vulnerability Change
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                  <Typography variant="h4">{comparisonData.newVulns.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Vulnerabilities
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <TimelineIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                  <Typography variant="h4">{comparisonData.removedVulns.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved Vulnerabilities
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabs for Detailed Comparison */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              <Tab label="Overview" />
              <Tab label="Vulnerabilities" />
              <Tab label="Tools" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={activeTab} index={0}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="center">Baseline</TableCell>
                      <TableCell align="center">Comparison</TableCell>
                      <TableCell align="center">Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderMetricRow(
                      'Vulnerabilities',
                      comparisonData.totalVulnsA,
                      comparisonData.totalVulnsB,
                      comparisonData.vulnDiff,
                      true
                    )}
                    {renderMetricRow(
                      'Scan Duration (min)',
                      scanA.duration,
                      scanB.duration,
                      comparisonData.durationDiff
                    )}
                    {renderMetricRow(
                      'Hosts Discovered',
                      scanA.results?.hosts || 0,
                      scanB.results?.hosts || 0,
                      comparisonData.hostsDiff
                    )}
                    {renderMetricRow(
                      'Open Ports',
                      scanA.results?.ports || 0,
                      scanB.results?.ports || 0,
                      comparisonData.portsDiff
                    )}
                    {renderMetricRow(
                      'Services Identified',
                      scanA.results?.services || 0,
                      scanB.results?.services || 0,
                      comparisonData.servicesDiff
                    )}
                    {renderMetricRow(
                      'Tools Used',
                      scanA.toolsUsed.length,
                      scanB.toolsUsed.length,
                      scanB.toolsUsed.length - scanA.toolsUsed.length
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Security Posture */}
              <Paper sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Security Posture Change
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Baseline: {comparisonData.totalVulnsA} vulnerabilities
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, comparisonData.totalVulnsA * 5)}
                      color="error"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <CompareArrowsIcon />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Comparison: {comparisonData.totalVulnsB} vulnerabilities
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, comparisonData.totalVulnsB * 5)}
                      color={comparisonData.vulnDiff > 0 ? 'error' : 'success'}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
              </Paper>
            </TabPanel>

            {/* Vulnerabilities Tab */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                {/* New Vulnerabilities */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, borderLeft: 4, borderColor: 'error.main' }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                      New Vulnerabilities ({comparisonData.newVulns.length})
                    </Typography>
                    {comparisonData.newVulns.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No new vulnerabilities found
                      </Typography>
                    ) : (
                      comparisonData.newVulns.map((vuln) => (
                        <Box key={vuln.id} sx={{ mb: 1 }}>
                          <Chip
                            label={vuln.severity.toUpperCase()}
                            size="small"
                            color={
                              vuln.severity === 'critical'
                                ? 'error'
                                : vuln.severity === 'high'
                                  ? 'error'
                                  : vuln.severity === 'medium'
                                    ? 'warning'
                                    : 'info'
                            }
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" component="span">
                            {vuln.title}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>

                {/* Resolved Vulnerabilities */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, borderLeft: 4, borderColor: 'success.main' }}>
                    <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                      Resolved Vulnerabilities ({comparisonData.removedVulns.length})
                    </Typography>
                    {comparisonData.removedVulns.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No vulnerabilities were resolved
                      </Typography>
                    ) : (
                      comparisonData.removedVulns.map((vuln) => (
                        <Box key={vuln.id} sx={{ mb: 1 }}>
                          <Chip
                            label={vuln.severity.toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            {vuln.title}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>

                {/* Persistent Vulnerabilities */}
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, borderLeft: 4, borderColor: 'warning.main' }}>
                    <Typography variant="h6" color="warning.main" sx={{ mb: 2 }}>
                      Persistent Vulnerabilities ({comparisonData.commonVulns.length})
                    </Typography>
                    {comparisonData.commonVulns.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No persistent vulnerabilities
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {comparisonData.commonVulns.map((vuln) => (
                          <Chip
                            key={vuln.id}
                            label={vuln.title}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tools Tab */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Baseline Scan Tools
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {scanA.toolsUsed.map((tool) => (
                        <Chip
                          key={tool}
                          label={tool}
                          color={comparisonData.removedTools.includes(tool) ? 'default' : 'primary'}
                          variant={comparisonData.removedTools.includes(tool) ? 'outlined' : 'filled'}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Comparison Scan Tools
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {scanB.toolsUsed.map((tool) => (
                        <Chip
                          key={tool}
                          label={tool}
                          color={comparisonData.newTools.includes(tool) ? 'success' : 'primary'}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {(comparisonData.newTools.length > 0 || comparisonData.removedTools.length > 0) && (
                  <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Tool Changes
                      </Typography>
                      {comparisonData.newTools.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                            Added Tools:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {comparisonData.newTools.map((tool) => (
                              <Chip key={tool} label={tool} color="success" size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {comparisonData.removedTools.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                            Removed Tools:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {comparisonData.removedTools.map((tool) => (
                              <Chip key={tool} label={tool} color="error" size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {scanA && scanB && (
          <Button variant="contained" startIcon={<CompareArrowsIcon />}>
            Export Comparison
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ScanComparisonTool;
