/**
 * Tool Chain Builder Component
 * Visual workflow builder for creating automated security testing pipelines
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SecurityIcon from '@mui/icons-material/Security';
import RadarIcon from '@mui/icons-material/Radar';
import BugReportIcon from '@mui/icons-material/BugReport';
import StorageIcon from '@mui/icons-material/Storage';
import WebIcon from '@mui/icons-material/Web';
import type { SelectChangeEvent } from '@mui/material';

// Tool categories and available tools
const TOOL_CATEGORIES = {
  reconnaissance: {
    name: 'Reconnaissance',
    icon: <RadarIcon />,
    tools: [
      { id: 'nmap', name: 'Nmap', description: 'Port scanning & service detection' },
      { id: 'amass', name: 'Amass', description: 'Subdomain enumeration' },
      { id: 'subfinder', name: 'Subfinder', description: 'Fast subdomain discovery' },
      { id: 'httpx', name: 'HTTPX', description: 'HTTP probe & tech detection' },
      { id: 'masscan', name: 'Masscan', description: 'Fast port scanner' },
    ],
  },
  webTesting: {
    name: 'Web Testing',
    icon: <WebIcon />,
    tools: [
      { id: 'nuclei', name: 'Nuclei', description: 'Vulnerability scanner' },
      { id: 'nikto', name: 'Nikto', description: 'Web server scanner' },
      { id: 'gobuster', name: 'Gobuster', description: 'Directory brute-forcing' },
      { id: 'ffuf', name: 'FFuf', description: 'Web fuzzer' },
      { id: 'sqlmap', name: 'SQLMap', description: 'SQL injection testing' },
    ],
  },
  exploitation: {
    name: 'Exploitation',
    icon: <BugReportIcon />,
    tools: [
      { id: 'metasploit', name: 'Metasploit', description: 'Exploitation framework' },
      { id: 'hydra', name: 'Hydra', description: 'Password cracking' },
      { id: 'crackmapexec', name: 'CrackMapExec', description: 'Network exploitation' },
    ],
  },
  analysis: {
    name: 'Analysis',
    icon: <StorageIcon />,
    tools: [
      { id: 'eyewitness', name: 'EyeWitness', description: 'Screenshot & reporting' },
      { id: 'gowitness', name: 'GoWitness', description: 'Web screenshot utility' },
    ],
  },
};

export interface WorkflowStep {
  id: string;
  toolId: string;
  toolName: string;
  category: string;
  parameters: Record<string, string>;
  outputVariable?: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
}

interface ToolChainBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
  initialWorkflow?: Workflow;
}

const ToolChainBuilder = ({
  open,
  onClose,
  onSave,
  onRun,
  initialWorkflow,
}: ToolChainBuilderProps) => {
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(
    initialWorkflow?.description || ''
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow?.steps || []);
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [configureStepIndex, setConfigureStepIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddStep = useCallback(() => {
    if (!selectedCategory || !selectedTool) {
      setError('Please select a category and tool');
      return;
    }

    const categoryData = TOOL_CATEGORIES[selectedCategory as keyof typeof TOOL_CATEGORIES];
    const toolData = categoryData.tools.find((t) => t.id === selectedTool);

    if (!toolData) {
      setError('Tool not found');
      return;
    }

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      toolId: selectedTool,
      toolName: toolData.name,
      category: selectedCategory,
      parameters: {},
      outputVariable: `${selectedTool}_output`,
    };

    setSteps((prev) => [...prev, newStep]);
    setAddStepDialogOpen(false);
    setSelectedCategory('');
    setSelectedTool('');
    setError(null);
  }, [selectedCategory, selectedTool]);

  const handleRemoveStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    if (!workflowName.trim()) {
      setError('Please provide a workflow name');
      return;
    }

    if (steps.length === 0) {
      setError('Please add at least one step to the workflow');
      return;
    }

    const workflow: Workflow = {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      steps,
      createdAt: initialWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(workflow);
    setError(null);
  }, [workflowName, workflowDescription, steps, initialWorkflow, onSave]);

  const handleRun = useCallback(() => {
    if (!workflowName.trim() || steps.length === 0) {
      setError('Please save the workflow before running');
      return;
    }

    const workflow: Workflow = {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      steps,
      createdAt: initialWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onRun?.(workflow);
  }, [workflowName, workflowDescription, steps, initialWorkflow, onRun]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
    setSelectedTool('');
  };

  const handleToolChange = (event: SelectChangeEvent<string>) => {
    setSelectedTool(event.target.value);
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = TOOL_CATEGORIES[categoryKey as keyof typeof TOOL_CATEGORIES];
    return category?.icon || <SecurityIcon />;
  };

  type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  const getStepColor = (category: string): ChipColor => {
    switch (category) {
      case 'reconnaissance':
        return 'info';
      case 'webTesting':
        return 'primary';
      case 'exploitation':
        return 'error';
      case 'analysis':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon color="primary" />
          Tool Chain Builder
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Workflow Info */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g., Full Web Application Assessment"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Workflow Steps */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Workflow Steps ({steps.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddStepDialogOpen(true)}
          >
            Add Step
          </Button>
        </Box>

        {steps.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.default',
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <AccountTreeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No steps added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start building your workflow by adding security tools
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddStepDialogOpen(true)}
            >
              Add First Step
            </Button>
          </Paper>
        ) : (
          <Stepper orientation="vertical" activeStep={-1} sx={{ mb: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.id} completed={false} active>
                <StepLabel
                  icon={getCategoryIcon(step.category)}
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {TOOL_CATEGORIES[step.category as keyof typeof TOOL_CATEGORIES]?.name}
                    </Typography>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {step.toolName}
                    </Typography>
                    <Chip
                      label={`Step ${index + 1}`}
                      size="small"
                      color={getStepColor(step.category)}
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Card sx={{ mb: 2, bgcolor: 'background.default' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Tool ID: {step.toolId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Output: ${'{'}
                            {step.outputVariable}
                            {'}'}
                          </Typography>
                          {Object.keys(step.parameters).length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                Parameters:
                              </Typography>
                              {Object.entries(step.parameters).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mt: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Tooltip title="Configure">
                            <IconButton
                              size="small"
                              onClick={() => setConfigureStepIndex(index)}
                            >
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStep(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {index < steps.length - 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                      <ArrowDownwardIcon color="primary" />
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Workflow Preview */}
        {steps.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Workflow Summary
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              {steps.map((step, index) => (
                <Box key={step.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    icon={getCategoryIcon(step.category)}
                    label={step.toolName}
                    color={getStepColor(step.category)}
                    variant="outlined"
                  />
                  {index < steps.length - 1 && (
                    <ArrowDownwardIcon
                      sx={{
                        mx: 0.5,
                        color: 'text.secondary',
                        transform: 'rotate(-90deg)',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!workflowName || steps.length === 0}
        >
          Save Workflow
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleRun}
          disabled={!workflowName || steps.length === 0}
        >
          Run Workflow
        </Button>
      </DialogActions>

      {/* Add Step Dialog */}
      <Dialog
        open={addStepDialogOpen}
        onClose={() => setAddStepDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Workflow Step</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Tool Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Tool Category"
            >
              {Object.entries(TOOL_CATEGORIES).map(([key, category]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon}
                    {category.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCategory && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tool</InputLabel>
              <Select
                value={selectedTool}
                onChange={handleToolChange}
                label="Tool"
              >
                {TOOL_CATEGORIES[selectedCategory as keyof typeof TOOL_CATEGORIES]?.tools.map(
                  (tool) => (
                    <MenuItem key={tool.id} value={tool.id}>
                      <Box>
                        <Typography variant="body1">{tool.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tool.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}

          {selectedTool && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You can configure parameters for this tool after adding it to the workflow.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStepDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddStep}
            disabled={!selectedCategory || !selectedTool}
          >
            Add Step
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configure Step Dialog */}
      <Dialog
        open={configureStepIndex !== null}
        onClose={() => setConfigureStepIndex(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Step</DialogTitle>
        <DialogContent>
          {configureStepIndex !== null && steps[configureStepIndex] && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {steps[configureStepIndex].toolName}
              </Typography>

              <TextField
                fullWidth
                label="Output Variable Name"
                value={steps[configureStepIndex].outputVariable || ''}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[configureStepIndex] = {
                    ...newSteps[configureStepIndex],
                    outputVariable: e.target.value,
                  };
                  setSteps(newSteps);
                }}
                sx={{ mb: 2 }}
                helperText="Use this variable to reference output in subsequent steps"
              />

              <TextField
                fullWidth
                label="Condition (Optional)"
                value={steps[configureStepIndex].condition || ''}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[configureStepIndex] = {
                    ...newSteps[configureStepIndex],
                    condition: e.target.value,
                  };
                  setSteps(newSteps);
                }}
                sx={{ mb: 2 }}
                helperText="e.g., ${previous_output} contains 'port 80'"
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tool Parameters
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Parameters (JSON)"
                value={JSON.stringify(steps[configureStepIndex].parameters, null, 2)}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    const newSteps = [...steps];
                    newSteps[configureStepIndex] = {
                      ...newSteps[configureStepIndex],
                      parameters: params,
                    };
                    setSteps(newSteps);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                helperText='Enter parameters as JSON, e.g., {"target": "example.com", "ports": "1-1000"}'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigureStepIndex(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ToolChainBuilder;
