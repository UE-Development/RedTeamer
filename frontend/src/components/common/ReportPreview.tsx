/**
 * Report Preview Component
 * Preview security reports before downloading
 * Sprint 11 Feature - Report Preview System
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import type { ReportType, ReportFormat } from '../../types';

/**
 * Report data structure for preview
 */
export interface ReportPreviewData {
  id: string;
  type: ReportType;
  target: string;
  scanDate: string;
  generatedAt: string;
  sections: {
    vulnerabilityDetails: boolean;
    riskAnalysis: boolean;
    remediationRecommendations: boolean;
    toolExecutionLogs: boolean;
    networkTopologyDiagram: boolean;
    executiveDashboard: boolean;
  };
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    hostsScanned: number;
    portsDiscovered: number;
    servicesIdentified: number;
    riskScore: number;
  };
  vulnerabilities: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    location: string;
    cvss?: number;
    cve?: string;
    remediation?: string;
  }>;
  toolsUsed: string[];
  formats: ReportFormat[];
}

interface ReportPreviewProps {
  open: boolean;
  onClose: () => void;
  report: ReportPreviewData | null;
  onDownload?: (format: ReportFormat) => void;
  onPrint?: () => void;
}

type PreviewTab = 'summary' | 'vulnerabilities' | 'technical' | 'full';

const severityColors: Record<string, string> = {
  critical: '#b71c1c',
  high: '#ff5252',
  medium: '#ff9800',
  low: '#ffc107',
  info: '#2196f3',
};

const severityIcons: Record<string, React.ReactNode> = {
  critical: <ErrorIcon fontSize="small" sx={{ color: severityColors.critical }} />,
  high: <WarningIcon fontSize="small" sx={{ color: severityColors.high }} />,
  medium: <WarningIcon fontSize="small" sx={{ color: severityColors.medium }} />,
  low: <InfoIcon fontSize="small" sx={{ color: severityColors.low }} />,
  info: <InfoIcon fontSize="small" sx={{ color: severityColors.info }} />,
};

/**
 * Report Preview Component
 */
