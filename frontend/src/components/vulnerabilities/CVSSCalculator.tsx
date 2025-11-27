/**
 * CVSS Calculator Component
 * Calculate Common Vulnerability Scoring System (CVSS) scores
 * Supports CVSS 3.1 base metrics
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// CVSS 3.1 Base Metrics Types
type AttackVector = 'N' | 'A' | 'L' | 'P';
type AttackComplexity = 'L' | 'H';
type PrivilegesRequired = 'N' | 'L' | 'H';
type UserInteraction = 'N' | 'R';
type Scope = 'U' | 'C';
type ImpactMetric = 'N' | 'L' | 'H';

interface CVSSMetrics {
  attackVector: AttackVector;
  attackComplexity: AttackComplexity;
  privilegesRequired: PrivilegesRequired;
  userInteraction: UserInteraction;
  scope: Scope;
  confidentialityImpact: ImpactMetric;
  integrityImpact: ImpactMetric;
  availabilityImpact: ImpactMetric;
}

interface CVSSResult {
  score: number;
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  vector: string;
}

interface CVSSCalculatorProps {
  initialVector?: string;
  onCalculate?: (result: CVSSResult) => void;
}

// Metric descriptions for tooltips
const METRIC_DESCRIPTIONS = {
  attackVector: {
    N: 'Network - The vulnerable component is bound to the network stack',
    A: 'Adjacent - The vulnerable component is bound to the network stack, but restricted to a logically adjacent topology',
    L: 'Local - The vulnerable component is not bound to the network stack and attack path is via local access',
    P: 'Physical - The attack requires the attacker to physically touch or manipulate the vulnerable component',
  },
  attackComplexity: {
    L: 'Low - Specialized access conditions or extenuating circumstances do not exist',
    H: 'High - A successful attack depends on conditions beyond the attacker\'s control',
  },
  privilegesRequired: {
    N: 'None - The attacker is unauthorized prior to attack',
    L: 'Low - The attacker requires privileges that provide basic user capabilities',
    H: 'High - The attacker requires privileges that provide significant control',
  },
  userInteraction: {
    N: 'None - The vulnerable system can be exploited without interaction from any user',
    R: 'Required - Successful exploitation requires a user to take some action',
  },
  scope: {
    U: 'Unchanged - An exploited vulnerability can only affect resources managed by the same authority',
    C: 'Changed - An exploited vulnerability can affect resources beyond the security scope',
  },
  impact: {
    N: 'None - There is no impact',
    L: 'Low - There is some loss',
    H: 'High - There is a total loss',
  },
};

// CVSS 3.1 Weights
const WEIGHTS = {
  attackVector: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  attackComplexity: { L: 0.77, H: 0.44 },
  privilegesRequired: {
    unchanged: { N: 0.85, L: 0.62, H: 0.27 },
    changed: { N: 0.85, L: 0.68, H: 0.50 },
  },
  userInteraction: { N: 0.85, R: 0.62 },
  impact: { N: 0, L: 0.22, H: 0.56 },
};

const CVSSCalculator = ({ initialVector, onCalculate }: CVSSCalculatorProps) => {
  const [metrics, setMetrics] = useState<CVSSMetrics>({
    attackVector: 'N',
    attackComplexity: 'L',
    privilegesRequired: 'N',
    userInteraction: 'N',
    scope: 'U',
    confidentialityImpact: 'N',
    integrityImpact: 'N',
    availabilityImpact: 'N',
  });

  const [result, setResult] = useState<CVSSResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate CVSS score based on metrics
  const calculateCVSS = useCallback((): CVSSResult => {
    const av = WEIGHTS.attackVector[metrics.attackVector];
    const ac = WEIGHTS.attackComplexity[metrics.attackComplexity];
    const pr = metrics.scope === 'C'
      ? WEIGHTS.privilegesRequired.changed[metrics.privilegesRequired]
      : WEIGHTS.privilegesRequired.unchanged[metrics.privilegesRequired];
    const ui = WEIGHTS.userInteraction[metrics.userInteraction];

    const exploitability = 8.22 * av * ac * pr * ui;

    const ci = WEIGHTS.impact[metrics.confidentialityImpact];
    const ii = WEIGHTS.impact[metrics.integrityImpact];
    const ai = WEIGHTS.impact[metrics.availabilityImpact];

    const iscBase = 1 - (1 - ci) * (1 - ii) * (1 - ai);
    
    let isc: number;
    if (metrics.scope === 'U') {
      isc = 6.42 * iscBase;
    } else {
      isc = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
    }

    let score: number;
    if (isc <= 0) {
      score = 0;
    } else if (metrics.scope === 'U') {
      score = Math.min(exploitability + isc, 10);
    } else {
      score = Math.min(1.08 * (exploitability + isc), 10);
    }

    // Round up to one decimal place
    score = Math.ceil(score * 10) / 10;

    // Determine severity
    let severity: CVSSResult['severity'];
    if (score === 0) {
      severity = 'None';
    } else if (score <= 3.9) {
      severity = 'Low';
    } else if (score <= 6.9) {
      severity = 'Medium';
    } else if (score <= 8.9) {
      severity = 'High';
    } else {
      severity = 'Critical';
    }

    // Build vector string
    const vector = `CVSS:3.1/AV:${metrics.attackVector}/AC:${metrics.attackComplexity}/PR:${metrics.privilegesRequired}/UI:${metrics.userInteraction}/S:${metrics.scope}/C:${metrics.confidentialityImpact}/I:${metrics.integrityImpact}/A:${metrics.availabilityImpact}`;

    return { score, severity, vector };
  }, [metrics]);

  // Parse vector function - defined before useEffect that uses it
  const parseVector = (vector: string) => {
    const parts = vector.replace('CVSS:3.1/', '').split('/');
    const parsed: Partial<CVSSMetrics> = {};

    parts.forEach((part) => {
      const [key, value] = part.split(':');
      switch (key) {
        case 'AV': parsed.attackVector = value as AttackVector; break;
        case 'AC': parsed.attackComplexity = value as AttackComplexity; break;
        case 'PR': parsed.privilegesRequired = value as PrivilegesRequired; break;
        case 'UI': parsed.userInteraction = value as UserInteraction; break;
        case 'S': parsed.scope = value as Scope; break;
        case 'C': parsed.confidentialityImpact = value as ImpactMetric; break;
        case 'I': parsed.integrityImpact = value as ImpactMetric; break;
        case 'A': parsed.availabilityImpact = value as ImpactMetric; break;
      }
    });

    setMetrics((prev) => ({ ...prev, ...parsed }));
  };

  // Calculate on metrics change
  useEffect(() => {
    const newResult = calculateCVSS();
    setResult(newResult);
    onCalculate?.(newResult);
  }, [calculateCVSS, onCalculate]);

  // Parse initial vector if provided
  useEffect(() => {
    if (initialVector) {
      parseVector(initialVector);
    }
  }, [initialVector]);

  const handleMetricChange = <K extends keyof CVSSMetrics>(
    metric: K,
    value: CVSSMetrics[K]
  ) => {
    setMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const handleReset = () => {
    setMetrics({
      attackVector: 'N',
      attackComplexity: 'L',
      privilegesRequired: 'N',
      userInteraction: 'N',
      scope: 'U',
      confidentialityImpact: 'N',
      integrityImpact: 'N',
      availabilityImpact: 'N',
    });
  };

  const handleCopyVector = () => {
    if (result) {
      navigator.clipboard.writeText(result.vector);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityColor = (severity: CVSSResult['severity']) => {
    switch (severity) {
      case 'Critical': return '#b71c1c';
      case 'High': return '#ff5252';
      case 'Medium': return '#ff9800';
      case 'Low': return '#00bcd4';
      default: return '#757575';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CalculateIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          CVSS 3.1 Base Score Calculator
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {/* Result Card */}
      {result && (
        <Card
          sx={{
            mb: 3,
            borderLeft: '4px solid',
            borderColor: getSeverityColor(result.severity),
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: getSeverityColor(result.severity) }}>
                    {result.score.toFixed(1)}
                  </Typography>
                  <Chip
                    label={result.severity}
                    sx={{
                      bgcolor: getSeverityColor(result.severity),
                      color: 'white',
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Vector String
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'action.hover',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      flex: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {result.vector}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy vector'}>
                    <IconButton size="small" onClick={handleCopyVector}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={result.score * 10}
                  sx={{
                    mt: 2,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getSeverityColor(result.severity),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Exploitability Metrics */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Exploitability Metrics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Attack Vector (AV)</InputLabel>
            <Select
              value={metrics.attackVector}
              label="Attack Vector (AV)"
              onChange={(e) => handleMetricChange('attackVector', e.target.value as AttackVector)}
            >
              <MenuItem value="N">
                <Tooltip title={METRIC_DESCRIPTIONS.attackVector.N} placement="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Network (N)
                    <InfoIcon fontSize="small" color="action" />
                  </Box>
                </Tooltip>
              </MenuItem>
              <MenuItem value="A">Adjacent (A)</MenuItem>
              <MenuItem value="L">Local (L)</MenuItem>
              <MenuItem value="P">Physical (P)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Attack Complexity (AC)</InputLabel>
            <Select
              value={metrics.attackComplexity}
              label="Attack Complexity (AC)"
              onChange={(e) => handleMetricChange('attackComplexity', e.target.value as AttackComplexity)}
            >
              <MenuItem value="L">Low (L)</MenuItem>
              <MenuItem value="H">High (H)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Privileges Required (PR)</InputLabel>
            <Select
              value={metrics.privilegesRequired}
              label="Privileges Required (PR)"
              onChange={(e) => handleMetricChange('privilegesRequired', e.target.value as PrivilegesRequired)}
            >
              <MenuItem value="N">None (N)</MenuItem>
              <MenuItem value="L">Low (L)</MenuItem>
              <MenuItem value="H">High (H)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>User Interaction (UI)</InputLabel>
            <Select
              value={metrics.userInteraction}
              label="User Interaction (UI)"
              onChange={(e) => handleMetricChange('userInteraction', e.target.value as UserInteraction)}
            >
              <MenuItem value="N">None (N)</MenuItem>
              <MenuItem value="R">Required (R)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Scope */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Scope
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Scope (S)</InputLabel>
            <Select
              value={metrics.scope}
              label="Scope (S)"
              onChange={(e) => handleMetricChange('scope', e.target.value as Scope)}
            >
              <MenuItem value="U">Unchanged (U)</MenuItem>
              <MenuItem value="C">Changed (C)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Impact Metrics */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Impact Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Confidentiality (C)</InputLabel>
            <Select
              value={metrics.confidentialityImpact}
              label="Confidentiality (C)"
              onChange={(e) => handleMetricChange('confidentialityImpact', e.target.value as ImpactMetric)}
            >
              <MenuItem value="N">None (N)</MenuItem>
              <MenuItem value="L">Low (L)</MenuItem>
              <MenuItem value="H">High (H)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Integrity (I)</InputLabel>
            <Select
              value={metrics.integrityImpact}
              label="Integrity (I)"
              onChange={(e) => handleMetricChange('integrityImpact', e.target.value as ImpactMetric)}
            >
              <MenuItem value="N">None (N)</MenuItem>
              <MenuItem value="L">Low (L)</MenuItem>
              <MenuItem value="H">High (H)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Availability (A)</InputLabel>
            <Select
              value={metrics.availabilityImpact}
              label="Availability (A)"
              onChange={(e) => handleMetricChange('availabilityImpact', e.target.value as ImpactMetric)}
            >
              <MenuItem value="N">None (N)</MenuItem>
              <MenuItem value="L">Low (L)</MenuItem>
              <MenuItem value="H">High (H)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Quick Reference */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        CVSS Severity Ratings: None (0.0) | Low (0.1-3.9) | Medium (4.0-6.9) | High (7.0-8.9) | Critical (9.0-10.0)
      </Typography>
    </Paper>
  );
};

export default CVSSCalculator;
