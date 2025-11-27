/**
 * Scan Timeline Visualization Component
 * Sprint 8: Create scan timeline visualization
 * Visual timeline showing scan phases, events, and discoveries over time
 */

import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import RadarIcon from '@mui/icons-material/Radar';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'phase_start' | 'phase_end' | 'vulnerability_found' | 'tool_complete' | 'error' | 'info';
  title: string;
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  toolName?: string;
  phase?: string;
}

export interface ScanPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  progress: number;
  toolsUsed: string[];
  findingsCount: number;
}

interface ScanTimelineVisualizationProps {
  phases: ScanPhase[];
  events: TimelineEvent[];
  scanStartTime: Date;
  scanEndTime?: Date;
  currentTime?: Date;
}

const PHASE_COLORS = {
  pending: '#9e9e9e',
  running: '#2196f3',
  completed: '#4caf50',
  failed: '#f44336',
};

const SEVERITY_COLORS = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#ffc107',
  info: '#2196f3',
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  phase_start: <RadarIcon fontSize="small" />,
  phase_end: <CheckCircleIcon fontSize="small" />,
  vulnerability_found: <BugReportIcon fontSize="small" />,
  tool_complete: <SecurityIcon fontSize="small" />,
  error: <ErrorIcon fontSize="small" />,
  info: <AccessTimeIcon fontSize="small" />,
};

const ScanTimelineVisualization = ({
  phases,
  events,
  scanStartTime,
  scanEndTime,
  currentTime = new Date(),
}: ScanTimelineVisualizationProps) => {
  // Calculate total scan duration
  const totalDuration = useMemo(() => {
    const end = scanEndTime || currentTime;
    return end.getTime() - scanStartTime.getTime();
  }, [scanStartTime, scanEndTime, currentTime]);

  // Calculate elapsed time
  const elapsedDuration = useMemo(() => {
    return currentTime.getTime() - scanStartTime.getTime();
  }, [scanStartTime, currentTime]);

  // Calculate position on timeline (0-100%)
  const getTimelinePosition = (time: Date): number => {
    const elapsed = time.getTime() - scanStartTime.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  // Format duration for display
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Group events by type for summary
  const eventSummary = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        if (event.type === 'vulnerability_found') {
          acc.vulnerabilities++;
          if (event.severity === 'critical') acc.critical++;
          else if (event.severity === 'high') acc.high++;
          else if (event.severity === 'medium') acc.medium++;
          else if (event.severity === 'low') acc.low++;
        } else if (event.type === 'error') {
          acc.errors++;
        } else if (event.type === 'tool_complete') {
          acc.toolsCompleted++;
        }
        return acc;
      },
      { vulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0, errors: 0, toolsCompleted: 0 }
    );
  }, [events]);

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RadarIcon color="primary" />
          Scan Timeline
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${formatDuration(elapsedDuration)} elapsed`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {eventSummary.vulnerabilities > 0 && (
            <Chip
              label={`${eventSummary.vulnerabilities} vulns`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: SEVERITY_COLORS.critical }} />
          <Typography variant="caption">Critical: {eventSummary.critical}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: SEVERITY_COLORS.high }} />
          <Typography variant="caption">High: {eventSummary.high}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: SEVERITY_COLORS.medium }} />
          <Typography variant="caption">Medium: {eventSummary.medium}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: SEVERITY_COLORS.low }} />
          <Typography variant="caption">Low: {eventSummary.low}</Typography>
        </Box>
      </Box>

      {/* Phase Progress Bars */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Scan Phases
        </Typography>
        {phases.map((phase, index) => (
          <Box key={phase.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: PHASE_COLORS[phase.status],
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: phase.status === 'running' ? 600 : 400 }}>
                  {phase.name}
                </Typography>
                <Chip
                  label={phase.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: PHASE_COLORS[phase.status],
                    color: 'white',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {phase.findingsCount > 0 && (
                  <Chip
                    label={`${phase.findingsCount} findings`}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {phase.progress}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={phase.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  bgcolor: PHASE_COLORS[phase.status],
                  borderRadius: 4,
                },
              }}
            />
            {phase.toolsUsed.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {phase.toolsUsed.map((tool) => (
                  <Chip
                    key={tool}
                    label={tool}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.6rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Timeline Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Event Timeline
        </Typography>
        <Box
          sx={{
            position: 'relative',
            height: 60,
            bgcolor: 'action.hover',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Background progress */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${(elapsedDuration / totalDuration) * 100}%`,
              bgcolor: 'primary.dark',
              opacity: 0.2,
            }}
          />

          {/* Event markers */}
          {events.map((event) => {
            const position = getTimelinePosition(event.timestamp);
            const color = event.severity
              ? SEVERITY_COLORS[event.severity]
              : event.type === 'error'
                ? '#f44336'
                : event.type === 'tool_complete'
                  ? '#4caf50'
                  : '#2196f3';

            return (
              <Tooltip
                key={event.id}
                title={
                  <Box>
                    <Typography variant="subtitle2">{event.title}</Typography>
                    {event.description && (
                      <Typography variant="caption">{event.description}</Typography>
                    )}
                    <Typography variant="caption" display="block">
                      {formatTime(event.timestamp)}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      zIndex: 10,
                    },
                  }}
                >
                  {EVENT_ICONS[event.type]}
                </Box>
              </Tooltip>
            );
          })}

          {/* Current time indicator */}
          {!scanEndTime && (
            <Box
              sx={{
                position: 'absolute',
                left: `${(elapsedDuration / totalDuration) * 100}%`,
                top: 0,
                height: '100%',
                width: 2,
                bgcolor: 'primary.main',
                zIndex: 2,
              }}
            />
          )}
        </Box>

        {/* Time labels */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatTime(scanStartTime)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {scanEndTime ? formatTime(scanEndTime) : 'In Progress...'}
          </Typography>
        </Box>
      </Box>

      {/* Event List */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Events ({events.length})
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {events
            .slice()
            .reverse()
            .slice(0, 10)
            .map((event) => (
              <Box
                key={event.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  sx={{
                    color: event.severity
                      ? SEVERITY_COLORS[event.severity]
                      : event.type === 'error'
                        ? '#f44336'
                        : '#4caf50',
                  }}
                >
                  {EVENT_ICONS[event.type]}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{event.title}</Typography>
                  {event.description && (
                    <Typography variant="caption" color="text.secondary">
                      {event.description}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(event.timestamp)}
                </Typography>
                {event.severity && (
                  <Chip
                    label={event.severity}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      bgcolor: SEVERITY_COLORS[event.severity],
                      color: 'white',
                    }}
                  />
                )}
              </Box>
            ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ScanTimelineVisualization;
