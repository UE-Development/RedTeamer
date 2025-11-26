/**
 * Reports Page - Security Report Generation & Management
 * Generate, preview, and download comprehensive security reports
 */

import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import GavelIcon from '@mui/icons-material/Gavel';
import type { ReportType, ReportFormat } from '../types';

interface ReportConfig {
  type: ReportType;
  target: string;
  scanDate: string;
  sections: {
    vulnerabilityDetails: boolean;
    riskAnalysis: boolean;
    remediationRecommendations: boolean;
    toolExecutionLogs: boolean;
    networkTopologyDiagram: boolean;
    executiveDashboard: boolean;
  };
  formats: ReportFormat[];
}

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  target: string;
  createdAt: string;
  size: string;
  formats: ReportFormat[];
  status: 'ready' | 'generating' | 'scheduled';
}

// Constants
const PROGRESS_INCREMENT_MAX = 15;
const PROGRESS_INTERVAL_MS = 300;

// Mock generated reports
const MOCK_REPORTS: GeneratedReport[] = [
  {
    id: '1',
    name: 'Comprehensive Security Assessment - example.com',
    type: 'comprehensive',
    target: 'example.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    size: '2.4 MB',
    formats: ['pdf', 'html', 'json'],
    status: 'ready',
  },
  {
    id: '2',
    name: 'Executive Summary - testsite.org',
    type: 'executive',
    target: 'testsite.org',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: '856 KB',
    formats: ['pdf'],
    status: 'ready',
  },
  {
    id: '3',
    name: 'Technical Report - api.secure.io',
    type: 'technical',
    target: 'api.secure.io',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: '4.1 MB',
    formats: ['pdf', 'html', 'json', 'markdown'],
    status: 'ready',
  },
  {
    id: '4',
    name: 'PCI-DSS Compliance Report - payment.corp.net',
    type: 'compliance',
    target: 'payment.corp.net',
    createdAt: new Date().toISOString(),
    size: '-',
    formats: ['pdf'],
    status: 'generating',
  },
];

const MOCK_TARGETS = [
  'example.com',
  'testsite.org',
  'api.secure.io',
  'payment.corp.net',
  'internal.company.net',
];

