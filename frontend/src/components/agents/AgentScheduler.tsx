/**
 * Agent Scheduler Component
 * Sprint 4: Build agent scheduling system
 * Allows scheduling automated agent tasks for recurring security assessments
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RepeatIcon from '@mui/icons-material/Repeat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Agent } from '../../types';

export interface ScheduledTask {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  command: string;
  schedule: ScheduleConfig;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
}

interface ScheduleConfig {
  type: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone: string;
}

interface AgentSchedulerProps {
  agents: Agent[];
  scheduledTasks?: ScheduledTask[];
  onCreateTask?: (task: Omit<ScheduledTask, 'id' | 'createdAt' | 'lastRun' | 'nextRun'>) => void;
  onUpdateTask?: (task: ScheduledTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string, enabled: boolean) => void;
}

// Mock scheduled tasks for demo
const MOCK_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: 'task-1',
    name: 'Daily Vulnerability Scan',
    agentId: '1',
    agentName: 'BugBounty Agent',
    command: 'Scan all targets for new vulnerabilities',
    schedule: {
      type: 'daily',
      time: '02:00',
      timezone: 'UTC',
    },
    enabled: true,
    lastRun: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    name: 'Weekly Network Reconnaissance',
    agentId: '11',
    agentName: 'Network Recon',
    command: 'Perform full network scan and service detection',
    schedule: {
      type: 'weekly',
      time: '03:00',
      dayOfWeek: 1,
      timezone: 'UTC',
    },
    enabled: true,
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    name: 'Monthly Security Report',
    agentId: '12',
    agentName: 'Report Generator',
    command: 'Generate comprehensive monthly security report',
    schedule: {
      type: 'monthly',
      time: '08:00',
      dayOfMonth: 1,
      timezone: 'UTC',
    },
    enabled: false,
    lastRun: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SCHEDULE_TYPES = [
  { value: 'once', label: 'Once', icon: '⏱️' },
  { value: 'hourly', label: 'Hourly', icon: '🔄' },
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const AgentScheduler = ({
  agents,
  scheduledTasks: externalTasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}: AgentSchedulerProps) => {
  // Use external tasks if provided, otherwise use mock data
  const [internalTasks, setInternalTasks] = useState<ScheduledTask[]>(MOCK_SCHEDULED_TASKS);
  const scheduledTasks = externalTasks || internalTasks;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    agentId: '',
    command: '',
    scheduleType: 'daily' as ScheduleConfig['type'],
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    enabled: true,
  });

  const handleOpenDialog = (task?: ScheduledTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        name: task.name,
        agentId: task.agentId,
        command: task.command,
        scheduleType: task.schedule.type,
        time: task.schedule.time,
        dayOfWeek: task.schedule.dayOfWeek || 1,
        dayOfMonth: task.schedule.dayOfMonth || 1,
        enabled: task.enabled,
      });
    } else {
      setEditingTask(null);
      setFormData({
        name: '',
        agentId: agents[0]?.id || '',
        command: '',
        scheduleType: 'daily',
        time: '09:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        enabled: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = () => {
    const selectedAgent = agents.find((a) => a.id === formData.agentId);
    
    const taskData = {
      name: formData.name,
      agentId: formData.agentId,
      agentName: selectedAgent?.name || 'Unknown Agent',
      command: formData.command,
      schedule: {
        type: formData.scheduleType,
        time: formData.time,
        dayOfWeek: formData.scheduleType === 'weekly' ? formData.dayOfWeek : undefined,
        dayOfMonth: formData.scheduleType === 'monthly' ? formData.dayOfMonth : undefined,
        timezone: 'UTC',
      },
      enabled: formData.enabled,
    };

    if (editingTask) {
      if (onUpdateTask) {
        onUpdateTask({
          ...editingTask,
          ...taskData,
        });
      } else {
        setInternalTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
        );
      }
    } else {
      if (onCreateTask) {
        onCreateTask(taskData);
      } else {
        // Generate unique ID inside the state updater to avoid impure function during render
        setInternalTasks((prev) => {
          const newTask: ScheduledTask = {
            id: `task-${crypto.randomUUID()}`,
            ...taskData,
            nextRun: calculateNextRun(taskData.schedule),
            createdAt: new Date().toISOString(),
          };
          return [...prev, newTask];
        });
      }
    }

    handleCloseDialog();
  };

  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    } else {
      setInternalTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleToggleTask = (taskId: string, enabled: boolean) => {
    if (onToggleTask) {
      onToggleTask(taskId, enabled);
    } else {
      setInternalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, enabled } : t))
      );
    }
  };

  const calculateNextRun = (schedule: ScheduleConfig): string => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    if (next <= now) {
      switch (schedule.type) {
        case 'hourly':
          next.setHours(next.getHours() + 1);
          break;
        case 'daily':
          next.setDate(next.getDate() + 1);
          break;
        case 'weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + 1);
          break;
      }
    }
    
    return next.toISOString();
  };

  const formatNextRun = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `In ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `In ${diffHours} hours`;
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatSchedule = (schedule: ScheduleConfig): string => {
    switch (schedule.type) {
      case 'once':
        return `Once at ${schedule.time}`;
      case 'hourly':
        return `Every hour at :${schedule.time.split(':')[1]}`;
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'weekly':
        return `Every ${DAYS_OF_WEEK[schedule.dayOfWeek || 0]} at ${schedule.time}`;
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time}`;
      default:
        return 'Unknown schedule';
    }
  };

  const getScheduleChipColor = (type: ScheduleConfig['type']) => {
    switch (type) {
      case 'hourly':
        return 'warning';
      case 'daily':
        return 'info';
      case 'weekly':
        return 'primary';
      case 'monthly':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Agent Scheduler
            </Typography>
            <Chip
              label={`${scheduledTasks.filter((t) => t.enabled).length} Active`}
              size="small"
              color="success"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={agents.length === 0}
          >
            New Schedule
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Automate your security assessments with scheduled agent tasks
        </Typography>
      </Paper>

      {/* Scheduled Tasks List */}
      <Paper sx={{ flex: 1, overflow: 'auto' }}>
        {scheduledTasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
            }}
          >
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Scheduled Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              Create your first scheduled task to automate security assessments
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={agents.length === 0}
            >
              Create Schedule
            </Button>
          </Box>
        ) : (
          <List>
            {scheduledTasks.map((task, index) => (
              <Box key={task.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    opacity: task.enabled ? 1 : 0.6,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon>
                    <SmartToyIcon color={task.enabled ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {task.name}
                        </Typography>
                        <Chip
                          label={task.schedule.type}
                          size="small"
                          color={getScheduleChipColor(task.schedule.type) as 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning'}
                          variant="outlined"
                        />
                        {!task.enabled && (
                          <Chip label="Paused" size="small" color="default" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Agent:</strong> {task.agentName} •{' '}
                          <strong>Command:</strong> {task.command}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <RepeatIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatSchedule(task.schedule)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Next: {formatNextRun(task.nextRun)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleToggleTask(task.id, !task.enabled)}
                      color={task.enabled ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      {task.enabled ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDialog(task)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTask(task.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Scheduled Task' : 'Create Scheduled Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Task Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Daily Security Scan"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Agent</InputLabel>
                <Select
                  value={formData.agentId}
                  label="Agent"
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon fontSize="small" />
                        {agent.name}
                        <Chip
                          label={agent.status}
                          size="small"
                          color={agent.status === 'active' ? 'success' : 'default'}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Command"
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                placeholder="Scan example.com for vulnerabilities"
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={formData.scheduleType}
                  label="Schedule Type"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleType: e.target.value as ScheduleConfig['type'],
                    })
                  }
                >
                  {SCHEDULE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Grid>

            {formData.scheduleType === 'weekly' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    value={formData.dayOfWeek}
                    label="Day of Week"
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfWeek: e.target.value as number })
                    }
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <MenuItem key={index} value={index}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.scheduleType === 'monthly' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Day of Month"
                  type="number"
                  value={formData.dayOfMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dayOfMonth: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                  slotProps={{
                    htmlInput: { min: 1, max: 31 },
                  }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Enable schedule immediately"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                This task will run automatically according to the schedule. Make sure the selected
                agent is configured properly.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTask}
            disabled={!formData.name || !formData.agentId || !formData.command}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentScheduler;
