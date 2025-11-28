/**
 * Tool Output Parser Component
 * Parses and displays structured output from security tools
 * Sprint 6 Feature - Tool Output Parsers
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Collapse,
  Alert,
  useTheme,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Parsed output result types
 */
export interface ParsedHost {
  ip: string;
  hostname?: string;
  ports?: ParsedPort[];
  os?: string;
  status?: string;
}

export interface ParsedPort {
  port: number;
  protocol: string;
  state: string;
  service?: string;
  version?: string;
  vulnerabilities?: ParsedVulnerability[];
}

export interface ParsedVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description?: string;
  cve?: string;
  cvss?: number;
  location?: string;
  proof?: string;
}

export interface ParsedToolOutput {
  tool: string;
  timestamp: Date;
  target: string;
  rawOutput: string;
  hosts?: ParsedHost[];
  vulnerabilities?: ParsedVulnerability[];
  endpoints?: string[];
  credentials?: { username: string; password: string; service: string }[];
  summary?: {
    totalHosts?: number;
    totalPorts?: number;
    totalVulnerabilities?: number;
    criticalCount?: number;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
  };
  metadata?: Record<string, string | number | boolean>;
}

interface ToolOutputParserProps {
  output: ParsedToolOutput;
  showRawOutput?: boolean;
  maxHeight?: number | string;
  onCopy?: (content: string) => void;
}

type ViewTab = 'summary' | 'hosts' | 'vulnerabilities' | 'raw';

const severityColors: Record<string, string> = {
  critical: '#b71c1c',
  high: '#ff5252',
  medium: '#ff9800',
  low: '#ffc107',
  info: '#2196f3',
};

const severityIcons: Record<string, React.ReactNode> = {
  critical: <ErrorIcon sx={{ color: severityColors.critical }} />,
  high: <WarningIcon sx={{ color: severityColors.high }} />,
  medium: <WarningIcon sx={{ color: severityColors.medium }} />,
  low: <InfoIcon sx={{ color: severityColors.low }} />,
  info: <InfoIcon sx={{ color: severityColors.info }} />,
};

/**
 * Parses raw Nmap output into structured data
 */
export function parseNmapOutput(rawOutput: string, target: string): ParsedToolOutput {
  const hosts: ParsedHost[] = [];
  const vulnerabilities: ParsedVulnerability[] = [];
  
  // Parse host blocks
  let currentHost: ParsedHost | null = null;
  
  const lines = rawOutput.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for host
    const hostMatch = /Nmap scan report for\s+(\S+)(?:\s+\(([^)]+)\))?/.exec(line);
    if (hostMatch) {
      if (currentHost) {
        hosts.push(currentHost);
      }
      currentHost = {
        ip: hostMatch[2] || hostMatch[1],
        hostname: hostMatch[2] ? hostMatch[1] : undefined,
        ports: [],
        status: 'up',
      };
      continue;
    }
    
    // Check for ports
    if (currentHost) {
      const portMatch = /(\d+)\/(tcp|udp)\s+(open|closed|filtered)\s+(\S+)(?:\s+(.+))?/.exec(line);
      if (portMatch) {
        currentHost.ports = currentHost.ports || [];
        currentHost.ports.push({
          port: parseInt(portMatch[1]),
          protocol: portMatch[2],
          state: portMatch[3],
          service: portMatch[4],
          version: portMatch[5]?.trim(),
        });
      }
      
      // Check for OS detection
      const osMatch = /OS details?:\s*(.+)/.exec(line);
      if (osMatch) {
        currentHost.os = osMatch[1];
      }
    }
  }
  
  if (currentHost) {
    hosts.push(currentHost);
  }
  
  // Calculate summary
  const totalPorts = hosts.reduce((sum, host) => sum + (host.ports?.length || 0), 0);
  
  return {
    tool: 'nmap',
    timestamp: new Date(),
    target,
    rawOutput,
    hosts,
    vulnerabilities,
    summary: {
      totalHosts: hosts.length,
      totalPorts,
      totalVulnerabilities: 0,
    },
  };
}

