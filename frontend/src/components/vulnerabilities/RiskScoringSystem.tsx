/**
 * Risk Scoring System Component
 * Analyzes and calculates overall security risk based on vulnerabilities
 */

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShieldIcon from '@mui/icons-material/Shield';
import BugReportIcon from '@mui/icons-material/BugReport';
import type { Vulnerability } from '../../types';

interface RiskScoringSystemProps {
  vulnerabilities: Vulnerability[];
  projectName?: string;
}

interface RiskMetrics {
  overallScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageCVSS: number;
  remediatedPercentage: number;
  trend: 'improving' | 'stable' | 'worsening';
}

interface RiskFactor {
  name: string;
  description: string;
  impact: number; // -10 to +10
  category: 'positive' | 'negative' | 'neutral';
}

const RiskScoringSystem = ({ vulnerabilities, projectName }: RiskScoringSystemProps) => {
  // Calculate risk metrics
  const calculateRiskMetrics = (): RiskMetrics => {
    if (vulnerabilities.length === 0) {
      return {
        overallScore: 100,
        riskLevel: 'Minimal',
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        averageCVSS: 0,
        remediatedPercentage: 100,
        trend: 'stable',
      };
    }

    const criticalCount = vulnerabilities.filter((v) => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter((v) => v.severity === 'high').length;
    const mediumCount = vulnerabilities.filter((v) => v.severity === 'medium').length;
    const lowCount = vulnerabilities.filter((v) => v.severity === 'low').length;
    const remediatedCount = vulnerabilities.filter((v) => v.status === 'remediated').length;

    // Calculate weighted score (higher is worse)
    const weightedScore = 
      criticalCount * 10 +
      highCount * 7 +
      mediumCount * 4 +
      lowCount * 1;

    // Normalize to 0-100 scale (100 is best, 0 is worst)
    const maxPossibleScore = vulnerabilities.length * 10;
    const normalizedScore = Math.max(0, 100 - (weightedScore / maxPossibleScore) * 100);

    // Calculate average CVSS
    const totalCVSS = vulnerabilities.reduce((sum, v) => sum + v.cvssScore, 0);
    const averageCVSS = totalCVSS / vulnerabilities.length;

    // Remediation percentage
    const remediatedPercentage = (remediatedCount / vulnerabilities.length) * 100;

    // Determine risk level
    let riskLevel: RiskMetrics['riskLevel'];
    if (criticalCount > 0 || normalizedScore < 30) {
      riskLevel = 'Critical';
    } else if (highCount > 2 || normalizedScore < 50) {
      riskLevel = 'High';
    } else if (mediumCount > 3 || normalizedScore < 70) {
      riskLevel = 'Medium';
    } else if (lowCount > 5 || normalizedScore < 85) {
      riskLevel = 'Low';
    } else {
      riskLevel = 'Minimal';
    }

    // Determine trend (mock - would normally compare with historical data)
    const trend = remediatedPercentage > 50 ? 'improving' : remediatedPercentage > 20 ? 'stable' : 'worsening';

    return {
      overallScore: Math.round(normalizedScore),
      riskLevel,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      averageCVSS: Math.round(averageCVSS * 10) / 10,
      remediatedPercentage: Math.round(remediatedPercentage),
      trend,
    };
  };

  const metrics = calculateRiskMetrics();

  // Identify risk factors
  const getRiskFactors = (): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    if (metrics.criticalCount > 0) {
      factors.push({
        name: 'Critical Vulnerabilities Present',
        description: `${metrics.criticalCount} critical vulnerabilities require immediate attention`,
        impact: -10,
        category: 'negative',
      });
    }

    if (metrics.highCount > 2) {
      factors.push({
        name: 'Multiple High-Severity Issues',
        description: `${metrics.highCount} high-severity vulnerabilities detected`,
        impact: -7,
        category: 'negative',
      });
    }

    if (metrics.remediatedPercentage > 75) {
      factors.push({
        name: 'Strong Remediation Progress',
        description: `${metrics.remediatedPercentage}% of vulnerabilities have been addressed`,
        impact: 8,
        category: 'positive',
      });
    }

    if (metrics.averageCVSS > 7) {
      factors.push({
        name: 'High Average CVSS Score',
        description: `Average CVSS of ${metrics.averageCVSS} indicates serious vulnerabilities`,
        impact: -6,
        category: 'negative',
      });
    }

    if (vulnerabilities.some((v) => v.cveId)) {
      factors.push({
        name: 'Known CVEs Detected',
        description: 'Some vulnerabilities have public CVE identifiers',
        impact: -3,
        category: 'negative',
      });
    }

    if (metrics.trend === 'improving') {
      factors.push({
        name: 'Improving Security Posture',
        description: 'Security metrics are trending positively',
        impact: 5,
        category: 'positive',
      });
    }

    return factors;
  };

  const riskFactors = getRiskFactors();

  const getRiskLevelColor = (level: RiskMetrics['riskLevel']) => {
    switch (level) {
      case 'Critical': return '#b71c1c';
      case 'High': return '#ff5252';
      case 'Medium': return '#ff9800';
      case 'Low': return '#00bcd4';
      case 'Minimal': return '#00ff41';
    }
  };

  const getTrendIcon = (trend: RiskMetrics['trend']) => {
    switch (trend) {
      case 'improving': return <TrendingDownIcon color="success" />;
      case 'worsening': return <TrendingUpIcon color="error" />;
      default: return <TrendingUpIcon color="info" sx={{ transform: 'rotate(90deg)' }} />;
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'linear-gradient(90deg, #00ff41 0%, #00ff41 100%)';
    if (score >= 60) return 'linear-gradient(90deg, #00bcd4 0%, #00ff41 100%)';
    if (score >= 40) return 'linear-gradient(90deg, #ff9800 0%, #00bcd4 100%)';
    if (score >= 20) return 'linear-gradient(90deg, #ff5252 0%, #ff9800 100%)';
    return 'linear-gradient(90deg, #b71c1c 0%, #ff5252 100%)';
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ShieldIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Security Risk Assessment
          </Typography>
          {projectName && (
            <Typography variant="body2" color="text.secondary">
              {projectName}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Main Score Card */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${getRiskLevelColor(metrics.riskLevel)}20 0%, transparent 100%)`,
          borderLeft: '4px solid',
          borderColor: getRiskLevelColor(metrics.riskLevel),
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontWeight: 700, color: getRiskLevelColor(metrics.riskLevel) }}>
                  {metrics.overallScore}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Security Score
                </Typography>
                <Chip
                  label={`${metrics.riskLevel} Risk`}
                  sx={{
                    mt: 1,
                    bgcolor: getRiskLevelColor(metrics.riskLevel),
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {/* Score Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Poor</Typography>
                  <Typography variant="body2">Excellent</Typography>
                </Box>
                <Box
                  sx={{
                    height: 24,
                    borderRadius: 12,
                    background: getScoreGradient(metrics.overallScore),
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${metrics.overallScore}%`,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: 'white',
                      transform: 'translateX(-50%)',
                      boxShadow: 2,
                    }}
                  />
                </Box>
              </Box>

              {/* Trend Indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getTrendIcon(metrics.trend)}
                <Typography variant="body1">
                  Security posture is{' '}
                  <strong style={{ color: metrics.trend === 'improving' ? '#00ff41' : metrics.trend === 'worsening' ? '#ff5252' : '#00bcd4' }}>
                    {metrics.trend}
                  </strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Vulnerability Breakdown */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Vulnerability Breakdown
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#b71c1c20', borderLeft: '3px solid #b71c1c' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#b71c1c', fontWeight: 700 }}>
                {metrics.criticalCount}
              </Typography>
              <Typography variant="caption">Critical</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#ff525220', borderLeft: '3px solid #ff5252' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#ff5252', fontWeight: 700 }}>
                {metrics.highCount}
              </Typography>
              <Typography variant="caption">High</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#ff980020', borderLeft: '3px solid #ff9800' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 700 }}>
                {metrics.mediumCount}
              </Typography>
              <Typography variant="caption">Medium</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#00bcd420', borderLeft: '3px solid #00bcd4' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#00bcd4', fontWeight: 700 }}>
                {metrics.lowCount}
              </Typography>
              <Typography variant="caption">Low</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Average CVSS Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metrics.averageCVSS}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / 10
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.averageCVSS * 10}
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Remediation Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff41' }}>
                {metrics.remediatedPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.remediatedPercentage}
              color="success"
              sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Vulnerabilities
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReportIcon color="error" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vulnerabilities.length}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Across all severity levels
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Risk Factors */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Risk Factors
      </Typography>
      <List>
        {riskFactors.map((factor, index) => (
          <ListItem key={index} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
            <ListItemIcon>
              {factor.category === 'positive' ? (
                <CheckCircleIcon color="success" />
              ) : factor.category === 'negative' ? (
                <ErrorIcon color="error" />
              ) : (
                <WarningIcon color="warning" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={factor.name}
              secondary={factor.description}
            />
            <Tooltip title={`Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact}`}>
              <Chip
                label={factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                size="small"
                color={factor.impact > 0 ? 'success' : 'error'}
              />
            </Tooltip>
          </ListItem>
        ))}
        {riskFactors.length === 0 && (
          <ListItem sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
            <ListItemIcon>
              <SecurityIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="No Major Risk Factors"
              secondary="Your security posture is in good standing"
            />
          </ListItem>
        )}
      </List>

      {/* Recommendations */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Priority Actions
      </Typography>
      <List dense>
        {metrics.criticalCount > 0 && (
          <ListItem sx={{ color: '#b71c1c' }}>
            <ListItemIcon>
              <ErrorIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Immediately address critical vulnerabilities"
              secondary="Critical vulnerabilities pose immediate risk and should be patched ASAP"
            />
          </ListItem>
        )}
        {metrics.highCount > 0 && (
          <ListItem>
            <ListItemIcon>
              <WarningIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Prioritize high-severity issues"
              secondary="Schedule remediation for high-severity vulnerabilities within 7 days"
            />
          </ListItem>
        )}
        {metrics.remediatedPercentage < 50 && (
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Increase remediation velocity"
              secondary="Less than 50% of vulnerabilities have been addressed"
            />
          </ListItem>
        )}
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Continue regular security assessments"
            secondary="Maintain security through continuous scanning and monitoring"
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default RiskScoringSystem;
