/**
 * Process Tree Visualization Component
 * Displays hierarchical process tree for tool execution monitoring
 * Sprint 6 Feature - Process Tree Visualization
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Tooltip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import TerminalIcon from '@mui/icons-material/Terminal';
import MemoryIcon from '@mui/icons-material/Memory';

/**
 * Represents a process node in the execution tree
 */
export interface ProcessNode {
  id: string;
  name: string;
  command?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'stopped';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  pid?: number;
  parentId?: string;
  children?: ProcessNode[];
  output?: string;
  exitCode?: number;
  resourceUsage?: {
    cpu: number;
    memory: number;
  };
}

interface ProcessTreeVisualizationProps {
  processes: ProcessNode[];
  title?: string;
  onProcessClick?: (process: ProcessNode) => void;
  onStopProcess?: (processId: string) => void;
  onPauseProcess?: (processId: string) => void;
  maxHeight?: number | string;
}

interface ProcessTreeNodeProps {
  node: ProcessNode;
  level: number;
  onProcessClick?: (process: ProcessNode) => void;
  onStopProcess?: (processId: string) => void;
  onPauseProcess?: (processId: string) => void;
}

const statusColors: Record<ProcessNode['status'], string> = {
  pending: 'default',
  running: 'primary',
  completed: 'success',
  failed: 'error',
  paused: 'warning',
  stopped: 'default',
};

const statusIcons: Record<ProcessNode['status'], React.ReactNode> = {
  pending: <AccessTimeIcon fontSize="small" />,
  running: <PlayArrowIcon fontSize="small" />,
  completed: <CheckCircleIcon fontSize="small" />,
  failed: <ErrorIcon fontSize="small" />,
  paused: <PauseIcon fontSize="small" />,
  stopped: <StopIcon fontSize="small" />,
};

/**
 * Individual process tree node component
 */
const ProcessTreeNode: React.FC<ProcessTreeNodeProps> = ({
  node,
  level,
  onProcessClick,
  onStopProcess,
  onPauseProcess,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(node.status === 'running' || level === 0);
  const hasChildren = node.children && node.children.length > 0;

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  // Calculate duration - for running processes, the elapsed time is calculated once
  // and will update when the parent component re-renders with updated process data.
  // This is intentional to avoid unnecessary re-renders during the render phase.
  const duration = useMemo(() => {
    if (node.duration) return formatDuration(node.duration);
    if (node.startTime && node.endTime) {
      return formatDuration(node.endTime.getTime() - node.startTime.getTime());
    }
    if (node.startTime) {
      // For running processes, calculate elapsed time at render time
      const elapsed = new Date().getTime() - node.startTime.getTime();
      return formatDuration(elapsed);
    }
    return '-';
  }, [node.duration, node.startTime, node.endTime]);

  return (
    <Box sx={{ ml: level * 2 }}>
      <Paper
        sx={{
          p: 1.5,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          borderLeft: 3,
          borderColor: `${statusColors[node.status]}.main`,
          bgcolor: node.status === 'running' ? 'action.selected' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateX(4px)',
          },
        }}
        elevation={node.status === 'running' ? 3 : 1}
        onClick={() => onProcessClick?.(node)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ p: 0.25 }}
          >
            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        {!hasChildren && <Box sx={{ width: 24 }} />}

        {/* Process Icon */}
        <TerminalIcon fontSize="small" color="action" />

        {/* Process Name & Command */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {node.name}
            </Typography>
            {node.pid && (
              <Typography variant="caption" color="text.secondary">
                PID: {node.pid}
              </Typography>
            )}
          </Box>
          {node.command && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              $ {node.command}
            </Typography>
          )}
          {node.status === 'running' && node.progress !== undefined && (
            <LinearProgress
              variant="determinate"
              value={node.progress}
              sx={{ mt: 0.5, height: 3, borderRadius: 1 }}
            />
          )}
        </Box>

        {/* Resource Usage */}
        {node.resourceUsage && node.status === 'running' && (
          <Tooltip title={`CPU: ${node.resourceUsage.cpu}% | Memory: ${node.resourceUsage.memory}%`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MemoryIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {node.resourceUsage.cpu}%
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Duration */}
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
          {duration}
        </Typography>

        {/* Status Chip */}
        <Chip
          icon={statusIcons[node.status] as React.ReactElement}
          label={node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          size="small"
          color={statusColors[node.status] as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          sx={{ minWidth: 90 }}
        />

        {/* Action Buttons */}
        {node.status === 'running' && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onPauseProcess && (
              <Tooltip title="Pause">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPauseProcess(node.id);
                  }}
                >
                  <PauseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onStopProcess && (
              <Tooltip title="Stop">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopProcess(node.id);
                  }}
                >
                  <StopIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Exit Code for completed processes */}
        {node.status === 'completed' && node.exitCode !== undefined && (
          <Chip
            label={`Exit: ${node.exitCode}`}
            size="small"
            color={node.exitCode === 0 ? 'success' : 'warning'}
            variant="outlined"
          />
        )}
      </Paper>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded}>
          <Box
            sx={{
              borderLeft: `2px dashed ${theme.palette.divider}`,
              ml: 1.5,
              pl: 1,
            }}
          >
            {node.children!.map((child) => (
              <ProcessTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                onProcessClick={onProcessClick}
                onStopProcess={onStopProcess}
                onPauseProcess={onPauseProcess}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * Process Tree Visualization Component
 * Displays hierarchical process tree for tool execution monitoring
 */
const ProcessTreeVisualization: React.FC<ProcessTreeVisualizationProps> = ({
  processes,
  title = 'Process Tree',
  onProcessClick,
  onStopProcess,
  onPauseProcess,
  maxHeight = 500,
}) => {
  // Build tree structure from flat list
  const treeStructure = useMemo(() => {
    const nodeMap = new Map<string, ProcessNode>();
    const rootNodes: ProcessNode[] = [];

    // First pass: create a map of all nodes
    processes.forEach((process) => {
      nodeMap.set(process.id, { ...process, children: [] });
    });

    // Second pass: build the tree
    processes.forEach((process) => {
      const node = nodeMap.get(process.id)!;
      if (process.parentId && nodeMap.has(process.parentId)) {
        const parent = nodeMap.get(process.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }, [processes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const running = processes.filter((p) => p.status === 'running').length;
    const completed = processes.filter((p) => p.status === 'completed').length;
    const failed = processes.filter((p) => p.status === 'failed').length;
    const total = processes.length;

    return { running, completed, failed, total };
  }, [processes]);

  if (processes.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <AccountTreeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No processes to display
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start a tool execution to see the process tree
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {/* Statistics */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${stats.total} Total`}
            size="small"
            variant="outlined"
          />
          {stats.running > 0 && (
            <Chip
              icon={<PlayArrowIcon />}
              label={`${stats.running} Running`}
              size="small"
              color="primary"
            />
          )}
          {stats.completed > 0 && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${stats.completed} Done`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {stats.failed > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${stats.failed} Failed`}
              size="small"
              color="error"
            />
          )}
        </Box>
      </Box>

      {/* Process Tree */}
      <Box
        sx={{
          maxHeight,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.hover',
            borderRadius: 4,
          },
        }}
      >
        {treeStructure.map((node) => (
          <ProcessTreeNode
            key={node.id}
            node={node}
            level={0}
            onProcessClick={onProcessClick}
            onStopProcess={onStopProcess}
            onPauseProcess={onPauseProcess}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default ProcessTreeVisualization;
