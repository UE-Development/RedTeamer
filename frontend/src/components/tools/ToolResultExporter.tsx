/**
 * Tool Result Exporter Component
 * Export tool execution results in multiple formats
 * Sprint 6 Feature - Tool Result Exporters
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  Paper,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import type { ParsedToolOutput } from './ToolOutputParser';

export type ExportFormat = 'json' | 'csv' | 'html' | 'markdown' | 'xml';

export interface ToolExportOptions {
  format: ExportFormat;
  includeSummary: boolean;
  includeHosts: boolean;
  includeVulnerabilities: boolean;
  includeRawOutput: boolean;
  includeMetadata: boolean;
  filename: string;
}

interface ToolResultExporterProps {
  open: boolean;
  onClose: () => void;
  toolOutput: ParsedToolOutput | null;
  onExport?: (format: ExportFormat, filename: string) => void;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  json: <DataObjectIcon />,
  csv: <TableChartIcon />,
  html: <CodeIcon />,
  markdown: <ArticleIcon />,
  xml: <CodeIcon />,
};

const formatDescriptions: Record<ExportFormat, string> = {
  json: 'Machine-readable JSON format with full data structure',
  csv: 'Tabular format compatible with Excel and other spreadsheets',
  html: 'Web-ready HTML report with styling',
  markdown: 'Documentation-friendly Markdown format',
  xml: 'Standard XML format for integration with other tools',
};

/**
 * Generates JSON export content
 */
