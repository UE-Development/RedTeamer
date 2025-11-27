/**
 * Tool Detail Dialog Component
 * Sprint 5: Create tool detail pages, Add tool configuration panels
 * Shows detailed tool information with configuration options
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
  Chip,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  AlertTitle,
  LinearProgress,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TerminalIcon from '@mui/icons-material/Terminal';
import type { Tool } from '../../types';

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

interface ToolDetailDialogProps {
  open: boolean;
  onClose: () => void;
  tool: Tool | null;
  onExecute?: (tool: Tool, parameters: Record<string, unknown>) => void;
}

// Extended tool info for demo
interface ExtendedToolInfo {
  documentation: string;
  examples: string[];
  capabilities: string[];
  requirements: string[];
  lastUpdated: string;
  author: string;
  license: string;
}

const TOOL_EXTENDED_INFO: Record<string, ExtendedToolInfo> = {
  nmap: {
    documentation: 'Nmap is a free and open-source network scanner used to discover hosts and services on a computer network.',
    examples: [
      'nmap -sV -sC target.com',
      'nmap -sS -T4 -p- target.com',
      'nmap --script vuln target.com',
    ],
    capabilities: [
      'Port scanning (TCP/UDP)',
      'Service version detection',
      'OS fingerprinting',
      'NSE script execution',
      'Network mapping',
    ],
    requirements: ['Root privileges for SYN scan', 'Network access to target'],
    lastUpdated: '2024-01-15',
    author: 'Gordon Lyon (Fyodor)',
    license: 'GPLv2',
  },
};

// Default extended info for tools not in the map
const DEFAULT_EXTENDED_INFO: ExtendedToolInfo = {
  documentation: 'Professional security testing tool integrated into HexStrike AI platform.',
  examples: ['See tool documentation for usage examples'],
  capabilities: ['Security scanning', 'Vulnerability detection', 'Automated analysis'],
  requirements: ['Network access to target', 'Appropriate permissions'],
  lastUpdated: '2024-01-01',
  author: 'HexStrike AI Team',
  license: 'Various',
};

const ToolDetailDialog = ({ open, onClose, tool, onExecute }: ToolDetailDialogProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [parameters, setParameters] = useState<Record<string, unknown>>({
    target: '',
    aggressive: false,
    timeout: 30,
    threads: 10,
  });

  if (!tool) return null;

  const extendedInfo = TOOL_EXTENDED_INFO[tool.name.toLowerCase()] || DEFAULT_EXTENDED_INFO;

  const handleParameterChange = (name: string, value: unknown) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (onExecute) {
      setIsExecuting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate execution start
        onExecute(tool, parameters);
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const getCategoryIcon = (category: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      network: <SecurityIcon />,
      web: <CodeIcon />,
      binary: <TerminalIcon />,
      cloud: <SpeedIcon />,
    };
    return icons[category] || <SettingsIcon />;
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
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getCategoryIcon(tool.category)}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {tool.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              v{tool.version}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={tool.category}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
          <Chip
            label={tool.installed ? 'Installed' : 'Not Installed'}
            size="small"
            color={tool.installed ? 'success' : 'warning'}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Tool Stats Row */}
        <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={5} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              ({tool.usageCount} uses)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Author:</strong> {extendedInfo.author}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>License:</strong> {extendedInfo.license}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Updated:</strong> {extendedInfo.lastUpdated}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {tool.description}
        </Typography>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Configuration" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Documentation" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Examples" icon={<CodeIcon />} iconPosition="start" />
          <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Target"
                placeholder="example.com or 192.168.1.1"
                value={parameters.target}
                onChange={(e) => handleParameterChange('target', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={parameters.timeout}
                onChange={(e) => handleParameterChange('timeout', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Threads"
                type="number"
                value={parameters.threads}
                onChange={(e) => handleParameterChange('threads', parseInt(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Advanced Options
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={parameters.aggressive as boolean}
                      onChange={(e) => handleParameterChange('aggressive', e.target.checked)}
                    />
                  }
                  label="Aggressive Mode"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Faster but more detectable
                </Typography>
              </Paper>

              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>Tool Requirements</AlertTitle>
                <List dense sx={{ py: 0 }}>
                  {extendedInfo.requirements.map((req, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documentation Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" paragraph>
            {extendedInfo.documentation}
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Capabilities
          </Typography>
          <Grid container spacing={1}>
            {extendedInfo.capabilities.map((cap, index) => (
              <Grid key={index}>
                <Chip
                  label={cap}
                  size="small"
                  variant="outlined"
                  icon={<CheckCircleIcon />}
                  sx={{ m: 0.5 }}
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Examples Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Usage Examples
          </Typography>
          {extendedInfo.examples.map((example, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'background.paper',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.875rem',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TerminalIcon fontSize="small" color="primary" />
                <Typography
                  component="code"
                  sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {example}
                </Typography>
              </Box>
            </Paper>
          ))}
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={tabValue} index={3}>
          <Alert severity="info">
            Execution history will be displayed here. The tool has been used {tool.usageCount} times.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Recent executions will show:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="Execution timestamp" secondary="When the tool was run" />
              </ListItem>
              <ListItem>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Parameters used" secondary="Configuration for each run" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                <ListItemText primary="Results summary" secondary="Output and findings" />
              </ListItem>
            </List>
          </Box>
        </TabPanel>

        {isExecuting && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Starting {tool.name}...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={() => {
            // TODO: Implement configuration persistence
            onClose();
          }}
        >
          Save Config
        </Button>
        <Button
          variant="contained"
          startIcon={isExecuting ? undefined : <PlayArrowIcon />}
          onClick={handleExecute}
          disabled={!tool.installed || isExecuting || !parameters.target}
        >
          {isExecuting ? 'Starting...' : 'Execute Tool'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToolDetailDialog;
