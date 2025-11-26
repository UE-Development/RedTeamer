/**
 * Agent Performance Metrics Component
 * Displays performance statistics and metrics for AI agents
 */

import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { Agent } from '../../types';

interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  averageResponseTime: number; // in seconds
  successRate: number; // percentage
  vulnerabilitiesFound: number;
  toolsUsed: number;
  uptime: number; // percentage
  lastActiveTime: string;
}

interface AgentPerformanceMetricsProps {
  agent: Agent | null;
  metrics?: AgentMetrics;
}

// Mock metrics generator based on agent type
const generateMockMetrics = (agent: Agent): AgentMetrics => {
  const baseMetrics: Record<string, Partial<AgentMetrics>> = {
    bugbounty: {
      tasksCompleted: 156,
      vulnerabilitiesFound: 47,
      toolsUsed: 23,
      successRate: 94,
    },
    ctf: {
      tasksCompleted: 89,
      vulnerabilitiesFound: 12,
      toolsUsed: 18,
      successRate: 87,
    },
    cve_intelligence: {
      tasksCompleted: 234,
      vulnerabilitiesFound: 0,
      toolsUsed: 8,
      successRate: 99,
    },
    exploit_generator: {
      tasksCompleted: 67,
      vulnerabilitiesFound: 34,
      toolsUsed: 15,
      successRate: 82,
    },
    web_security: {
      tasksCompleted: 198,
      vulnerabilitiesFound: 56,
      toolsUsed: 28,
      successRate: 91,
    },
    auth_testing: {
      tasksCompleted: 112,
      vulnerabilitiesFound: 23,
      toolsUsed: 12,
      successRate: 88,
    },
    mobile_security: {
      tasksCompleted: 45,
      vulnerabilitiesFound: 18,
      toolsUsed: 10,
      successRate: 85,
    },
    cloud_security: {
      tasksCompleted: 78,
      vulnerabilitiesFound: 31,
      toolsUsed: 14,
      successRate: 92,
    },
    binary_analysis: {
      tasksCompleted: 34,
      vulnerabilitiesFound: 8,
      toolsUsed: 6,
      successRate: 79,
    },
    osint: {
      tasksCompleted: 267,
      vulnerabilitiesFound: 0,
      toolsUsed: 19,
      successRate: 96,
    },
    network_recon: {
      tasksCompleted: 189,
      vulnerabilitiesFound: 42,
      toolsUsed: 21,
      successRate: 93,
    },
    report_generator: {
      tasksCompleted: 145,
      vulnerabilitiesFound: 0,
      toolsUsed: 5,
      successRate: 98,
    },
  };

  const base = baseMetrics[agent.type] || {};
  const isActive = agent.status === 'active' || agent.status === 'busy';

  return {
    tasksCompleted: base.tasksCompleted || 50,
    tasksInProgress: isActive ? Math.floor(Math.random() * 3) + 1 : 0,
    averageResponseTime: Math.random() * 2 + 0.5,
    successRate: base.successRate || 85,
    vulnerabilitiesFound: base.vulnerabilitiesFound || 10,
    toolsUsed: base.toolsUsed || 10,
    uptime: isActive ? 99.5 + Math.random() * 0.5 : 0,
    lastActiveTime: agent.lastActive,
  };
};

const MetricCard = ({
  title,
  value,
  icon,
  color = 'primary',
  suffix = '',
  progress,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  suffix?: string;
  progress?: number;
}) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: `${color}.main` }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
    </Box>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        color: `${color}.main`,
      }}
    >
      {value}
      {suffix && (
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          {suffix}
        </Typography>
      )}
    </Typography>
    {progress !== undefined && (
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{ mt: 1, height: 4, borderRadius: 2 }}
      />
    )}
  </Paper>
);

const AgentPerformanceMetrics = ({ agent, metrics: providedMetrics }: AgentPerformanceMetricsProps) => {
  if (!agent) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <SpeedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Select an agent to view performance metrics
        </Typography>
      </Paper>
    );
  }

  const metrics = providedMetrics || generateMockMetrics(agent);
  const isActive = agent.status === 'active' || agent.status === 'busy';

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SpeedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Performance Metrics
        </Typography>
        <Chip
          label={isActive ? 'LIVE' : 'OFFLINE'}
          size="small"
          color={isActive ? 'success' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="Tasks Completed"
            value={metrics.tasksCompleted}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="In Progress"
            value={metrics.tasksInProgress}
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="Response Time"
            value={metrics.averageResponseTime.toFixed(1)}
            suffix="s"
            icon={<AccessTimeIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="Success Rate"
            value={metrics.successRate}
            suffix="%"
            icon={<CheckCircleIcon />}
            color={metrics.successRate >= 90 ? 'success' : metrics.successRate >= 70 ? 'warning' : 'error'}
            progress={metrics.successRate}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="Vulns Found"
            value={metrics.vulnerabilitiesFound}
            icon={<BugReportIcon />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <MetricCard
            title="Tools Used"
            value={metrics.toolsUsed}
            icon={<BuildIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Uptime Bar */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Uptime
          </Typography>
          <Tooltip title={`Last active: ${new Date(metrics.lastActiveTime).toLocaleString()}`}>
            <Typography
              variant="caption"
              color={metrics.uptime > 99 ? 'success.main' : metrics.uptime > 95 ? 'warning.main' : 'error.main'}
              sx={{ fontWeight: 600 }}
            >
              {metrics.uptime.toFixed(2)}%
            </Typography>
          </Tooltip>
        </Box>
        <LinearProgress
          variant="determinate"
          value={metrics.uptime}
          color={metrics.uptime > 99 ? 'success' : metrics.uptime > 95 ? 'warning' : 'error'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Capabilities */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Capabilities
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {agent.capabilities.slice(0, 6).map((capability, index) => (
            <Chip
              key={index}
              label={capability}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          ))}
          {agent.capabilities.length > 6 && (
            <Chip
              label={`+${agent.capabilities.length - 6} more`}
              size="small"
              color="primary"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default AgentPerformanceMetrics;
