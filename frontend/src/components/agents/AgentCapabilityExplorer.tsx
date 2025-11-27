/**
 * Agent Capability Explorer Component
 * Detailed view of agent capabilities, commands, and use cases
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { Agent } from '../../types';

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  commands: AgentCommand[];
  examples: string[];
  relatedTools: string[];
}

interface AgentCommand {
  name: string;
  syntax: string;
  description: string;
  parameters: CommandParameter[];
}

interface CommandParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface AgentCapabilityExplorerProps {
  agent: Agent | null;
  onExecuteCommand?: (command: string) => void;
}

// Detailed capability definitions for each agent type
const AGENT_CAPABILITIES: Record<string, AgentCapability[]> = {
  bugbounty: [
    {
      id: 'recon',
      name: 'Reconnaissance',
      description: 'Perform comprehensive reconnaissance on target domains and applications',
      commands: [
        {
          name: 'scan',
          syntax: 'scan <target> [--deep] [--include-subdomains]',
          description: 'Initiate a comprehensive security scan',
          parameters: [
            { name: 'target', type: 'string', required: true, description: 'Target domain or IP address' },
            { name: '--deep', type: 'flag', required: false, description: 'Enable deep scanning mode' },
            { name: '--include-subdomains', type: 'flag', required: false, description: 'Include subdomain enumeration' },
          ],
        },
        {
          name: 'enumerate',
          syntax: 'enumerate subdomains <domain>',
          description: 'Find all subdomains for a target domain',
          parameters: [
            { name: 'domain', type: 'string', required: true, description: 'Target domain to enumerate' },
          ],
        },
      ],
      examples: [
        'Scan example.com for vulnerabilities',
        'Enumerate subdomains for target.com',
        'Perform a deep security assessment on app.example.com',
      ],
      relatedTools: ['Amass', 'Subfinder', 'Nmap', 'Nuclei'],
    },
    {
      id: 'vuln-detection',
      name: 'Vulnerability Detection',
      description: 'Identify and classify security vulnerabilities',
      commands: [
        {
          name: 'test',
          syntax: 'test <vulnerability-type> <target>',
          description: 'Test for specific vulnerability types',
          parameters: [
            { name: 'vulnerability-type', type: 'string', required: true, description: 'Type: sql-injection, xss, ssrf, etc.' },
            { name: 'target', type: 'string', required: true, description: 'Target URL or endpoint' },
          ],
        },
      ],
      examples: [
        'Test for SQL injection in login forms',
        'Check for XSS vulnerabilities in search functionality',
        'Test SSRF on file upload endpoints',
      ],
      relatedTools: ['SQLMap', 'XSSHunter', 'Dalfox', 'Nuclei'],
    },
  ],
  web_security: [
    {
      id: 'web-scanning',
      name: 'Web Application Scanning',
      description: 'Comprehensive web application security testing',
      commands: [
        {
          name: 'crawl',
          syntax: 'crawl <url> [--depth=<n>] [--follow-redirects]',
          description: 'Crawl and map web application structure',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'Starting URL for crawling' },
            { name: '--depth', type: 'number', required: false, description: 'Maximum crawl depth (default: 3)' },
          ],
        },
        {
          name: 'fuzz',
          syntax: 'fuzz <url> --wordlist=<path>',
          description: 'Fuzz web endpoints for hidden content',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'Target URL' },
            { name: '--wordlist', type: 'string', required: true, description: 'Path to wordlist file' },
          ],
        },
      ],
      examples: [
        'Crawl https://example.com with depth 5',
        'Fuzz /api endpoints for hidden routes',
        'Test authentication bypass techniques',
      ],
      relatedTools: ['Gobuster', 'FFuf', 'Burp Suite', 'OWASP ZAP'],
    },
  ],
  cve_intelligence: [
    {
      id: 'cve-lookup',
      name: 'CVE Lookup & Analysis',
      description: 'Search and analyze CVE vulnerabilities',
      commands: [
        {
          name: 'lookup',
          syntax: 'lookup <cve-id>',
          description: 'Get detailed information about a specific CVE',
          parameters: [
            { name: 'cve-id', type: 'string', required: true, description: 'CVE identifier (e.g., CVE-2024-1234)' },
          ],
        },
        {
          name: 'search',
          syntax: 'search <keyword> [--severity=<level>] [--year=<year>]',
          description: 'Search CVEs by keyword or criteria',
          parameters: [
            { name: 'keyword', type: 'string', required: true, description: 'Search keyword or product name' },
            { name: '--severity', type: 'string', required: false, description: 'Filter by severity: critical, high, medium, low' },
          ],
        },
      ],
      examples: [
        'Lookup CVE-2024-1234',
        'Search for Apache vulnerabilities',
        'Find critical CVEs from 2024',
      ],
      relatedTools: ['NVD API', 'CVE Search', 'Exploit-DB'],
    },
  ],
  network_recon: [
    {
      id: 'port-scanning',
      name: 'Port Scanning',
      description: 'Discover open ports and running services',
      commands: [
        {
          name: 'portscan',
          syntax: 'portscan <target> [--ports=<range>] [--fast]',
          description: 'Scan ports on target systems',
          parameters: [
            { name: 'target', type: 'string', required: true, description: 'Target IP or hostname' },
            { name: '--ports', type: 'string', required: false, description: 'Port range (e.g., 1-1000, 80,443,8080)' },
            { name: '--fast', type: 'flag', required: false, description: 'Enable fast scanning mode' },
          ],
        },
      ],
      examples: [
        'Scan all ports on 192.168.1.1',
        'Quick scan of common web ports',
        'Detect services on discovered ports',
      ],
      relatedTools: ['Nmap', 'Rustscan', 'Masscan'],
    },
  ],
};

const AgentCapabilityExplorer = ({ agent, onExecuteCommand }: AgentCapabilityExplorerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCapability, setExpandedCapability] = useState<string | false>(false);

  if (!agent) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <HelpOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Select an agent to explore its capabilities
        </Typography>
      </Paper>
    );
  }

  const capabilities = AGENT_CAPABILITIES[agent.type] || [];
  
  const filteredCapabilities = capabilities.filter((cap) =>
    cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cap.commands.some((cmd) => cmd.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAccordionChange = (capabilityId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCapability(isExpanded ? capabilityId : false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {agent.name} - Capability Explorer
          </Typography>
          <Chip
            label={agent.status}
            size="small"
            color={agent.status === 'active' ? 'success' : 'default'}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {agent.description || `Explore available capabilities and commands for ${agent.name}`}
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search capabilities and commands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Capabilities" />
          <Tab label="Quick Reference" />
          <Tab label="Use Cases" />
        </Tabs>
      </Paper>

      {/* Content based on active tab */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredCapabilities.length > 0 ? (
              filteredCapabilities.map((capability) => (
                <Accordion
                  key={capability.id}
                  expanded={expandedCapability === capability.id}
                  onChange={handleAccordionChange(capability.id)}
                  sx={{
                    '&:before': { display: 'none' },
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <SecurityIcon color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {capability.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {capability.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${capability.commands.length} commands`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Commands */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Available Commands
                    </Typography>
                    <List dense>
                      {capability.commands.map((command, idx) => (
                        <ListItem
                          key={idx}
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CodeIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  component="code"
                                  sx={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    bgcolor: 'action.hover',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 0.5,
                                  }}
                                >
                                  {command.syntax}
                                </Box>
                              }
                              secondary={command.description}
                            />
                            {onExecuteCommand && (
                              <Button
                                size="small"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => onExecuteCommand(command.syntax)}
                              >
                                Try
                              </Button>
                            )}
                          </Box>
                          {/* Parameters */}
                          {command.parameters.length > 0 && (
                            <Box sx={{ ml: 4, mt: 1, width: '100%' }}>
                              <Typography variant="caption" color="text.secondary">
                                Parameters:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {command.parameters.map((param, pIdx) => (
                                  <Chip
                                    key={pIdx}
                                    label={`${param.name}${param.required ? ' *' : ''}`}
                                    size="small"
                                    variant={param.required ? 'filled' : 'outlined'}
                                    color={param.required ? 'primary' : 'default'}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </ListItem>
                      ))}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    {/* Related Tools */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Related Tools
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {capability.relatedTools.map((tool) => (
                        <Chip
                          key={tool}
                          label={tool}
                          size="small"
                          icon={<CheckCircleIcon />}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Examples */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Example Usage
                    </Typography>
                    <List dense>
                      {capability.examples.map((example, idx) => (
                        <ListItem
                          key={idx}
                          sx={{
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.selected' },
                          }}
                          onClick={() => onExecuteCommand?.(example)}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <PlayArrowIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={example}
                            primaryTypographyProps={{
                              sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No capabilities found matching &quot;{searchQuery}&quot;
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            {agent.capabilities.map((cap, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {cap}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Available and ready to use
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Common Use Cases for {agent.name}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Bug Bounty Hunting"
                    secondary="Automated vulnerability discovery and reporting for bug bounty programs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Penetration Testing"
                    secondary="Comprehensive security assessments for web applications"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security Monitoring"
                    secondary="Continuous scanning and alerting for new vulnerabilities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compliance Auditing"
                    secondary="Security checks for compliance with industry standards"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AgentCapabilityExplorer;