function generateJsonExport(output: ParsedToolOutput, options: ToolExportOptions): string {
  const exportData: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    tool: output.tool,
    target: output.target,
    timestamp: output.timestamp,
  };

  if (options.includeSummary && output.summary) {
    exportData.summary = output.summary;
  }
  if (options.includeHosts && output.hosts) {
    exportData.hosts = output.hosts;
  }
  if (options.includeVulnerabilities && output.vulnerabilities) {
    exportData.vulnerabilities = output.vulnerabilities;
  }
  if (options.includeMetadata && output.metadata) {
    exportData.metadata = output.metadata;
  }
  if (options.includeRawOutput) {
    exportData.rawOutput = output.rawOutput;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates CSV export content
 */
function generateCsvExport(output: ParsedToolOutput, options: ToolExportOptions): string {
  const lines: string[] = [];
  
  // Add header
  lines.push('# Tool Result Export');
  lines.push(`# Tool: ${output.tool}`);
  lines.push(`# Target: ${output.target}`);
  lines.push(`# Timestamp: ${output.timestamp}`);
  lines.push('');

  // Export hosts/ports
  if (options.includeHosts && output.hosts && output.hosts.length > 0) {
    lines.push('# Hosts and Ports');
    lines.push('IP,Hostname,OS,Port,Protocol,State,Service,Version');
    
    output.hosts.forEach((host) => {
      if (host.ports && host.ports.length > 0) {
        host.ports.forEach((port) => {
          lines.push(
            [
              host.ip,
              host.hostname || '',
              host.os || '',
              port.port,
              port.protocol,
              port.state,
              port.service || '',
              port.version || '',
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(',')
          );
        });
      } else {
        lines.push(
          [host.ip, host.hostname || '', host.os || '', '', '', '', '', '']
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );
      }
    });
    lines.push('');
  }

  // Export vulnerabilities
  if (options.includeVulnerabilities && output.vulnerabilities && output.vulnerabilities.length > 0) {
    lines.push('# Vulnerabilities');
    lines.push('ID,Severity,Title,CVSS,CVE,Location,Description');
    
    output.vulnerabilities.forEach((vuln) => {
      lines.push(
        [
          vuln.id,
          vuln.severity,
          vuln.title,
          vuln.cvss || '',
          vuln.cve || '',
          vuln.location || '',
          vuln.description || '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
    });
  }

  return lines.join('\n');
}

/**
 * Generates HTML export content
 */
function generateHtmlExport(output: ParsedToolOutput, options: ToolExportOptions): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${output.tool.toUpperCase()} Results - ${output.target}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      margin: 0;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #ff5252; border-bottom: 2px solid #ff5252; padding-bottom: 10px; }
    h2 { color: #b71c1c; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { background: #1a1a1a; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #ff5252; }
    .stat-value { font-size: 2rem; font-weight: bold; color: #ff5252; }
    .stat-label { font-size: 0.875rem; color: #888; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; background: #1a1a1a; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #222; color: #ff5252; }
    tr:hover { background: #252525; }
    .severity-critical { background: #b71c1c; color: white; padding: 2px 8px; border-radius: 4px; }
    .severity-high { background: #ff5252; color: white; padding: 2px 8px; border-radius: 4px; }
    .severity-medium { background: #ff9800; color: black; padding: 2px 8px; border-radius: 4px; }
    .severity-low { background: #ffc107; color: black; padding: 2px 8px; border-radius: 4px; }
    .severity-info { background: #2196f3; color: white; padding: 2px 8px; border-radius: 4px; }
    .chip { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin: 2px; }
    .chip-open { background: #4caf50; color: white; }
    .chip-filtered { background: #ff9800; color: black; }
    .chip-closed { background: #666; color: white; }
    code { font-family: 'JetBrains Mono', monospace; background: #333; padding: 2px 6px; border-radius: 3px; }
    pre { background: #111; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 20px; }
    .vuln-card { background: #1a1a1a; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #ff5252; }
    .vuln-title { font-weight: bold; font-size: 1.1rem; }
    .vuln-id { font-family: monospace; color: #888; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ ${output.tool.toUpperCase()} Security Scan Results</h1>
    <div class="meta">
      <strong>Target:</strong> ${output.target} |
      <strong>Scan Date:</strong> ${new Date(output.timestamp).toLocaleString()} |
      <strong>Generated:</strong> ${new Date().toLocaleString()}
    </div>

    ${
      options.includeSummary && output.summary
        ? `
    <h2>📊 Summary</h2>
    <div class="summary">
      ${output.summary.totalHosts !== undefined ? `<div class="stat"><div class="stat-value">${output.summary.totalHosts}</div><div class="stat-label">Hosts</div></div>` : ''}
      ${output.summary.totalPorts !== undefined ? `<div class="stat"><div class="stat-value">${output.summary.totalPorts}</div><div class="stat-label">Open Ports</div></div>` : ''}
      ${output.summary.totalVulnerabilities !== undefined ? `<div class="stat"><div class="stat-value">${output.summary.totalVulnerabilities}</div><div class="stat-label">Vulnerabilities</div></div>` : ''}
      ${output.summary.criticalCount ? `<div class="stat"><div class="stat-value">${output.summary.criticalCount}</div><div class="stat-label">Critical</div></div>` : ''}
      ${output.summary.highCount ? `<div class="stat"><div class="stat-value">${output.summary.highCount}</div><div class="stat-label">High</div></div>` : ''}
    </div>
    `
        : ''
    }

    ${
      options.includeHosts && output.hosts && output.hosts.length > 0
        ? `
    <h2>🖥️ Discovered Hosts (${output.hosts.length})</h2>
    <table>
      <thead>
        <tr><th>IP Address</th><th>Hostname</th><th>OS</th><th>Ports</th></tr>
      </thead>
      <tbody>
        ${output.hosts
          .map(
            (host) => `
          <tr>
            <td><code>${host.ip}</code></td>
            <td>${host.hostname || '-'}</td>
            <td>${host.os || '-'}</td>
            <td>${
              host.ports
                ? host.ports.map((p) => `<span class="chip chip-${p.state}">${p.port}/${p.protocol} ${p.service || ''}</span>`).join('')
                : '-'
            }</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    ${
      options.includeVulnerabilities && output.vulnerabilities && output.vulnerabilities.length > 0
        ? `
    <h2>🔒 Vulnerabilities (${output.vulnerabilities.length})</h2>
    ${output.vulnerabilities
      .map(
        (vuln) => `
      <div class="vuln-card" style="border-color: var(--severity-${vuln.severity})">
        <div class="vuln-title">
          <span class="severity-${vuln.severity}">${vuln.severity.toUpperCase()}</span>
          ${vuln.title}
        </div>
        <div class="vuln-id">${vuln.id} ${vuln.cve ? `| ${vuln.cve}` : ''} ${vuln.cvss ? `| CVSS: ${vuln.cvss}` : ''}</div>
        ${vuln.location ? `<div>📍 Location: <code>${vuln.location}</code></div>` : ''}
        ${vuln.description ? `<div style="margin-top: 10px; color: #aaa;">${vuln.description}</div>` : ''}
      </div>
    `
      )
      .join('')}
    `
        : ''
    }

    ${
      options.includeRawOutput
        ? `
    <h2>📝 Raw Output</h2>
    <pre>${output.rawOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    `
        : ''
    }

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; text-align: center;">
      Generated by HexStrike AI v6.0 | ${new Date().toISOString()}
    </footer>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Generates Markdown export content
 */
function generateMarkdownExport(output: ParsedToolOutput, options: ToolExportOptions): string {
  const lines: string[] = [];
  
  lines.push(`# ${output.tool.toUpperCase()} Security Scan Results`);
  lines.push('');
  lines.push(`- **Target:** ${output.target}`);
  lines.push(`- **Scan Date:** ${new Date(output.timestamp).toLocaleString()}`);
  lines.push(`- **Generated:** ${new Date().toLocaleString()}`);
  lines.push('');

  if (options.includeSummary && output.summary) {
    lines.push('## Summary');
    lines.push('');
    if (output.summary.totalHosts !== undefined) {
      lines.push(`- **Total Hosts:** ${output.summary.totalHosts}`);
    }
    if (output.summary.totalPorts !== undefined) {
      lines.push(`- **Open Ports:** ${output.summary.totalPorts}`);
    }
    if (output.summary.totalVulnerabilities !== undefined) {
      lines.push(`- **Vulnerabilities:** ${output.summary.totalVulnerabilities}`);
      if (output.summary.criticalCount) lines.push(`  - Critical: ${output.summary.criticalCount}`);
      if (output.summary.highCount) lines.push(`  - High: ${output.summary.highCount}`);
      if (output.summary.mediumCount) lines.push(`  - Medium: ${output.summary.mediumCount}`);
      if (output.summary.lowCount) lines.push(`  - Low: ${output.summary.lowCount}`);
    }
    lines.push('');
  }

  if (options.includeHosts && output.hosts && output.hosts.length > 0) {
    lines.push(`## Discovered Hosts (${output.hosts.length})`);
    lines.push('');
    lines.push('| IP Address | Hostname | OS | Open Ports |');
    lines.push('|------------|----------|-----|------------|');
    output.hosts.forEach((host) => {
      const ports = host.ports ? host.ports.map((p) => `${p.port}/${p.protocol}`).join(', ') : '-';
      lines.push(`| \`${host.ip}\` | ${host.hostname || '-'} | ${host.os || '-'} | ${ports} |`);
    });
    lines.push('');
  }

  if (options.includeVulnerabilities && output.vulnerabilities && output.vulnerabilities.length > 0) {
    lines.push(`## Vulnerabilities (${output.vulnerabilities.length})`);
    lines.push('');
    output.vulnerabilities.forEach((vuln) => {
      lines.push(`### [${vuln.severity.toUpperCase()}] ${vuln.title}`);
      lines.push('');
      lines.push(`- **ID:** \`${vuln.id}\``);
      if (vuln.cve) lines.push(`- **CVE:** ${vuln.cve}`);
      if (vuln.cvss !== undefined) lines.push(`- **CVSS:** ${vuln.cvss}`);
      if (vuln.location) lines.push(`- **Location:** \`${vuln.location}\``);
      if (vuln.description) {
        lines.push('');
        lines.push(vuln.description);
      }
      lines.push('');
    });
  }

  if (options.includeRawOutput) {
    lines.push('## Raw Output');
    lines.push('');
    lines.push('```');
    lines.push(output.rawOutput);
    lines.push('```');
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generated by HexStrike AI v6.0 | ${new Date().toISOString()}*`);

  return lines.join('\n');
}

/**
 * Generates XML export content
 */
function generateXmlExport(output: ParsedToolOutput, options: ToolExportOptions): string {
  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const lines: string[] = [];
  
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<toolResults>');
  lines.push(`  <metadata>`);
  lines.push(`    <tool>${escapeXml(output.tool)}</tool>`);
  lines.push(`    <target>${escapeXml(output.target)}</target>`);
  lines.push(`    <timestamp>${new Date(output.timestamp).toISOString()}</timestamp>`);
  lines.push(`    <exportedAt>${new Date().toISOString()}</exportedAt>`);
  lines.push(`  </metadata>`);

  if (options.includeSummary && output.summary) {
    lines.push('  <summary>');
    if (output.summary.totalHosts !== undefined) {
      lines.push(`    <totalHosts>${output.summary.totalHosts}</totalHosts>`);
    }
    if (output.summary.totalPorts !== undefined) {
      lines.push(`    <totalPorts>${output.summary.totalPorts}</totalPorts>`);
    }
    if (output.summary.totalVulnerabilities !== undefined) {
      lines.push(`    <totalVulnerabilities>${output.summary.totalVulnerabilities}</totalVulnerabilities>`);
    }
    lines.push('  </summary>');
  }

  if (options.includeHosts && output.hosts && output.hosts.length > 0) {
    lines.push('  <hosts>');
    output.hosts.forEach((host) => {
      lines.push('    <host>');
      lines.push(`      <ip>${escapeXml(host.ip)}</ip>`);
      if (host.hostname) lines.push(`      <hostname>${escapeXml(host.hostname)}</hostname>`);
      if (host.os) lines.push(`      <os>${escapeXml(host.os)}</os>`);
      if (host.ports && host.ports.length > 0) {
        lines.push('      <ports>');
        host.ports.forEach((port) => {
          lines.push('        <port>');
          lines.push(`          <number>${port.port}</number>`);
          lines.push(`          <protocol>${port.protocol}</protocol>`);
          lines.push(`          <state>${port.state}</state>`);
          if (port.service) lines.push(`          <service>${escapeXml(port.service)}</service>`);
          if (port.version) lines.push(`          <version>${escapeXml(port.version)}</version>`);
          lines.push('        </port>');
        });
        lines.push('      </ports>');
      }
      lines.push('    </host>');
    });
    lines.push('  </hosts>');
  }

  if (options.includeVulnerabilities && output.vulnerabilities && output.vulnerabilities.length > 0) {
    lines.push('  <vulnerabilities>');
    output.vulnerabilities.forEach((vuln) => {
      lines.push('    <vulnerability>');
      lines.push(`      <id>${escapeXml(vuln.id)}</id>`);
      lines.push(`      <severity>${vuln.severity}</severity>`);
      lines.push(`      <title>${escapeXml(vuln.title)}</title>`);
      if (vuln.cvss !== undefined) lines.push(`      <cvss>${vuln.cvss}</cvss>`);
      if (vuln.cve) lines.push(`      <cve>${escapeXml(vuln.cve)}</cve>`);
      if (vuln.location) lines.push(`      <location>${escapeXml(vuln.location)}</location>`);
      if (vuln.description) lines.push(`      <description>${escapeXml(vuln.description)}</description>`);
      lines.push('    </vulnerability>');
    });
    lines.push('  </vulnerabilities>');
  }

  if (options.includeRawOutput) {
    lines.push(`  <rawOutput><![CDATA[${output.rawOutput}]]></rawOutput>`);
  }

  lines.push('</toolResults>');

  return lines.join('\n');
}

/**
 * Tool Result Exporter Component
 */
const ToolResultExporter: React.FC<ToolResultExporterProps> = ({
  open,
  onClose,
  toolOutput,
  onExport,
}) => {
  const [options, setOptions] = useState<ToolExportOptions>({
    format: 'json',
    includeSummary: true,
    includeHosts: true,
    includeVulnerabilities: true,
    includeRawOutput: false,
    includeMetadata: true,
    filename: '',
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Generate default filename
  const defaultFilename = toolOutput
    ? `${toolOutput.tool}-${toolOutput.target.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}`
    : 'tool-results';

  const handleExport = useCallback(() => {
    if (!toolOutput) return;

    setExporting(true);
    
    // Generate content based on format
    let content: string;
    let mimeType: string;
    const ext = options.format;

    switch (options.format) {
      case 'json':
        content = generateJsonExport(toolOutput, options);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = generateCsvExport(toolOutput, options);
        mimeType = 'text/csv';
        break;
      case 'html':
        content = generateHtmlExport(toolOutput, options);
        mimeType = 'text/html';
        break;
      case 'markdown':
        content = generateMarkdownExport(toolOutput, options);
        mimeType = 'text/markdown';
        break;
      case 'xml':
        content = generateXmlExport(toolOutput, options);
        mimeType = 'application/xml';
        break;
      default:
        content = JSON.stringify(toolOutput, null, 2);
        mimeType = 'application/json';
    }

    // Create and trigger download
    const filename = `${options.filename || defaultFilename}.${ext}`;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setExporting(false);
      setExported(true);
      onExport?.(options.format, filename);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setExported(false);
      }, 2000);
    }, 500);
  }, [toolOutput, options, defaultFilename, onExport]);

  if (!toolOutput) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" />
          Export Tool Results
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Tool Info */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SecurityIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {toolOutput.tool.toUpperCase()}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Target: {toolOutput.target}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {toolOutput.summary?.totalHosts !== undefined && (
              <Chip label={`${toolOutput.summary.totalHosts} Hosts`} size="small" />
            )}
            {toolOutput.summary?.totalVulnerabilities !== undefined && (
              <Chip label={`${toolOutput.summary.totalVulnerabilities} Vulns`} size="small" color="error" />
            )}
          </Box>
        </Paper>

        {/* Export Format */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Export Format
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <RadioGroup
            value={options.format}
            onChange={(e) => setOptions((prev) => ({ ...prev, format: e.target.value as ExportFormat }))}
          >
            {(['json', 'csv', 'html', 'markdown', 'xml'] as ExportFormat[]).map((format) => (
              <FormControlLabel
                key={format}
                value={format}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formatIcons[format]}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {format.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDescriptions[format]}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Include Sections */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Include Sections
        </Typography>
        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeSummary}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeSummary: e.target.checked }))}
                size="small"
              />
            }
            label="Summary Statistics"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeHosts}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeHosts: e.target.checked }))}
                size="small"
                disabled={!toolOutput.hosts || toolOutput.hosts.length === 0}
              />
            }
            label={`Hosts & Ports${toolOutput.hosts ? ` (${toolOutput.hosts.length})` : ''}`}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeVulnerabilities}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeVulnerabilities: e.target.checked }))}
                size="small"
                disabled={!toolOutput.vulnerabilities || toolOutput.vulnerabilities.length === 0}
              />
            }
            label={`Vulnerabilities${toolOutput.vulnerabilities ? ` (${toolOutput.vulnerabilities.length})` : ''}`}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeRawOutput}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeRawOutput: e.target.checked }))}
                size="small"
              />
            }
            label="Raw Output"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeMetadata}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeMetadata: e.target.checked }))}
                size="small"
              />
            }
            label="Additional Metadata"
          />
        </FormGroup>

        {/* Filename */}
        <TextField
          fullWidth
          size="small"
          label="Filename (optional)"
          placeholder={defaultFilename}
          value={options.filename}
          onChange={(e) => setOptions((prev) => ({ ...prev, filename: e.target.value }))}
          helperText={`Will be saved as: ${options.filename || defaultFilename}.${options.format}`}
        />

        {/* Progress/Success */}
        {exporting && <LinearProgress sx={{ mt: 2 }} />}
        {exported && (
          <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
            Export completed successfully!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToolResultExporter;
