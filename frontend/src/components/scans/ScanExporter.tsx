/**
 * Scan Exporter Component
 * Provides export functionality for scan results in multiple formats
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormGroup,
  Checkbox,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface ScanData {
  id: string;
  target: string;
  type: string;
  status: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  vulnerabilitiesFound: number;
  toolsUsed: string[];
  phases: Array<{
    name: string;
    status: string;
    progress: number;
    details?: string;
  }>;
  results?: {
    hosts?: number;
    ports?: number;
    services?: number;
    vulnerabilities?: Array<{
      severity: string;
      title: string;
      description?: string;
    }>;
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'html' | 'pdf';
  includeVulnerabilities: boolean;
  includeToolLogs: boolean;
  includeTimeline: boolean;
  includeRawData: boolean;
}

interface ScanExporterProps {
  open: boolean;
  onClose: () => void;
  scan: ScanData | null;
  onExport?: (data: string, filename: string) => void;
}

const ScanExporter = ({ open, onClose, scan, onExport }: ScanExporterProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeVulnerabilities: true,
    includeToolLogs: true,
    includeTimeline: true,
    includeRawData: false,
  });
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatIcons = {
    json: <CodeIcon />,
    csv: <TableChartIcon />,
    html: <DescriptionIcon />,
    pdf: <PictureAsPdfIcon />,
  };

  const formatDescriptions = {
    json: 'Structured data format, ideal for programmatic processing',
    csv: 'Spreadsheet format, compatible with Excel and data analysis tools',
    html: 'Interactive web report with styling and navigation',
    pdf: 'Professional document format for sharing and printing',
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, format: event.target.value as ExportOptions['format'] });
    setExportComplete(false);
    setError(null);
  };

  const handleOptionChange = (option: keyof ExportOptions) => {
    if (option === 'format') return;
    setOptions({ ...options, [option]: !options[option] });
    setExportComplete(false);
    setError(null);
  };

  const generateJSONExport = (scanData: ScanData, exportOptions: ExportOptions): string => {
    const exportData: Record<string, unknown> = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        format: 'JSON',
        version: '1.0',
      },
      scan: {
        id: scanData.id,
        target: scanData.target,
        type: scanData.type,
        status: scanData.status,
        progress: scanData.progress,
        startTime: scanData.startTime,
        endTime: scanData.endTime,
        duration: scanData.duration,
        toolsUsed: scanData.toolsUsed,
      },
    };

    if (exportOptions.includeVulnerabilities && scanData.results?.vulnerabilities) {
      exportData.vulnerabilities = scanData.results.vulnerabilities;
    }

    if (exportOptions.includeTimeline) {
      exportData.timeline = scanData.phases;
    }

    if (exportOptions.includeRawData && scanData.results) {
      exportData.rawData = scanData.results;
    }

    return JSON.stringify(exportData, null, 2);
  };

  const generateCSVExport = (scanData: ScanData, exportOptions: ExportOptions): string => {
    const lines: string[] = [];

    // Header section
    lines.push('Scan Export Report');
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push('');

    // Scan info
    lines.push('Scan Information');
    lines.push('Field,Value');
    lines.push(`ID,${scanData.id}`);
    lines.push(`Target,${scanData.target}`);
    lines.push(`Type,${scanData.type}`);
    lines.push(`Status,${scanData.status}`);
    lines.push(`Progress,${scanData.progress}%`);
    lines.push(`Duration,${scanData.duration} minutes`);
    lines.push(`Tools Used,"${scanData.toolsUsed.join(', ')}"`);
    lines.push('');

    if (exportOptions.includeTimeline) {
      lines.push('Scan Phases');
      lines.push('Phase,Status,Progress,Details');
      scanData.phases.forEach((phase) => {
        lines.push(`"${phase.name}",${phase.status},${phase.progress}%,"${phase.details || ''}"`);
      });
      lines.push('');
    }

    if (exportOptions.includeVulnerabilities && scanData.results?.vulnerabilities) {
      lines.push('Vulnerabilities');
      lines.push('Severity,Title,Description');
      scanData.results.vulnerabilities.forEach((vuln) => {
        lines.push(`${vuln.severity},"${vuln.title}","${vuln.description || ''}"`);
      });
    }

    return lines.join('\n');
  };

  const generateHTMLExport = (scanData: ScanData, exportOptions: ExportOptions): string => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan Report - ${scanData.target}</title>
    <style>
        :root {
            --primary: #b71c1c;
            --primary-light: #ff5252;
            --bg-dark: #0a0a0a;
            --bg-card: #1a1a1a;
            --text: #fffde7;
            --text-secondary: #b0bec5;
            --success: #00ff41;
            --warning: #ff9800;
            --error: #ff5252;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            background: var(--bg-dark);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
        }
        
        .container { max-width: 1200px; margin: 0 auto; }
        
        .header {
            text-align: center;
            padding: 2rem;
            border-bottom: 2px solid var(--primary);
            margin-bottom: 2rem;
        }
        
        .header h1 {
            color: var(--primary);
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .card {
            background: var(--bg-card);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--primary);
        }
        
        .card h2 {
            color: var(--primary-light);
            border-bottom: 1px solid var(--primary);
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .info-item label {
            color: var(--text-secondary);
            display: block;
            font-size: 0.875rem;
        }
        
        .info-item span {
            font-size: 1.125rem;
            font-weight: bold;
        }
        
        .progress-bar {
            background: #333;
            border-radius: 4px;
            height: 10px;
            overflow: hidden;
            margin-top: 0.5rem;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
            height: 100%;
            transition: width 0.3s;
        }
        
        .phase-list { list-style: none; }
        
        .phase-item {
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: rgba(183, 28, 28, 0.1);
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .phase-status {
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        
        .status-completed { background: var(--success); color: #000; }
        .status-running { background: var(--primary); color: #fff; }
        .status-pending { background: #333; color: var(--text-secondary); }
        
        .vuln-card {
            border-left: 4px solid;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .severity-critical { border-color: #ff0000; }
        .severity-high { border-color: var(--error); }
        .severity-medium { border-color: var(--warning); }
        .severity-low { border-color: #ffeb3b; }
        .severity-info { border-color: #00bcd4; }
        
        .tools-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .tool-tag {
            background: var(--primary);
            color: var(--text);
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 HexStrike AI Scan Report</h1>
            <p>Security Assessment for <strong>${scanData.target}</strong></p>
            <p style="color: var(--text-secondary);">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card">
            <h2>📊 Scan Overview</h2>
            <div class="info-grid">
                <div class="info-item">
                    <label>Target</label>
                    <span>${scanData.target}</span>
                </div>
                <div class="info-item">
                    <label>Scan Type</label>
                    <span>${scanData.type}</span>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <span style="color: ${scanData.status === 'completed' ? 'var(--success)' : 'var(--primary)'}">${scanData.status.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <label>Duration</label>
                    <span>${scanData.duration} minutes</span>
                </div>
                <div class="info-item">
                    <label>Vulnerabilities Found</label>
                    <span style="color: var(--error)">${scanData.vulnerabilitiesFound}</span>
                </div>
                <div class="info-item">
                    <label>Progress</label>
                    <span>${scanData.progress}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${scanData.progress}%"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🛠️ Tools Used</h2>
            <div class="tools-list">
                ${scanData.toolsUsed.map((tool) => `<span class="tool-tag">${tool}</span>`).join('')}
            </div>
        </div>
        
        ${
          exportOptions.includeTimeline
            ? `
        <div class="card">
            <h2>📈 Scan Timeline</h2>
            <ul class="phase-list">
                ${scanData.phases
                  .map(
                    (phase) => `
                    <li class="phase-item">
                        <div>
                            <strong>${phase.name}</strong>
                            ${phase.details ? `<p style="color: var(--text-secondary); font-size: 0.875rem;">${phase.details}</p>` : ''}
                        </div>
                        <span class="phase-status status-${phase.status}">${phase.status}</span>
                    </li>
                `
                  )
                  .join('')}
            </ul>
        </div>
        `
            : ''
        }
        
        ${
          exportOptions.includeVulnerabilities && scanData.results?.vulnerabilities
            ? `
        <div class="card">
            <h2>🚨 Vulnerabilities</h2>
            ${scanData.results.vulnerabilities
              .map(
                (vuln) => `
                <div class="vuln-card severity-${vuln.severity.toLowerCase()}">
                    <strong>${vuln.title}</strong>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                        Severity: <span style="text-transform: uppercase; color: var(--error)">${vuln.severity}</span>
                    </p>
                    ${vuln.description ? `<p style="margin-top: 0.5rem;">${vuln.description}</p>` : ''}
                </div>
            `
              )
              .join('')}
        </div>
        `
            : ''
        }
        
        <div class="footer">
            <p>Generated by HexStrike AI v6.0 | Offensive Security Platform</p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  };

  const handleExport = async () => {
    if (!scan) {
      setError('No scan data available to export');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let content: string;
      let mimeType: string;
      let extension: string;

      switch (options.format) {
        case 'json':
          content = generateJSONExport(scan, options);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          content = generateCSVExport(scan, options);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'html':
          content = generateHTMLExport(scan, options);
          mimeType = 'text/html';
          extension = 'html';
          break;
        case 'pdf':
          // For PDF, we generate HTML and let the user print to PDF
          content = generateHTMLExport(scan, options);
          mimeType = 'text/html';
          extension = 'html';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const filename = `scan-report-${scan.target.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.${extension}`;

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Callback for parent component
      onExport?.(content, filename);

      setExportComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    setExportComplete(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" />
          Export Scan Results
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!scan ? (
          <Alert severity="warning">No scan selected for export</Alert>
        ) : (
          <>
            {/* Scan Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Exporting scan for:
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {scan.target}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scan.type} Scan • {scan.vulnerabilitiesFound} vulnerabilities found
              </Typography>
            </Paper>

            {/* Export Format Selection */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Export Format
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <RadioGroup value={options.format} onChange={handleFormatChange}>
                <List>
                  {(['json', 'csv', 'html', 'pdf'] as const).map((format) => (
                    <ListItem
                      key={format}
                      sx={{
                        border: 1,
                        borderColor: options.format === format ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: options.format === format ? 'action.selected' : 'transparent',
                      }}
                    >
                      <ListItemIcon>{formatIcons[format]}</ListItemIcon>
                      <FormControlLabel
                        value={format}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                              {format}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDescriptions[format]}
                            </Typography>
                          </Box>
                        }
                        sx={{ flex: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Export Options */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Include in Export
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeVulnerabilities}
                    onChange={() => handleOptionChange('includeVulnerabilities')}
                  />
                }
                label="Vulnerability Details"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeToolLogs}
                    onChange={() => handleOptionChange('includeToolLogs')}
                  />
                }
                label="Tool Execution Logs"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeTimeline}
                    onChange={() => handleOptionChange('includeTimeline')}
                  />
                }
                label="Scan Timeline & Phases"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeRawData}
                    onChange={() => handleOptionChange('includeRawData')}
                  />
                }
                label="Raw Scan Data (Advanced)"
              />
            </FormGroup>

            {/* Progress / Status */}
            {exporting && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Generating export...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {exportComplete && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 3 }}>
                Export completed successfully! The file has been downloaded.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={!scan || exporting}
          startIcon={<DownloadIcon />}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanExporter;
