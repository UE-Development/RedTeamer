/**
 * Scan Creation Wizard
 * Multi-step wizard for creating and configuring security scans
 * Based on FEATURES.md Sprint 7: Scan Management
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Alert,
  LinearProgress,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ScanCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (scanConfig: ScanConfig) => void;
}

interface ScanConfig {
  target: string;
  targetType: 'domain' | 'ip' | 'url' | 'cidr';
  scanType: 'quick' | 'standard' | 'deep' | 'custom';
  selectedTools: string[];
  schedule: 'immediate' | 'scheduled' | 'recurring';
  scheduledDate?: string;
  outputFormats: string[];
  notifications: boolean;
  advancedOptions: {
    threads: number;
    timeout: number;
    aggressive: boolean;
    stealthMode: boolean;
  };
}

const steps = ['Target Configuration', 'Scan Type', 'Tool Selection', 'Schedule & Output'];

// Available tools grouped by category
const toolCategories = {
  'Network Reconnaissance': ['Nmap', 'Rustscan', 'Masscan', 'Amass', 'Subfinder'],
  'Web Application': ['Nuclei', 'Gobuster', 'FFuf', 'Nikto', 'SQLMap', 'Dirsearch'],
  'Vulnerability Scanning': ['Nessus', 'OpenVAS', 'Trivy', 'Checkov'],
  'OSINT': ['TheHarvester', 'Sherlock', 'Recon-ng'],
  'Authentication': ['Hydra', 'Medusa', 'Hashcat'],
};

const scanTypeDescriptions = {
  quick: 'Fast scan focusing on common vulnerabilities. ~5-10 minutes.',
  standard: 'Balanced scan with comprehensive coverage. ~20-30 minutes.',
  deep: 'Thorough analysis including advanced techniques. ~60+ minutes.',
  custom: 'Select specific tools and configure parameters manually.',
};

const ScanCreationWizard = ({ open, onClose, onSubmit }: ScanCreationWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<ScanConfig>({
    target: '',
    targetType: 'domain',
    scanType: 'standard',
    selectedTools: ['Nmap', 'Nuclei', 'Gobuster'],
    schedule: 'immediate',
    outputFormats: ['json', 'html'],
    notifications: true,
    advancedOptions: {
      threads: 10,
      timeout: 300,
      aggressive: false,
      stealthMode: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!config.target.trim()) {
        newErrors.target = 'Target is required';
      } else {
        // Basic validation based on target type
        const target = config.target.trim();
        if (config.targetType === 'domain') {
          if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/.test(target)) {
            newErrors.target = 'Invalid domain format';
          }
        } else if (config.targetType === 'ip') {
          if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) {
            newErrors.target = 'Invalid IP address format';
          }
        } else if (config.targetType === 'url') {
          try {
            new URL(target);
          } catch {
            newErrors.target = 'Invalid URL format';
          }
        }
      }
    }

    if (step === 2 && config.scanType === 'custom') {
      if (config.selectedTools.length === 0) {
        newErrors.tools = 'Select at least one tool for custom scan';
      }
    }

    if (step === 3 && config.schedule === 'scheduled') {
      if (!config.scheduledDate) {
        newErrors.schedule = 'Select a date and time for scheduled scan';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSubmit(config);
    setIsSubmitting(false);
    onClose();
    // Reset wizard
    setActiveStep(0);
    setConfig({
      target: '',
      targetType: 'domain',
      scanType: 'standard',
      selectedTools: ['Nmap', 'Nuclei', 'Gobuster'],
      schedule: 'immediate',
      outputFormats: ['json', 'html'],
      notifications: true,
      advancedOptions: {
        threads: 10,
        timeout: 300,
        aggressive: false,
        stealthMode: false,
      },
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Define Your Target
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1 }}>Target Type</FormLabel>
              <RadioGroup
                row
                value={config.targetType}
                onChange={(e) => setConfig({ ...config, targetType: e.target.value as ScanConfig['targetType'] })}
              >
                <FormControlLabel value="domain" control={<Radio />} label="Domain" />
                <FormControlLabel value="ip" control={<Radio />} label="IP Address" />
                <FormControlLabel value="url" control={<Radio />} label="Full URL" />
                <FormControlLabel value="cidr" control={<Radio />} label="CIDR Range" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Target"
              placeholder={
                config.targetType === 'domain'
                  ? 'example.com'
                  : config.targetType === 'ip'
                    ? '192.168.1.1'
                    : config.targetType === 'url'
                      ? 'https://example.com/app'
                      : '192.168.1.0/24'
              }
              value={config.target}
              onChange={(e) => setConfig({ ...config, target: e.target.value })}
              error={!!errors.target}
              helperText={errors.target}
              sx={{ mb: 2 }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              Ensure you have proper authorization to scan the target. Unauthorized scanning may be illegal.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Select Scan Type
            </Typography>

            <RadioGroup
              value={config.scanType}
              onChange={(e) => setConfig({ ...config, scanType: e.target.value as ScanConfig['scanType'] })}
            >
              {(['quick', 'standard', 'deep', 'custom'] as const).map((type) => (
                <Paper
                  key={type}
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: config.scanType === type ? 'primary.main' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.light',
                    },
                  }}
                  onClick={() => setConfig({ ...config, scanType: type })}
                >
                  <FormControlLabel
                    value={type}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {type === 'quick' && '⚡'} {type === 'standard' && '🔍'} {type === 'deep' && '🔬'}{' '}
                          {type === 'custom' && '⚙️'} {type} Scan
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {scanTypeDescriptions[type]}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              ))}
            </RadioGroup>

            {config.scanType !== 'custom' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Advanced Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={config.advancedOptions.aggressive}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              advancedOptions: { ...config.advancedOptions, aggressive: e.target.checked },
                            })
                          }
                        />
                      }
                      label="Aggressive Mode"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={config.advancedOptions.stealthMode}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              advancedOptions: { ...config.advancedOptions, stealthMode: e.target.checked },
                            })
                          }
                        />
                      }
                      label="Stealth Mode"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🛠️ Tool Selection
            </Typography>

            {config.scanType !== 'custom' ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Tools are automatically selected based on your scan type. Switch to "Custom" scan type to manually
                select tools.
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the security tools you want to include in your scan.
              </Typography>
            )}

            {Object.entries(toolCategories).map(([category, tools]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tools.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      clickable={config.scanType === 'custom'}
                      color={config.selectedTools.includes(tool) ? 'primary' : 'default'}
                      variant={config.selectedTools.includes(tool) ? 'filled' : 'outlined'}
                      onClick={() => {
                        if (config.scanType !== 'custom') return;
                        const newTools = config.selectedTools.includes(tool)
                          ? config.selectedTools.filter((t) => t !== tool)
                          : [...config.selectedTools, tool];
                        setConfig({ ...config, selectedTools: newTools });
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}

            {errors.tools && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.tools}
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Schedule & Output
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1 }}>When to Run</FormLabel>
              <RadioGroup
                value={config.schedule}
                onChange={(e) => setConfig({ ...config, schedule: e.target.value as ScanConfig['schedule'] })}
              >
                <FormControlLabel value="immediate" control={<Radio />} label="Run Immediately" />
                <FormControlLabel value="scheduled" control={<Radio />} label="Schedule for Later" />
                <FormControlLabel value="recurring" control={<Radio />} label="Set Recurring Schedule" />
              </RadioGroup>
            </FormControl>

            {config.schedule === 'scheduled' && (
              <TextField
                fullWidth
                type="datetime-local"
                label="Scheduled Date & Time"
                value={config.scheduledDate || ''}
                onChange={(e) => setConfig({ ...config, scheduledDate: e.target.value })}
                error={!!errors.schedule}
                helperText={errors.schedule}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mb: 3 }}
              />
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Output Formats</InputLabel>
              <Select
                multiple
                value={config.outputFormats}
                onChange={(e) => setConfig({ ...config, outputFormats: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.toUpperCase()} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="html">HTML Report</MenuItem>
                <MenuItem value="pdf">PDF Report</MenuItem>
                <MenuItem value="markdown">Markdown</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={config.notifications}
                  onChange={(e) => setConfig({ ...config, notifications: e.target.checked })}
                />
              }
              label="Notify me when scan completes"
            />

            {/* Scan Summary */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                📋 Scan Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Target:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {config.target || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Scan Type:
                  </Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {config.scanType}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Tools:
                  </Typography>
                  <Typography variant="body2">{config.selectedTools.length} selected</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Schedule:
                  </Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {config.schedule}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Security Scan
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: index <= activeStep ? 'primary.main' : 'action.disabledBackground',
                      color: index <= activeStep ? 'white' : 'text.disabled',
                    }}
                  >
                    {index < activeStep ? <CheckCircleIcon fontSize="small" /> : index + 1}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {isSubmitting ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Creating scan...</Typography>
          </Box>
        ) : (
          renderStepContent()
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} startIcon={<RocketLaunchIcon />}>
            Launch Scan
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ScanCreationWizard;