/**
 * Parses raw Nuclei output into structured data
 */
export function parseNucleiOutput(rawOutput: string, target: string): ParsedToolOutput {
  const vulnerabilities: ParsedVulnerability[] = [];
  
  // Parse vulnerability lines
  // Format: [severity] [template-id] [matched-at] [info]
  const vulnRegex = /\[(\w+)\]\s+\[([^\]]+)\]\s+\[?([^\]\s]+)\]?\s*(.*)/g;
  
  let match;
  while ((match = vulnRegex.exec(rawOutput)) !== null) {
    const severity = match[1].toLowerCase() as ParsedVulnerability['severity'];
    if (['critical', 'high', 'medium', 'low', 'info'].includes(severity)) {
      vulnerabilities.push({
        id: match[2],
        severity,
        title: match[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        location: match[3],
        description: match[4]?.trim() || undefined,
      });
    }
  }
  
  // Calculate severity counts
  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;
  
  return {
    tool: 'nuclei',
    timestamp: new Date(),
    target,
    rawOutput,
    vulnerabilities,
    summary: {
      totalVulnerabilities: vulnerabilities.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    },
  };
}

/**
 * Parses raw Gobuster/Ffuf output into structured data
 */
export function parseDirBusterOutput(rawOutput: string, target: string): ParsedToolOutput {
  const endpoints: string[] = [];
  
  // Parse found endpoints
  const lines = rawOutput.split('\n');
  
  for (const line of lines) {
    // Look for patterns like: /admin (Status: 200) or similar
    const urlMatch = /(\/\S+)\s+\(Status:\s*(\d+)\)/i.exec(line);
    if (urlMatch && ['200', '301', '302', '403'].includes(urlMatch[2])) {
      endpoints.push(urlMatch[1]);
    }
    
    // Ffuf format: endpoint [Status: 200, Size: 1234]
    const ffufMatch = /(\S+)\s+\[Status:\s*(\d+)/i.exec(line);
    if (ffufMatch && ['200', '301', '302', '403'].includes(ffufMatch[2])) {
      endpoints.push(ffufMatch[1]);
    }
  }
  
  return {
    tool: 'dirbuster',
    timestamp: new Date(),
    target,
    rawOutput,
    endpoints: [...new Set(endpoints)], // Remove duplicates
    summary: {
      totalHosts: 1,
    },
    metadata: {
      endpointsFound: endpoints.length,
    },
  };
}

/**
 * Auto-detect tool and parse output
 */
export function autoParseOutput(rawOutput: string, target: string, toolHint?: string): ParsedToolOutput {
  const outputLower = rawOutput.toLowerCase();
  
  if (toolHint === 'nmap' || outputLower.includes('nmap scan report') || outputLower.includes('starting nmap')) {
    return parseNmapOutput(rawOutput, target);
  }
  
  if (toolHint === 'nuclei' || outputLower.includes('[nuclei]') || /\[(critical|high|medium|low|info)\]/.test(outputLower)) {
    return parseNucleiOutput(rawOutput, target);
  }
  
  if (toolHint === 'gobuster' || toolHint === 'ffuf' || outputLower.includes('gobuster') || outputLower.includes('ffuf')) {
    return parseDirBusterOutput(rawOutput, target);
  }
  
  // Return raw output if no parser matches
  return {
    tool: toolHint || 'unknown',
    timestamp: new Date(),
    target,
    rawOutput,
  };
}

/**
 * Tool Output Parser Component
 * Displays parsed output in multiple views
 */
const ToolOutputParser: React.FC<ToolOutputParserProps> = ({
  output,
  showRawOutput = true,
  maxHeight = 500,
  onCopy,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<ViewTab>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedHosts, setExpandedHosts] = useState<Set<string>>(new Set());

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    onCopy?.(content);
  };

  const toggleHostExpanded = (hostId: string) => {
    setExpandedHosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hostId)) {
        newSet.delete(hostId);
      } else {
        newSet.add(hostId);
      }
      return newSet;
    });
  };

  // Filter vulnerabilities by search
  const filteredVulnerabilities = useMemo(() => {
    if (!output.vulnerabilities) return [];
    if (!searchQuery) return output.vulnerabilities;
    
    const query = searchQuery.toLowerCase();
    return output.vulnerabilities.filter(
      (v) =>
        v.title.toLowerCase().includes(query) ||
        v.id.toLowerCase().includes(query) ||
        v.severity.includes(query) ||
        v.location?.toLowerCase().includes(query)
    );
  }, [output.vulnerabilities, searchQuery]);

  // Filter hosts by search
  const filteredHosts = useMemo(() => {
    if (!output.hosts) return [];
    if (!searchQuery) return output.hosts;
    
    const query = searchQuery.toLowerCase();
    return output.hosts.filter(
      (h) =>
        h.ip.toLowerCase().includes(query) ||
        h.hostname?.toLowerCase().includes(query) ||
        h.os?.toLowerCase().includes(query) ||
        h.ports?.some((p) => p.service?.toLowerCase().includes(query))
    );
  }, [output.hosts, searchQuery]);

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataObjectIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Parsed Output: {output.tool.toUpperCase()}
          </Typography>
          <Chip label={output.target} size="small" variant="outlined" />
        </Box>
        <Tooltip title="Copy raw output">
          <IconButton size="small" onClick={() => handleCopy(output.rawOutput)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab icon={<SecurityIcon />} label="Summary" value="summary" iconPosition="start" />
        {output.hosts && output.hosts.length > 0 && (
          <Tab icon={<TableChartIcon />} label={`Hosts (${output.hosts.length})`} value="hosts" iconPosition="start" />
        )}
        {output.vulnerabilities && output.vulnerabilities.length > 0 && (
          <Tab
            icon={<WarningIcon />}
            label={`Vulnerabilities (${output.vulnerabilities.length})`}
            value="vulnerabilities"
            iconPosition="start"
          />
        )}
        {showRawOutput && <Tab icon={<CodeIcon />} label="Raw" value="raw" iconPosition="start" />}
      </Tabs>

      {/* Search (for hosts and vulnerabilities tabs) */}
      {(activeTab === 'hosts' || activeTab === 'vulnerabilities') && (
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Content */}
      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {output.summary?.totalHosts !== undefined && (
                <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h4" color="primary">
                    {output.summary.totalHosts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hosts
                  </Typography>
                </Paper>
              )}
              {output.summary?.totalPorts !== undefined && (
                <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h4" color="info.main">
                    {output.summary.totalPorts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Ports
                  </Typography>
                </Paper>
              )}
              {output.summary?.totalVulnerabilities !== undefined && (
                <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="h4" color="error.main">
                    {output.summary.totalVulnerabilities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vulnerabilities
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Severity breakdown */}
            {output.summary?.totalVulnerabilities !== undefined && output.summary.totalVulnerabilities > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Severity Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {output.summary.criticalCount !== undefined && output.summary.criticalCount > 0 && (
                    <Chip
                      icon={severityIcons.critical as React.ReactElement}
                      label={`Critical: ${output.summary.criticalCount}`}
                      sx={{ bgcolor: severityColors.critical, color: 'white' }}
                    />
                  )}
                  {output.summary.highCount !== undefined && output.summary.highCount > 0 && (
                    <Chip
                      icon={severityIcons.high as React.ReactElement}
                      label={`High: ${output.summary.highCount}`}
                      sx={{ bgcolor: severityColors.high, color: 'white' }}
                    />
                  )}
                  {output.summary.mediumCount !== undefined && output.summary.mediumCount > 0 && (
                    <Chip
                      label={`Medium: ${output.summary.mediumCount}`}
                      sx={{ bgcolor: severityColors.medium, color: 'white' }}
                    />
                  )}
                  {output.summary.lowCount !== undefined && output.summary.lowCount > 0 && (
                    <Chip
                      label={`Low: ${output.summary.lowCount}`}
                      sx={{ bgcolor: severityColors.low, color: 'black' }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Endpoints */}
            {output.endpoints && output.endpoints.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Discovered Endpoints ({output.endpoints.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {output.endpoints.slice(0, 20).map((endpoint, idx) => (
                    <Chip key={idx} label={endpoint} size="small" variant="outlined" />
                  ))}
                  {output.endpoints.length > 20 && (
                    <Chip label={`+${output.endpoints.length - 20} more`} size="small" color="primary" />
                  )}
                </Box>
              </Box>
            )}

            {/* Metadata */}
            {output.metadata && Object.keys(output.metadata).length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Additional Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(output.metadata).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Hosts Tab */}
        {activeTab === 'hosts' && (
          <Box>
            {filteredHosts.length === 0 ? (
              <Alert severity="info">No hosts found</Alert>
            ) : (
              filteredHosts.map((host) => (
                <Paper key={host.ip} sx={{ mb: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleHostExpanded(host.ip)}
                  >
                    <IconButton size="small">
                      {expandedHosts.has(host.ip) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                        {host.ip}
                        {host.hostname && (
                          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                            ({host.hostname})
                          </Typography>
                        )}
                      </Typography>
                      {host.os && (
                        <Typography variant="body2" color="text.secondary">
                          OS: {host.os}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      icon={host.status === 'up' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={host.status || 'unknown'}
                      size="small"
                      color={host.status === 'up' ? 'success' : 'default'}
                    />
                    {host.ports && (
                      <Chip label={`${host.ports.length} ports`} size="small" sx={{ ml: 1 }} />
                    )}
                  </Box>
                  <Collapse in={expandedHosts.has(host.ip)}>
                    {host.ports && host.ports.length > 0 && (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Port</TableCell>
                              <TableCell>Protocol</TableCell>
                              <TableCell>State</TableCell>
                              <TableCell>Service</TableCell>
                              <TableCell>Version</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {host.ports.map((port) => (
                              <TableRow key={`${port.port}-${port.protocol}`}>
                                <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{port.port}</TableCell>
                                <TableCell>{port.protocol.toUpperCase()}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={port.state}
                                    size="small"
                                    color={port.state === 'open' ? 'success' : port.state === 'filtered' ? 'warning' : 'default'}
                                  />
                                </TableCell>
                                <TableCell>{port.service || '-'}</TableCell>
                                <TableCell>{port.version || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Collapse>
                </Paper>
              ))
            )}
          </Box>
        )}

        {/* Vulnerabilities Tab */}
        {activeTab === 'vulnerabilities' && (
          <Box>
            {filteredVulnerabilities.length === 0 ? (
              <Alert severity="success">No vulnerabilities found</Alert>
            ) : (
              filteredVulnerabilities.map((vuln, idx) => (
                <Paper
                  key={`${vuln.id}-${idx}`}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderLeft: 4,
                    borderColor: severityColors[vuln.severity],
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {severityIcons[vuln.severity]}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {vuln.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {vuln.id}
                      </Typography>
                      {vuln.location && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Location: {vuln.location}
                        </Typography>
                      )}
                      {vuln.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {vuln.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        label={vuln.severity.toUpperCase()}
                        size="small"
                        sx={{ bgcolor: severityColors[vuln.severity], color: vuln.severity === 'low' ? 'black' : 'white' }}
                      />
                      {vuln.cvss !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          CVSS: {vuln.cvss}
                        </Typography>
                      )}
                      {vuln.cve && (
                        <Chip label={vuln.cve} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {/* Raw Output Tab */}
        {activeTab === 'raw' && (
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#1e1e1e',
              color: '#d4d4d4',
              borderRadius: 1,
              overflow: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.875rem',
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {output.rawOutput}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ToolOutputParser;
