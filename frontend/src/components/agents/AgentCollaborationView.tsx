/**
 * Agent Collaboration View Component
 * Visualizes multi-agent workflows and task coordination
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import type { Agent, AgentStatus } from '../../types';

export interface CollaborationTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  assignedAgent: Agent;
  dependencies: string[]; // Task IDs this task depends on
  startTime?: string;
  endTime?: string;
  output?: string;
}

export interface CollaborationWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  tasks: CollaborationTask[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface AgentCollaborationViewProps {
  workflow: CollaborationWorkflow | null;
  agents: Agent[];
  onStartWorkflow?: () => void;
  onPauseWorkflow?: () => void;
  onStopWorkflow?: () => void;
  onRestartTask?: (taskId: string) => void;
}

// Status to colors
const taskStatusColors: Record<CollaborationTask['status'], string> = {
  pending: '#b0bec5',
  running: '#00bcd4',
  completed: '#00ff41',
  failed: '#ff5252',
};

const workflowStatusColors: Record<CollaborationWorkflow['status'], string> = {
  idle: '#b0bec5',
  running: '#00bcd4',
  completed: '#00ff41',
  failed: '#ff5252',
  paused: '#ff9800',
};

const statusColorMap: Record<AgentStatus, 'success' | 'primary' | 'warning' | 'error'> = {
  active: 'success',
  busy: 'primary',
  standby: 'warning',
  error: 'error',
};

const AgentCollaborationView = ({
  workflow,
  agents,
  onStartWorkflow,
  onPauseWorkflow,
  onStopWorkflow,
  onRestartTask,
}: AgentCollaborationViewProps) => {
  const [viewMode, setViewMode] = useState<'flow' | 'timeline' | 'grid'>('flow');

  const getTaskStatusIcon = (status: CollaborationTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: taskStatusColors.completed }} />;
      case 'running':
        return <HourglassEmptyIcon sx={{ color: taskStatusColors.running }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: taskStatusColors.failed }} />;
      default:
        return <HourglassEmptyIcon sx={{ color: taskStatusColors.pending }} />;
    }
  };

  const renderTaskCard = (task: CollaborationTask, showConnector: boolean = false) => (
    <Box key={task.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card
        sx={{
          width: 280,
          border: '2px solid',
          borderColor: taskStatusColors[task.status],
          bgcolor: 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${taskStatusColors[task.status]}40`,
          },
        }}
      >
        <CardContent>
          {/* Task Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getTaskStatusIcon(task.status)}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {task.name}
              </Typography>
            </Box>
            <Chip
              label={task.status.toUpperCase()}
              size="small"
              sx={{
                bgcolor: `${taskStatusColors[task.status]}20`,
                color: taskStatusColors[task.status],
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            />
          </Box>

          {/* Agent Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'success.main' }}>
              <SmartToyIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Assigned Agent
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {task.assignedAgent.name}
              </Typography>
            </Box>
            <Chip
              label={task.assignedAgent.status}
              size="small"
              color={statusColorMap[task.assignedAgent.status]}
              sx={{ ml: 'auto', height: 18, fontSize: '0.6rem' }}
            />
          </Box>

          {/* Progress */}
          {task.status === 'running' && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  {task.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                }}
              />
            </Box>
          )}

          {/* Description */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {task.description}
          </Typography>

          {/* Actions */}
          {task.status === 'failed' && onRestartTask && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => onRestartTask(task.id)}
              sx={{ mt: 1 }}
            >
              Restart
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Connector Arrow */}
      {showConnector && (
        <Box sx={{ py: 1 }}>
          <ArrowDownwardIcon sx={{ color: 'primary.main' }} />
        </Box>
      )}
    </Box>
  );

  const renderFlowView = () => {
    if (!workflow) return null;

    // Group tasks by their completion order
    const completedTasks = workflow.tasks.filter((t) => t.status === 'completed');
    const runningTasks = workflow.tasks.filter((t) => t.status === 'running');
    const pendingTasks = workflow.tasks.filter((t) => t.status === 'pending');
    const failedTasks = workflow.tasks.filter((t) => t.status === 'failed');

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
        {/* Completed Tasks */}
        {completedTasks.map((task, index) =>
          renderTaskCard(task, index < completedTasks.length - 1 || runningTasks.length > 0)
        )}

        {/* Running Tasks */}
        {runningTasks.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'primary.main',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                width: '100%',
                textAlign: 'center',
                color: 'primary.main',
                fontWeight: 600,
                mb: 1,
              }}
            >
              🔄 CURRENTLY RUNNING
            </Typography>
            {runningTasks.map((task) => renderTaskCard(task, false))}
          </Box>
        )}

        {/* Connector */}
        {(runningTasks.length > 0 || completedTasks.length > 0) && pendingTasks.length > 0 && (
          <ArrowDownwardIcon sx={{ color: 'text.secondary' }} />
        )}

        {/* Pending Tasks */}
        {pendingTasks.map((task, index) => renderTaskCard(task, index < pendingTasks.length - 1))}

        {/* Failed Tasks */}
        {failedTasks.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
              p: 2,
              bgcolor: 'error.dark',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'error.main',
              opacity: 0.9,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                width: '100%',
                textAlign: 'center',
                color: 'error.light',
                fontWeight: 600,
                mb: 1,
              }}
            >
              ❌ FAILED TASKS
            </Typography>
            {failedTasks.map((task) => renderTaskCard(task, false))}
          </Box>
        )}
      </Box>
    );
  };

  const renderTimelineView = () => {
    if (!workflow) return null;

    return (
      <Box sx={{ py: 3 }}>
        {workflow.tasks.map((task, index) => (
          <Box key={task.id} sx={{ display: 'flex', mb: 3 }}>
            {/* Timeline indicator */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: taskStatusColors[task.status],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getTaskStatusIcon(task.status)}
              </Box>
              {index < workflow.tasks.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flexGrow: 1,
                    minHeight: 60,
                    bgcolor: 'divider',
                    mt: 1,
                  }}
                />
              )}
            </Box>

            {/* Task content */}
            <Box sx={{ flexGrow: 1 }}>{renderTaskCard(task, false)}</Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderGridView = () => {
    if (!workflow) return null;

    return (
      <Grid container spacing={3} sx={{ py: 3 }}>
        {workflow.tasks.map((task) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
            {renderTaskCard(task, false)}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderViewContent = () => {
    switch (viewMode) {
      case 'flow':
        return renderFlowView();
      case 'timeline':
        return renderTimelineView();
      case 'grid':
        return renderGridView();
      default:
        return renderFlowView();
    }
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupWorkIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Agent Collaboration
            </Typography>
            {workflow && (
              <Chip
                label={workflow.status.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: `${workflowStatusColors[workflow.status]}20`,
                  color: workflowStatusColors[workflow.status],
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Flow View">
              <IconButton
                onClick={() => setViewMode('flow')}
                color={viewMode === 'flow' ? 'primary' : 'default'}
              >
                <AccountTreeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Timeline View">
              <IconButton
                onClick={() => setViewMode('timeline')}
                color={viewMode === 'timeline' ? 'primary' : 'default'}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GroupWorkIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Workflow Info */}
        {workflow && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {workflow.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {workflow.description}
              </Typography>
            </Box>

            {/* Workflow Controls */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {workflow.status === 'idle' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={onStartWorkflow}
                  color="primary"
                >
                  Start
                </Button>
              )}
              {workflow.status === 'running' && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<PauseIcon />}
                    onClick={onPauseWorkflow}
                    color="warning"
                  >
                    Pause
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<StopIcon />}
                    onClick={onStopWorkflow}
                    color="error"
                  >
                    Stop
                  </Button>
                </>
              )}
              {workflow.status === 'paused' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={onStartWorkflow}
                  color="primary"
                >
                  Resume
                </Button>
              )}
              {(workflow.status === 'completed' || workflow.status === 'failed') && (
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={onStartWorkflow}
                  color="primary"
                >
                  Restart
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Progress Summary */}
      {workflow && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Progress:
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={
                  (workflow.tasks.filter((t) => t.status === 'completed').length / workflow.tasks.length) *
                  100
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              {workflow.tasks.filter((t) => t.status === 'completed').length}/{workflow.tasks.length} tasks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip
              label={`${workflow.tasks.filter((t) => t.status === 'completed').length} Completed`}
              size="small"
              sx={{ bgcolor: `${taskStatusColors.completed}20`, color: taskStatusColors.completed }}
            />
            <Chip
              label={`${workflow.tasks.filter((t) => t.status === 'running').length} Running`}
              size="small"
              sx={{ bgcolor: `${taskStatusColors.running}20`, color: taskStatusColors.running }}
            />
            <Chip
              label={`${workflow.tasks.filter((t) => t.status === 'pending').length} Pending`}
              size="small"
              sx={{ bgcolor: `${taskStatusColors.pending}20`, color: taskStatusColors.pending }}
            />
            {workflow.tasks.filter((t) => t.status === 'failed').length > 0 && (
              <Chip
                label={`${workflow.tasks.filter((t) => t.status === 'failed').length} Failed`}
                size="small"
                sx={{ bgcolor: `${taskStatusColors.failed}20`, color: taskStatusColors.failed }}
              />
            )}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {!workflow ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <GroupWorkIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Active Workflow
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
              Create a multi-agent workflow to see agents collaborating on complex security tasks.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} startIcon={<PlayArrowIcon />}>
              Create Workflow
            </Button>
          </Box>
        ) : (
          renderViewContent()
        )}
      </Box>

      {/* Active Agents Summary */}
      {workflow && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Active Agents ({agents.filter((a) => a.status === 'active' || a.status === 'busy').length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {agents
              .filter((a) => a.status === 'active' || a.status === 'busy')
              .map((agent) => (
                <Chip
                  key={agent.id}
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <SmartToyIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                  }
                  label={agent.name}
                  size="small"
                  variant="outlined"
                  color={statusColorMap[agent.status]}
                />
              ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AgentCollaborationView;
