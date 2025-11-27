/**
 * Agent Configuration Panel Component
 * Sprint 4: Add agent configuration panels
 * Allows users to configure AI agent settings and behaviors
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Slider,
  Chip,
  Grid,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Agent } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

interface AgentConfigurationPanelProps {
  open: boolean;
  onClose: () => void;
  agent: Agent | null;
  onSave?: (agent: Agent, config: AgentConfig) => void;
}

interface AgentConfig {
  behavior: {
    autoExecute: boolean;
    confirmBeforeAction: boolean;
    verboseMode: boolean;
    stealthMode: boolean;
  };
  performance: {
    maxConcurrentTasks: number;
    timeout: number;
    retryAttempts: number;
    priority: 'low' | 'normal' | 'high';
  };
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    onVulnerabilityFound: boolean;
  };
  tools: {
    preferredTools: string[];
    excludedTools: string[];
    autoSelectTools: boolean;
  };
}

const DEFAULT_CONFIG: AgentConfig = {
  behavior: {
    autoExecute: false,
    confirmBeforeAction: true,
    verboseMode: false,
    stealthMode: false,
  },
  performance: {
    maxConcurrentTasks: 3,
    timeout: 300,
    retryAttempts: 2,
    priority: 'normal',
  },
  notifications: {
    onStart: true,
    onComplete: true,
    onError: true,
    onVulnerabilityFound: true,
  },
  tools: {
    preferredTools: [],
    excludedTools: [],
    autoSelectTools: true,
  },
};

const AVAILABLE_TOOLS = [
  'Nmap',
  'Nuclei',
  'SQLMap',
  'Gobuster',
  'FFuf',
  'Nikto',
  'Masscan',
  'Amass',
  'Subfinder',
  'Trivy',
  'Prowler',
  'TheHarvester',
];

const AgentConfigurationPanel = ({
  open,
  onClose,
  agent,
  onSave,
}: AgentConfigurationPanelProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  if (!agent) return null;

  const updateConfig = <K extends keyof AgentConfig>(
    section: K,
    updates: Partial<AgentConfig[K]>
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(agent, config);
    }
    setHasChanges(false);
    onClose();
  };

  const getAgentIcon = (type: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      bugbounty: <SecurityIcon color="primary" />,
      web_security: <SecurityIcon color="secondary" />,
      network_recon: <SpeedIcon color="info" />,
    };
    return icons[type] || <SettingsIcon />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getAgentIcon(agent.type)}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Configure {agent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Customize agent behavior and settings
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={agent.status}
            size="small"
            color={agent.status === 'active' ? 'success' : 'default'}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Behavior" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Performance" icon={<SpeedIcon />} iconPosition="start" />
          <Tab label="Tools" icon={<TuneIcon />} iconPosition="start" />
          <Tab label="Info" icon={<InfoIcon />} iconPosition="start" />
        </Tabs>

        {/* Behavior Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Execution Settings
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.behavior.autoExecute}
                      onChange={(e) => updateConfig('behavior', { autoExecute: e.target.checked })}
                    />
                  }
                  label="Auto-execute commands without confirmation"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                  When enabled, agent will execute security commands automatically
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.behavior.confirmBeforeAction}
                      onChange={(e) => updateConfig('behavior', { confirmBeforeAction: e.target.checked })}
                    />
                  }
                  label="Confirm before destructive actions"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                  Ask for confirmation before performing actions that modify data
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.behavior.verboseMode}
                      onChange={(e) => updateConfig('behavior', { verboseMode: e.target.checked })}
                    />
                  }
                  label="Verbose output mode"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                  Show detailed output and progress information
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.behavior.stealthMode}
                      onChange={(e) => updateConfig('behavior', { stealthMode: e.target.checked })}
                    />
                  }
                  label="Stealth mode"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Use slower, less detectable scanning techniques
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <AlertTitle>Notification Settings</AlertTitle>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notifications.onVulnerabilityFound}
                      onChange={(e) => updateConfig('notifications', { onVulnerabilityFound: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Notify on vulnerability found"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notifications.onComplete}
                      onChange={(e) => updateConfig('notifications', { onComplete: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Notify on task complete"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notifications.onError}
                      onChange={(e) => updateConfig('notifications', { onError: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Notify on errors"
                />
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Resource Allocation
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom>
                    Max Concurrent Tasks: <strong>{config.performance.maxConcurrentTasks}</strong>
                  </Typography>
                  <Slider
                    value={config.performance.maxConcurrentTasks}
                    onChange={(_, value) => updateConfig('performance', { maxConcurrentTasks: value as number })}
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom>
                    Task Timeout: <strong>{config.performance.timeout} seconds</strong>
                  </Typography>
                  <Slider
                    value={config.performance.timeout}
                    onChange={(_, value) => updateConfig('performance', { timeout: value as number })}
                    min={60}
                    max={1800}
                    step={60}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${Math.floor(v / 60)}m`}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom>
                    Retry Attempts: <strong>{config.performance.retryAttempts}</strong>
                  </Typography>
                  <Slider
                    value={config.performance.retryAttempts}
                    onChange={(_, value) => updateConfig('performance', { retryAttempts: value as number })}
                    min={0}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Task Priority</InputLabel>
                  <Select
                    value={config.performance.priority}
                    label="Task Priority"
                    onChange={(e) => updateConfig('performance', { priority: e.target.value as 'low' | 'normal' | 'high' })}
                  >
                    <MenuItem value="low">🐢 Low - Background tasks</MenuItem>
                    <MenuItem value="normal">⚖️ Normal - Standard priority</MenuItem>
                    <MenuItem value="high">🚀 High - Critical tasks</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tools Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.tools.autoSelectTools}
                    onChange={(e) => updateConfig('tools', { autoSelectTools: e.target.checked })}
                  />
                }
                label="Auto-select tools based on target"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 3 }}>
                Let the AI agent choose the best tools for each task
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Preferred Tools
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  These tools will be prioritized when available
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {AVAILABLE_TOOLS.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      size="small"
                      onClick={() => {
                        const current = config.tools.preferredTools;
                        const updated = current.includes(tool)
                          ? current.filter((t) => t !== tool)
                          : [...current, tool];
                        updateConfig('tools', { preferredTools: updated });
                      }}
                      color={config.tools.preferredTools.includes(tool) ? 'primary' : 'default'}
                      variant={config.tools.preferredTools.includes(tool) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Excluded Tools
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  These tools will not be used by this agent
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {AVAILABLE_TOOLS.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      size="small"
                      onClick={() => {
                        const current = config.tools.excludedTools;
                        const updated = current.includes(tool)
                          ? current.filter((t) => t !== tool)
                          : [...current, tool];
                        updateConfig('tools', { excludedTools: updated });
                      }}
                      color={config.tools.excludedTools.includes(tool) ? 'error' : 'default'}
                      variant={config.tools.excludedTools.includes(tool) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Info Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Agent Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Agent ID" secondary={agent.id} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Agent Type" secondary={agent.type} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Current Status" secondary={agent.status} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Last Active" secondary={agent.lastActive} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <AlertTitle>Capabilities</AlertTitle>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {agent.capabilities.map((cap, index) => (
                    <Chip key={index} label={cap} size="small" variant="outlined" />
                  ))}
                </Box>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentConfigurationPanel;