const ReportsPage = () => {
  const [reports, setReports] = useState<GeneratedReport[]>(MOCK_REPORTS);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [config, setConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    target: 'example.com',
    scanDate: new Date().toISOString().split('T')[0],
    sections: {
      vulnerabilityDetails: true,
      riskAnalysis: true,
      remediationRecommendations: true,
      toolExecutionLogs: true,
      networkTopologyDiagram: true,
      executiveDashboard: true,
    },
    formats: ['pdf', 'html'],
  });

  // Ref to store interval ID for cleanup
  const generationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reportTypeIcons: Record<ReportType, React.ReactNode> = {
    comprehensive: <SecurityIcon />,
    executive: <BusinessIcon />,
    technical: <StorageIcon />,
    compliance: <GavelIcon />,
  };

  const formatIcons: Record<ReportFormat, React.ReactNode> = {
    pdf: <PictureAsPdfIcon />,
    html: <CodeIcon />,
    json: <StorageIcon />,
    markdown: <ArticleIcon />,
  };

  const handleSectionChange = (section: keyof ReportConfig['sections']) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  };

  const handleFormatToggle = (format: ReportFormat) => {
    setConfig((prev) => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter((f) => f !== format)
        : [...prev.formats, format],
    }));
  };

  const handleGenerateReport = useCallback(() => {
    setGenerating(true);
    setGenerationProgress(0);

    // Clear any existing interval
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
    }

    generationIntervalRef.current = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          if (generationIntervalRef.current) {
            clearInterval(generationIntervalRef.current);
            generationIntervalRef.current = null;
          }
          setGenerating(false);

          // Add new report to list with crypto UUID for unique ID
          const newReport: GeneratedReport = {
            id: crypto.randomUUID(),
            name: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Report - ${config.target}`,
            type: config.type,
            target: config.target,
            createdAt: new Date().toISOString(),
            size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
            formats: config.formats,
            status: 'ready',
          };
          setReports((prevReports) => [newReport, ...prevReports]);
          return 100;
        }
        return prev + Math.random() * PROGRESS_INCREMENT_MAX;
      });
    }, PROGRESS_INTERVAL_MS);
  }, [config]);

  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Security Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Report Generator */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Generate Security Report
            </Typography>

            {/* Report Type */}
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Report Type
              </Typography>
              <RadioGroup
                value={config.type}
                onChange={(e) => setConfig((prev) => ({ ...prev, type: e.target.value as ReportType }))}
              >
                <FormControlLabel
                  value="comprehensive"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon fontSize="small" />
                      Comprehensive Security Assessment
                    </Box>
                  }
                />
                <FormControlLabel
                  value="executive"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      Executive Summary
                    </Box>
                  }
                />
                <FormControlLabel
                  value="technical"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon fontSize="small" />
                      Technical Details Only
                    </Box>
                  }
                />
                <FormControlLabel
                  value="compliance"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GavelIcon fontSize="small" />
                      Compliance Report (PCI-DSS, GDPR, etc.)
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Target & Date */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target</InputLabel>
                  <Select
                    value={config.target}
                    label="Target"
                    onChange={(e) => setConfig((prev) => ({ ...prev, target: e.target.value }))}
                  >
                    {MOCK_TARGETS.map((target) => (
                      <MenuItem key={target} value={target}>
                        {target}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Scan Date"
                  type="date"
                  size="small"
                  value={config.scanDate}
                  onChange={(e) => setConfig((prev) => ({ ...prev, scanDate: e.target.value }))}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Include Sections */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Include Sections
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.vulnerabilityDetails}
                    onChange={() => handleSectionChange('vulnerabilityDetails')}
                  />
                }
                label="Vulnerability Details"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.riskAnalysis}
                    onChange={() => handleSectionChange('riskAnalysis')}
                  />
                }
                label="Risk Analysis"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.remediationRecommendations}
                    onChange={() => handleSectionChange('remediationRecommendations')}
                  />
                }
                label="Remediation Recommendations"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.toolExecutionLogs}
                    onChange={() => handleSectionChange('toolExecutionLogs')}
                  />
                }
                label="Tool Execution Logs"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.networkTopologyDiagram}
                    onChange={() => handleSectionChange('networkTopologyDiagram')}
                  />
                }
                label="Network Topology Diagram"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.sections.executiveDashboard}
                    onChange={() => handleSectionChange('executiveDashboard')}
                  />
                }
                label="Executive Dashboard"
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            {/* Output Format */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Output Format
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {(['pdf', 'html', 'json', 'markdown'] as ReportFormat[]).map((format) => (
                <Chip
                  key={format}
                  icon={formatIcons[format] as React.ReactElement}
                  label={format.toUpperCase()}
                  onClick={() => handleFormatToggle(format)}
                  color={config.formats.includes(format) ? 'primary' : 'default'}
                  variant={config.formats.includes(format) ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>

            {/* Generation Progress */}
            {generating && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Generating report... {Math.round(generationProgress)}%
                </Typography>
                <LinearProgress variant="determinate" value={generationProgress} />
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={handleGenerateReport}
                disabled={generating || config.formats.length === 0}
                fullWidth
              >
                Generate Report
              </Button>
              <Button variant="outlined" startIcon={<VisibilityIcon />} disabled={generating}>
                Preview
              </Button>
              <Button variant="outlined" startIcon={<ScheduleIcon />} disabled={generating}>
                Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Generated Reports List */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Generated Reports ({reports.length})
            </Typography>

            {reports.length === 0 ? (
              <Alert severity="info">No reports generated yet. Create your first security report!</Alert>
            ) : (
              <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {reports.map((report, index) => (
                  <Box key={report.id}>
                    <ListItemButton
                      selected={selectedReport?.id === report.id}
                      onClick={() => setSelectedReport(report)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <ListItemIcon>{reportTypeIcons[report.type]}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {report.name}
                            </Typography>
                            {report.status === 'generating' && (
                              <Chip label="Generating..." size="small" color="warning" />
                            )}
                            {report.status === 'scheduled' && (
                              <Chip label="Scheduled" size="small" color="info" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {getTimeAgo(report.createdAt)}
                            </Typography>
                            {report.status === 'ready' && (
                              <Typography variant="caption" color="text.secondary">
                                {report.size}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {report.formats.map((format) => (
                                <Chip
                                  key={format}
                                  label={format.toUpperCase()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: 10 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {report.status === 'ready' && (
                          <>
                            <Tooltip title="Download">
                              <IconButton size="small" color="primary">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(report.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemButton>
                    {index < reports.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>

          {/* Selected Report Details */}
          {selectedReport && selectedReport.status === 'ready' && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated {getTimeAgo(selectedReport.createdAt)} • {selectedReport.size}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Ready"
                    color="success"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Download Options
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedReport.formats.map((format) => (
                    <Button
                      key={format}
                      variant="outlined"
                      startIcon={formatIcons[format] as React.ReactElement}
                      size="small"
                    >
                      Download {format.toUpperCase()}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
