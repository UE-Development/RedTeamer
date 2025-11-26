/**
 * Smart Command Builder Component
 * Visual interface for constructing complex security testing commands
 */

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Grid,
  Autocomplete,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';

interface SmartCommandBuilderProps {
  onExecuteCommand: (command: string, params: CommandParams) => void;
  selectedAgent?: { id: string; name: string };
}

interface CommandParams {
  target: string;
  scanType: string;
  tools: string[];
  outputFormat: string[];
  schedule: string;
}

const SCAN_TYPES = [
  { value: 'quick', label: '⚡ Quick Scan', description: 'Fast reconnaissance (5-10 min)' },
  { value: 'standard', label: '🎯 Standard Scan', description: 'Comprehensive testing (20-30 min)' },
  { value: 'deep', label: '🔬 Deep Scan', description: 'Thorough analysis (1-2 hours)' },
  { value: 'custom', label: '⚙️ Custom Scan', description: 'Configure all parameters' },
];

const TOOL_CATEGORIES = {
  network: ['Nmap', 'Rustscan', 'Masscan', 'Amass', 'Subfinder'],
  web: ['Nuclei', 'Nikto', 'Gobuster', 'SQLMap', 'FFuf', 'Feroxbuster'],
  vulnerability: ['OpenVAS', 'Nessus', 'Trivy', 'Checkov'],
  exploitation: ['Metasploit', 'ExploitDB', 'SearchSploit'],
  osint: ['TheHarvester', 'Sherlock', 'Recon-ng', 'SpiderFoot'],
};

const ALL_TOOLS = Object.values(TOOL_CATEGORIES).flat();

const OUTPUT_FORMATS = ['JSON', 'HTML', 'PDF', 'Markdown', 'XML'];

const SmartCommandBuilder = ({ onExecuteCommand, selectedAgent }: SmartCommandBuilderProps) => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('standard');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [outputFormats, setOutputFormats] = useState<string[]>(['JSON', 'HTML']);
  const [schedule, setSchedule] = useState('immediate');
  const [showPreview, setShowPreview] = useState(false);

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFormatToggle = (format: string) => {
    setOutputFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const generateCommand = (): string => {
    let command = `Perform a ${scanType} security scan on ${target}`;
    
    if (selectedTools.length > 0) {
      command += ` using tools: ${selectedTools.join(', ')}`;
    }
    
    if (outputFormats.length > 0) {
      command += `. Generate reports in ${outputFormats.join(', ')} format`;
    }

    if (schedule !== 'immediate') {
      command += `. Schedule: ${schedule}`;
    }

    return command;
  };

  const handleExecute = () => {
    const command = generateCommand();
    const params: CommandParams = {
      target,
      scanType,
      tools: selectedTools,
      outputFormat: outputFormats,
      schedule,
    };
    onExecuteCommand(command, params);
  };

  const isValid = target.trim().length > 0;

  return (
    <Card sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Smart Command Builder
          </Typography>
        </Box>

        {!selectedAgent && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Select an AI agent to build a command
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Target Input */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Target (Domain, IP, or URL)"
              placeholder="example.com or 192.168.1.1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={!selectedAgent}
              helperText="Enter the target for security assessment"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'JetBrains Mono', monospace",
                },
              }}
            />
          </Grid>

          {/* Scan Type Selector */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth disabled={!selectedAgent}>
              <InputLabel>Scan Type</InputLabel>
              <Select
                value={scanType}
                label="Scan Type"
                onChange={(e) => setScanType(e.target.value)}
              >
                {SCAN_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography>{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tool Selection */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Security Tools (optional)
            </Typography>
            <Autocomplete
              multiple
              options={ALL_TOOLS}
              value={selectedTools}
              onChange={(_, newValue) => setSelectedTools(newValue)}
              disabled={!selectedAgent}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select tools or leave empty for auto-selection"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />
            
            {scanType === 'custom' && (
              <Box sx={{ mt: 2 }}>
                {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {category} Tools
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {tools.map((tool) => (
                        <Chip
                          key={tool}
                          label={tool}
                          size="small"
                          onClick={() => handleToolToggle(tool)}
                          color={selectedTools.includes(tool) ? 'primary' : 'default'}
                          variant={selectedTools.includes(tool) ? 'filled' : 'outlined'}
                          disabled={!selectedAgent}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Output Format */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Output Format
            </Typography>
            <FormGroup row>
              {OUTPUT_FORMATS.map((format) => (
                <FormControlLabel
                  key={format}
                  control={
                    <Checkbox
                      checked={outputFormats.includes(format)}
                      onChange={() => handleFormatToggle(format)}
                      disabled={!selectedAgent}
                    />
                  }
                  label={format}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Schedule Options */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth disabled={!selectedAgent}>
              <InputLabel>Schedule</InputLabel>
              <Select
                value={schedule}
                label="Schedule"
                onChange={(e) => setSchedule(e.target.value)}
              >
                <MenuItem value="immediate">▶️ Run Immediately</MenuItem>
                <MenuItem value="1hour">⏰ In 1 Hour</MenuItem>
                <MenuItem value="tonight">🌙 Tonight (00:00)</MenuItem>
                <MenuItem value="tomorrow">📅 Tomorrow Morning</MenuItem>
                <MenuItem value="recurring">🔄 Recurring (Daily)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Command Preview */}
          {showPreview && target && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<CodeIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Generated Command:
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.875rem',
                  }}
                >
                  {generateCommand()}
                </Box>
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={handleExecute}
                disabled={!isValid || !selectedAgent}
              >
                Execute Command
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!selectedAgent}
              >
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SmartCommandBuilder;
