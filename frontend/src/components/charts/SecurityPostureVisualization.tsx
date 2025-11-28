/**
 * Security Posture Visualization Component
 * Displays overall security status and risk scoring
 * Sprint 12 Feature - Security Posture Visualization
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

/**
 * Security metrics for posture calculation
 */
export interface SecurityMetrics {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  coverage: {
    scannedAssets: number;
    totalAssets: number;
    lastScanDate?: Date;
  };
  compliance: {
    passed: number;
    failed: number;
    notApplicable: number;
  };
  remediation: {
    fixed: number;
    pending: number;
    inProgress: number;
  };
  previousScore?: number;
}

interface SecurityPostureVisualizationProps {
  metrics: SecurityMetrics;
  title?: string;
  showDetails?: boolean;
  height?: number;
}

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'excellent';

interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
}

/**
 * Calculate overall security score
 */
function calculateSecurityScore(metrics: SecurityMetrics): {
  score: number;
  grade: string;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown[];
} {
  const breakdown: ScoreBreakdown[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Vulnerability Score (40% weight)
  const vulnWeight = 40;
  const vulnTotal = 
    metrics.vulnerabilities.critical + 
    metrics.vulnerabilities.high + 
    metrics.vulnerabilities.medium + 
    metrics.vulnerabilities.low + 
    metrics.vulnerabilities.info;
  
  let vulnScore = 100;
  if (vulnTotal > 0) {
    // Weighted penalty based on severity
    const penalty = 
      (metrics.vulnerabilities.critical * 25) +
      (metrics.vulnerabilities.high * 15) +
      (metrics.vulnerabilities.medium * 5) +
      (metrics.vulnerabilities.low * 2) +
      (metrics.vulnerabilities.info * 0.5);
    vulnScore = Math.max(0, 100 - Math.min(penalty, 100));
  }
  breakdown.push({ category: 'Vulnerability', score: vulnScore, maxScore: 100, weight: vulnWeight });
  totalScore += vulnScore * vulnWeight;
  totalWeight += vulnWeight;

  // 2. Coverage Score (25% weight)
  const coverageWeight = 25;
  let coverageScore = 0;
  if (metrics.coverage.totalAssets > 0) {
    coverageScore = (metrics.coverage.scannedAssets / metrics.coverage.totalAssets) * 100;
  }
  breakdown.push({ category: 'Coverage', score: coverageScore, maxScore: 100, weight: coverageWeight });
  totalScore += coverageScore * coverageWeight;
  totalWeight += coverageWeight;

  // 3. Compliance Score (20% weight)
  const complianceWeight = 20;
  const complianceTotal = 
    metrics.compliance.passed + 
    metrics.compliance.failed;
  let complianceScore = 0;
  if (complianceTotal > 0) {
    complianceScore = (metrics.compliance.passed / complianceTotal) * 100;
  }
  breakdown.push({ category: 'Compliance', score: complianceScore, maxScore: 100, weight: complianceWeight });
  totalScore += complianceScore * complianceWeight;
  totalWeight += complianceWeight;

  // 4. Remediation Score (15% weight)
  const remediationWeight = 15;
  const remediationTotal = 
    metrics.remediation.fixed + 
    metrics.remediation.pending + 
    metrics.remediation.inProgress;
  let remediationScore = 100;
  if (remediationTotal > 0) {
    remediationScore = (metrics.remediation.fixed / remediationTotal) * 100;
  }
  breakdown.push({ category: 'Remediation', score: remediationScore, maxScore: 100, weight: remediationWeight });
  totalScore += remediationScore * remediationWeight;
  totalWeight += remediationWeight;

  // Calculate final score
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  // Determine grade and risk level
  let grade: string;
  let riskLevel: RiskLevel;
  
  if (finalScore >= 90) {
    grade = 'A';
    riskLevel = 'excellent';
  } else if (finalScore >= 80) {
    grade = 'B';
    riskLevel = 'low';
  } else if (finalScore >= 70) {
    grade = 'C';
    riskLevel = 'medium';
  } else if (finalScore >= 50) {
    grade = 'D';
    riskLevel = 'high';
  } else {
    grade = 'F';
    riskLevel = 'critical';
  }

  return { score: finalScore, grade, riskLevel, breakdown };
}

const riskColors: Record<RiskLevel, string> = {
  excellent: '#4caf50',
  low: '#8bc34a',
  medium: '#ff9800',
  high: '#ff5252',
  critical: '#b71c1c',
};

const riskLabels: Record<RiskLevel, string> = {
  excellent: 'Excellent',
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

const riskIcons: Record<RiskLevel, React.ReactNode> = {
  excellent: <CheckCircleIcon />,
  low: <ShieldIcon />,
  medium: <WarningIcon />,
  high: <WarningIcon />,
  critical: <ErrorIcon />,
};

/**
 * Security Posture Visualization Component
 */
const SecurityPostureVisualization: React.FC<SecurityPostureVisualizationProps> = ({
  metrics,
  title = 'Security Posture',
  showDetails = true,
  height = 300,
}) => {
  const theme = useTheme();

  // Calculate scores
  const { score, grade, riskLevel, breakdown } = useMemo(() => calculateSecurityScore(metrics), [metrics]);

  // Calculate trend
  const trend = useMemo(() => {
    if (metrics.previousScore === undefined) return 0;
    return score - metrics.previousScore;
  }, [score, metrics.previousScore]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    return breakdown.map((item) => ({
      category: item.category,
      score: item.score,
      fullMark: 100,
    }));
  }, [breakdown]);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Chip
          icon={riskIcons[riskLevel] as React.ReactElement}
          label={riskLabels[riskLevel]}
          sx={{
            bgcolor: riskColors[riskLevel],
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Score */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: height - 50,
            }}
          >
            {/* Score Circle */}
            <Box
              sx={{
                position: 'relative',
                width: 160,
                height: 160,
                borderRadius: '50%',
                border: `8px solid ${riskColors[riskLevel]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 30px ${riskColors[riskLevel]}40`,
                mb: 2,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: riskColors[riskLevel],
                    lineHeight: 1,
                  }}
                >
                  {score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / 100
                </Typography>
              </Box>
              {/* Grade Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: riskColors[riskLevel],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'white', fontWeight: 700 }}
                >
                  {grade}
                </Typography>
              </Box>
            </Box>

            {/* Trend */}
            {metrics.previousScore !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                ) : trend < 0 ? (
                  <TrendingDownIcon sx={{ color: 'error.main' }} />
                ) : (
                  <HorizontalRuleIcon sx={{ color: 'text.secondary' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend} from previous
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Radar Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ResponsiveContainer width="100%" height={height - 50}>
            <RadarChart data={radarData}>
              <PolarGrid
                stroke={theme.palette.divider}
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={riskColors[riskLevel]}
                fill={riskColors[riskLevel]}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>

      {/* Score Breakdown */}
      {showDetails && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Score Breakdown
          </Typography>
          <Grid container spacing={2}>
            {breakdown.map((item) => (
              <Grid size={{ xs: 6, sm: 3 }} key={item.category}>
                <Paper sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.category} ({item.weight}%)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Math.round(item.score)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {item.maxScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.score}
                    sx={{
                      mt: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'action.disabledBackground',
                      '& .MuiLinearProgress-bar': {
                        bgcolor:
                          item.score >= 80
                            ? 'success.main'
                            : item.score >= 60
                            ? 'warning.main'
                            : 'error.main',
                      },
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Quick Stats */}
      {showDetails && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Critical and High severity vulnerabilities">
            <Chip
              icon={<ErrorIcon />}
              label={`${metrics.vulnerabilities.critical + metrics.vulnerabilities.high} Critical/High`}
              color={metrics.vulnerabilities.critical + metrics.vulnerabilities.high > 0 ? 'error' : 'default'}
              variant="outlined"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Asset scan coverage">
            <Chip
              icon={<SecurityIcon />}
              label={`${metrics.coverage.scannedAssets}/${metrics.coverage.totalAssets} Assets Scanned`}
              color={metrics.coverage.scannedAssets === metrics.coverage.totalAssets ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Compliance checks passed">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${metrics.compliance.passed}/${metrics.compliance.passed + metrics.compliance.failed} Compliant`}
              color={metrics.compliance.failed === 0 ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Vulnerabilities fixed">
            <Chip
              icon={<ShieldIcon />}
              label={`${metrics.remediation.fixed} Fixed, ${metrics.remediation.pending} Pending`}
              color={metrics.remediation.pending === 0 ? 'success' : 'info'}
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};

export default SecurityPostureVisualization;