const ReportPreview: React.FC<ReportPreviewProps> = ({
  open,
  onClose,
  report,
  onDownload,
  onPrint,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<PreviewTab>('summary');
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  // Calculate risk level based on score
  const riskLevel = useMemo(() => {
    if (!report) return { level: 'unknown', color: 'grey' };
    const score = report.summary.riskScore;
    if (score >= 80) return { level: 'Critical', color: severityColors.critical };
    if (score >= 60) return { level: 'High', color: severityColors.high };
    if (score >= 40) return { level: 'Medium', color: severityColors.medium };
    if (score >= 20) return { level: 'Low', color: severityColors.low };
    return { level: 'Minimal', color: '#4caf50' };
  }, [report]);

  // Group vulnerabilities by severity
  const vulnsBySeverity = useMemo(() => {
    if (!report) return {};
    return report.vulnerabilities.reduce((acc, vuln) => {
      if (!acc[vuln.severity]) acc[vuln.severity] = [];
      acc[vuln.severity].push(vuln);
      return acc;
    }, {} as Record<string, typeof report.vulnerabilities>);
  }, [report]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const toggleFullscreen = () => setFullscreen((prev) => !prev);

  if (!report) return null;

  const reportTypeLabel = {
    comprehensive: 'Comprehensive Security Assessment',
    executive: 'Executive Summary',
    technical: 'Technical Report',
    compliance: 'Compliance Report',
  }[report.type];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          height: fullscreen ? '100vh' : '90vh',
          maxHeight: fullscreen ? '100vh' : '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6">Report Preview</Typography>
          <Chip label={reportTypeLabel} size="small" color="primary" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Zoom Controls */}
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
            {zoom}%
          </Typography>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 150}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Toggle Fullscreen">
            <IconButton size="small" onClick={toggleFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton size="small" onClick={onPrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Preview Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<SecurityIcon />} label="Summary" value="summary" iconPosition="start" />
          <Tab icon={<BugReportIcon />} label="Vulnerabilities" value="vulnerabilities" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Technical Details" value="technical" iconPosition="start" />
          <Tab icon={<DescriptionIcon />} label="Full Report" value="full" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          overflow: 'auto',
          p: 2,
        }}
      >
        <Box
          sx={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
          }}
        >
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
              {/* Report Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {reportTypeLabel}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {report.target}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Scan Date: {new Date(report.scanDate).toLocaleDateString()} | Generated: {new Date(report.generatedAt).toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Risk Score */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Overall Risk Score</Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: `6px solid ${riskLevel.color}`,
                    boxShadow: `0 0 20px ${riskLevel.color}40`,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: riskLevel.color }}>
                      {report.summary.riskScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / 100
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 2, fontWeight: 600, color: riskLevel.color }}
                >
                  {riskLevel.level} Risk
                </Typography>
              </Box>

              {/* Summary Stats */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {report.summary.totalVulnerabilities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vulnerabilities
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {report.summary.hostsScanned}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hosts Scanned
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {report.summary.portsDiscovered}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open Ports
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {report.summary.servicesIdentified}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Services
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Severity Breakdown */}
              <Typography variant="h6" sx={{ mb: 2 }}>Vulnerability Severity Breakdown</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {['critical', 'high', 'medium', 'low', 'info'].map((severity) => {
                  const count = report.summary[`${severity}Count` as keyof typeof report.summary] as number;
                  if (count === 0 && severity !== 'info') return null;
                  return (
                    <Chip
                      key={severity}
                      icon={severityIcons[severity] as React.ReactElement}
                      label={`${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`}
                      sx={{
                        bgcolor: count > 0 ? severityColors[severity] : 'action.hover',
                        color: count > 0 && severity !== 'low' ? 'white' : 'inherit',
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </Box>

              {/* Tools Used */}
              <Typography variant="h6" sx={{ mb: 2 }}>Tools Used</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {report.toolsUsed.map((tool) => (
                  <Chip key={tool} label={tool} variant="outlined" size="small" />
                ))}
              </Box>
            </Paper>
          )}

          {/* Vulnerabilities Tab */}
          {activeTab === 'vulnerabilities' && (
            <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Discovered Vulnerabilities ({report.vulnerabilities.length})
              </Typography>

              {['critical', 'high', 'medium', 'low', 'info'].map((severity) => {
                const vulns = vulnsBySeverity[severity];
                if (!vulns || vulns.length === 0) return null;

                return (
                  <Box key={severity} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {severityIcons[severity]}
                      <Typography variant="h6" sx={{ fontWeight: 600, color: severityColors[severity] }}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)} ({vulns.length})
                      </Typography>
                    </Box>

                    {vulns.map((vuln) => (
                      <Paper
                        key={vuln.id}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderLeft: 4,
                          borderColor: severityColors[severity],
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {vuln.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {vuln.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📍 {vuln.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                            {vuln.cvss !== undefined && (
                              <Chip label={`CVSS: ${vuln.cvss}`} size="small" color="error" />
                            )}
                            {vuln.cve && (
                              <Chip label={vuln.cve} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                        {vuln.remediation && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.main', borderRadius: 1, color: 'white' }}>
                            <Typography variant="body2">
                              <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              <strong>Remediation:</strong> {vuln.remediation}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                );
              })}
            </Paper>
          )}

          {/* Technical Details Tab */}
          {activeTab === 'technical' && (
            <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Technical Details
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>Scan Configuration</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Target" secondary={report.target} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Scan Date" secondary={new Date(report.scanDate).toLocaleString()} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Report Type" secondary={reportTypeLabel} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Tools Used" secondary={report.toolsUsed.join(', ')} />
                </ListItem>
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Included Sections</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(report.sections).map(([key, enabled]) => (
                  <Chip
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    color={enabled ? 'success' : 'default'}
                    variant={enabled ? 'filled' : 'outlined'}
                    icon={enabled ? <CheckCircleIcon /> : undefined}
                    size="small"
                  />
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Available Formats</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {report.formats.map((format) => (
                  <Button
                    key={format}
                    variant="outlined"
                    size="small"
                    onClick={() => onDownload?.(format)}
                    startIcon={<DownloadIcon />}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </Box>
            </Paper>
          )}

          {/* Full Report Tab */}
          {activeTab === 'full' && (
            <Paper
              sx={{
                p: 4,
                maxWidth: 900,
                mx: 'auto',
                fontFamily: 'Georgia, serif',
                bgcolor: 'background.paper',
              }}
            >
              {/* Cover Page */}
              <Box sx={{ textAlign: 'center', mb: 6, pb: 6, borderBottom: 2, borderColor: 'primary.main' }}>
                <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  Security Assessment Report
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                  {report.target}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {reportTypeLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </Typography>
              </Box>

              {/* Table of Contents */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Table of Contents</Typography>
                <List dense>
                  <ListItem><ListItemText primary="1. Executive Summary" /></ListItem>
                  <ListItem><ListItemText primary="2. Risk Assessment" /></ListItem>
                  <ListItem><ListItemText primary="3. Vulnerability Findings" /></ListItem>
                  <ListItem><ListItemText primary="4. Remediation Recommendations" /></ListItem>
                  <ListItem><ListItemText primary="5. Technical Appendix" /></ListItem>
                </List>
              </Box>

              {/* Executive Summary */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>1. Executive Summary</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This security assessment was conducted on <strong>{report.target}</strong> on {new Date(report.scanDate).toLocaleDateString()}. 
                  The assessment identified <strong>{report.summary.totalVulnerabilities}</strong> vulnerabilities across{' '}
                  <strong>{report.summary.hostsScanned}</strong> hosts.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Of these vulnerabilities, <strong style={{ color: severityColors.critical }}>{report.summary.criticalCount} are critical</strong> and{' '}
                  <strong style={{ color: severityColors.high }}>{report.summary.highCount} are high severity</strong>, requiring immediate attention.
                </Typography>
                <Typography variant="body1">
                  The overall risk score is <strong style={{ color: riskLevel.color }}>{report.summary.riskScore}/100 ({riskLevel.level})</strong>.
                </Typography>
              </Box>

              {/* More sections would follow in a real implementation */}
              <Box sx={{ textAlign: 'center', py: 4, borderTop: 1, borderColor: 'divider', mt: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Report generated by HexStrike AI v6.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This document contains confidential information. Handle according to your organization's security policies.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Box sx={{ flex: 1 }} />
        {report.formats.map((format) => (
          <Button
            key={format}
            variant={format === 'pdf' ? 'contained' : 'outlined'}
            startIcon={<DownloadIcon />}
            onClick={() => onDownload?.(format)}
          >
            Download {format.toUpperCase()}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ReportPreview;
