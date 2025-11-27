/**
 * Tool Parameter Forms Component
 * Sprint 5: Build parameter input forms with validation
 * Provides validated parameter input forms for security tools
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Slider,
  Alert,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Grid,
  Collapse,
  FormHelperText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export interface ToolParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'slider' | 'ip' | 'domain' | 'url' | 'port' | 'cidr';
  description?: string;
  defaultValue?: string | number | boolean | string[];
  required?: boolean;
  advanced?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
    options?: { value: string; label: string }[];
    marks?: { value: number; label: string }[];
  };
}

export interface ToolParameterFormProps {
  toolName: string;
  parameters: ToolParameter[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  showAdvanced?: boolean;
}

// Validation patterns
const VALIDATION_PATTERNS = {
  ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  domain: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/,
};

// Preset parameter configurations for common tools
export const TOOL_PARAMETER_PRESETS: Record<string, ToolParameter[]> = {
  nmap: [
    { name: 'target', label: 'Target', type: 'text', required: true, description: 'Target IP, domain, or CIDR range' },
    { name: 'ports', label: 'Ports', type: 'text', defaultValue: '1-1000', description: 'Port range (e.g., 1-1000, 80,443)' },
    { name: 'scanType', label: 'Scan Type', type: 'select', defaultValue: '-sS', validation: { options: [
      { value: '-sS', label: 'SYN Scan (Fast, Stealthy)' },
      { value: '-sT', label: 'TCP Connect Scan' },
      { value: '-sU', label: 'UDP Scan' },
      { value: '-sV', label: 'Version Detection' },
      { value: '-sC', label: 'Script Scan' },
    ]}},
    { name: 'timing', label: 'Timing Template', type: 'slider', defaultValue: 4, validation: { min: 0, max: 5, marks: [
      { value: 0, label: 'T0 (Paranoid)' },
      { value: 1, label: 'T1 (Sneaky)' },
      { value: 2, label: 'T2 (Polite)' },
      { value: 3, label: 'T3 (Normal)' },
      { value: 4, label: 'T4 (Aggressive)' },
      { value: 5, label: 'T5 (Insane)' },
    ]}},
    { name: 'osDetection', label: 'OS Detection', type: 'boolean', defaultValue: false, description: 'Enable OS detection (-O)', advanced: true },
    { name: 'scripts', label: 'NSE Scripts', type: 'text', description: 'NSE script categories (e.g., vuln, exploit)', advanced: true },
    { name: 'output', label: 'Output Format', type: 'select', defaultValue: 'normal', advanced: true, validation: { options: [
      { value: 'normal', label: 'Normal Output' },
      { value: 'xml', label: 'XML' },
      { value: 'json', label: 'JSON' },
      { value: 'grepable', label: 'Grepable' },
    ]}},
  ],
  nuclei: [
    { name: 'target', label: 'Target URL', type: 'url', required: true, description: 'Target URL to scan' },
    { name: 'severity', label: 'Severity Filter', type: 'multiselect', defaultValue: ['critical', 'high'], validation: { options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'info', label: 'Info' },
    ]}},
    { name: 'templates', label: 'Template Tags', type: 'text', description: 'Template tags to use (e.g., cve, xss, sqli)' },
    { name: 'threads', label: 'Threads', type: 'number', defaultValue: 25, validation: { min: 1, max: 100 } },
    { name: 'rateLimit', label: 'Rate Limit (req/s)', type: 'number', defaultValue: 150, validation: { min: 1, max: 1000 }, advanced: true },
    { name: 'headless', label: 'Headless Mode', type: 'boolean', defaultValue: false, description: 'Enable headless browser for JavaScript', advanced: true },
    { name: 'newTemplates', label: 'New Templates Only', type: 'boolean', defaultValue: false, advanced: true },
  ],
  sqlmap: [
    { name: 'target', label: 'Target URL', type: 'url', required: true, description: 'URL with parameter to test (use * for injection point)' },
    { name: 'dbms', label: 'Database Type', type: 'select', validation: { options: [
      { value: '', label: 'Auto-detect' },
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'mssql', label: 'Microsoft SQL Server' },
      { value: 'oracle', label: 'Oracle' },
      { value: 'sqlite', label: 'SQLite' },
    ]}},
    { name: 'level', label: 'Test Level', type: 'slider', defaultValue: 1, validation: { min: 1, max: 5, marks: [
      { value: 1, label: '1 (Basic)' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5 (Advanced)' },
    ]}},
    { name: 'risk', label: 'Risk Level', type: 'slider', defaultValue: 1, validation: { min: 1, max: 3, marks: [
      { value: 1, label: '1 (Safe)' },
      { value: 2, label: '2' },
      { value: 3, label: '3 (Risky)' },
    ]}},
    { name: 'batch', label: 'Batch Mode', type: 'boolean', defaultValue: true, description: 'Never ask for user input' },
    { name: 'technique', label: 'Techniques', type: 'text', defaultValue: 'BEUSTQ', description: 'SQL injection techniques', advanced: true },
    { name: 'tamper', label: 'Tamper Scripts', type: 'text', description: 'Tamper scripts to use (e.g., space2comment)', advanced: true },
  ],
  gobuster: [
    { name: 'target', label: 'Target URL', type: 'url', required: true },
    { name: 'mode', label: 'Mode', type: 'select', defaultValue: 'dir', required: true, validation: { options: [
      { value: 'dir', label: 'Directory Brute-forcing' },
      { value: 'dns', label: 'DNS Subdomain Brute-forcing' },
      { value: 'vhost', label: 'Virtual Host Brute-forcing' },
      { value: 's3', label: 'AWS S3 Bucket Enumeration' },
      { value: 'fuzz', label: 'Fuzzing Mode' },
    ]}},
    { name: 'wordlist', label: 'Wordlist', type: 'select', defaultValue: 'common', validation: { options: [
      { value: 'common', label: 'Common (4,600 entries)' },
      { value: 'medium', label: 'Medium (220,000 entries)' },
      { value: 'large', label: 'Large (1.2M entries)' },
      { value: 'custom', label: 'Custom Path' },
    ]}},
    { name: 'extensions', label: 'Extensions', type: 'text', defaultValue: 'php,html,txt', description: 'File extensions to search for' },
    { name: 'threads', label: 'Threads', type: 'number', defaultValue: 10, validation: { min: 1, max: 100 } },
    { name: 'followRedirect', label: 'Follow Redirects', type: 'boolean', defaultValue: false, advanced: true },
    { name: 'noError', label: 'Hide Errors', type: 'boolean', defaultValue: true, advanced: true },
    { name: 'statusCodes', label: 'Status Codes', type: 'text', defaultValue: '200,204,301,302,307,401,403', advanced: true },
  ],
};

const ToolParameterForm = ({
  toolName,
  parameters,
  values,
  onChange,
  onValidationChange,
  showAdvanced: initialShowAdvanced = false,
}: ToolParameterFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(initialShowAdvanced);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Separate basic and advanced parameters
  const { basicParams, advancedParams } = useMemo(() => {
    const basic = parameters.filter((p) => !p.advanced);
    const advanced = parameters.filter((p) => p.advanced);
    return { basicParams: basic, advancedParams: advanced };
  }, [parameters]);

  // Validate a single field
  const validateField = useCallback((param: ToolParameter, value: unknown): string | null => {
    // Required check
    if (param.required && (value === undefined || value === null || value === '')) {
      return `${param.label} is required`;
    }

    // Skip validation for empty optional fields
    if (!value && value !== 0 && value !== false) {
      return null;
    }

    // Type-specific validation
    switch (param.type) {
      case 'ip':
        if (typeof value === 'string' && !VALIDATION_PATTERNS.ip.test(value)) {
          return 'Invalid IP address format';
        }
        break;
      case 'domain':
        if (typeof value === 'string' && !VALIDATION_PATTERNS.domain.test(value)) {
          return 'Invalid domain format';
        }
        break;
      case 'url':
        if (typeof value === 'string' && !VALIDATION_PATTERNS.url.test(value)) {
          return 'Invalid URL format';
        }
        break;
      case 'port':
        if (typeof value === 'string' && !VALIDATION_PATTERNS.port.test(value)) {
          return 'Invalid port number (1-65535)';
        }
        break;
      case 'cidr':
        if (typeof value === 'string' && !VALIDATION_PATTERNS.cidr.test(value)) {
          return 'Invalid CIDR notation (e.g., 192.168.1.0/24)';
        }
        break;
      case 'number':
        if (param.validation?.min !== undefined && (value as number) < param.validation.min) {
          return `Minimum value is ${param.validation.min}`;
        }
        if (param.validation?.max !== undefined && (value as number) > param.validation.max) {
          return `Maximum value is ${param.validation.max}`;
        }
        break;
      case 'text':
        if (param.validation?.pattern && typeof value === 'string') {
          const regex = new RegExp(param.validation.pattern);
          if (!regex.test(value)) {
            return param.validation.patternMessage || 'Invalid format';
          }
        }
        break;
    }

    return null;
  }, []);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    parameters.forEach((param) => {
      const error = validateField(param, values[param.name]);
      if (error) {
        newErrors[param.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    onValidationChange?.(isValid, newErrors);
    return isValid;
  }, [parameters, values, validateField, onValidationChange]);

  // Handle field change
  const handleChange = useCallback((name: string, value: unknown) => {
    onChange(name, value);
    setTouched((prev) => new Set(prev).add(name));

    // Validate the field
    const param = parameters.find((p) => p.name === name);
    if (param) {
      const error = validateField(param, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }
        return next;
      });
    }
  }, [onChange, parameters, validateField]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => new Set(prev).add(name));
    const param = parameters.find((p) => p.name === name);
    if (param) {
      const error = validateField(param, values[name]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }
        return next;
      });
    }
  }, [parameters, values, validateField]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    parameters.forEach((param) => {
      if (param.defaultValue !== undefined) {
        onChange(param.name, param.defaultValue);
      } else {
        onChange(param.name, '');
      }
    });
    setErrors({});
    setTouched(new Set());
  }, [parameters, onChange]);

  // Render a single parameter input
  const renderParameterInput = (param: ToolParameter) => {
    const value = values[param.name];
    const error = touched.has(param.name) ? errors[param.name] : undefined;
    const hasError = !!error;

    switch (param.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleChange(param.name, e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {param.label}
                {param.description && (
                  <Tooltip title={param.description}>
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                )}
              </Box>
            }
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={hasError}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || ''}
              label={param.label}
              onChange={(e) => handleChange(param.name, e.target.value)}
              onBlur={() => handleBlur(param.name)}
            >
              {param.validation?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
            {param.description && !error && (
              <FormHelperText>{param.description}</FormHelperText>
            )}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth error={hasError}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              multiple
              value={(value as string[]) || []}
              label={param.label}
              onChange={(e) => handleChange(param.name, e.target.value)}
              onBlur={() => handleBlur(param.name)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((val) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              )}
            >
              {param.validation?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={((value as string[]) || []).includes(option.value)} />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'slider':
        return (
          <Box>
            <Typography gutterBottom>
              {param.label}
              {param.description && (
                <Tooltip title={param.description}>
                  <InfoIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                </Tooltip>
              )}
            </Typography>
            <Slider
              value={(value as number) ?? param.defaultValue ?? param.validation?.min ?? 0}
              min={param.validation?.min ?? 0}
              max={param.validation?.max ?? 100}
              marks={param.validation?.marks}
              valueLabelDisplay="auto"
              onChange={(_, newValue) => handleChange(param.name, newValue)}
            />
          </Box>
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={param.label}
            value={value ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value ? parseInt(e.target.value) : '')}
            onBlur={() => handleBlur(param.name)}
            error={hasError}
            helperText={error || param.description}
            required={param.required}
            slotProps={{
              input: {
                inputProps: {
                  min: param.validation?.min,
                  max: param.validation?.max,
                }
              }
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={param.label}
            value={value ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
            onBlur={() => handleBlur(param.name)}
            error={hasError}
            helperText={error || param.description}
            required={param.required}
            placeholder={
              param.type === 'ip' ? '192.168.1.1' :
              param.type === 'domain' ? 'example.com' :
              param.type === 'url' ? 'https://example.com' :
              param.type === 'port' ? '80' :
              param.type === 'cidr' ? '192.168.1.0/24' :
              undefined
            }
            slotProps={{
              input: {
                endAdornment: value && !error && touched.has(param.name) ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : hasError ? (
                  <ErrorIcon color="error" fontSize="small" />
                ) : null,
              }
            }}
          />
        );
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {toolName} Configuration
        </Typography>
        <Box>
          <Tooltip title="Reset to defaults">
            <IconButton size="small" onClick={handleReset}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>
          <Button size="small" onClick={validateAll}>
            Validate
          </Button>
        </Box>
      </Box>

      {/* Basic Parameters */}
      <Grid container spacing={2}>
        {basicParams.map((param) => (
          <Grid size={{ xs: 12, md: param.type === 'slider' ? 12 : 6 }} key={param.name}>
            {renderParameterInput(param)}
          </Grid>
        ))}
      </Grid>

      {/* Advanced Parameters */}
      {advancedParams.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options ({advancedParams.length})
          </Button>
          <Collapse in={showAdvanced}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={2}>
                {advancedParams.map((param) => (
                  <Grid size={{ xs: 12, md: param.type === 'slider' ? 12 : 6 }} key={param.name}>
                    {renderParameterInput(param)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the following errors:
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Paper>
  );
};

export default ToolParameterForm;
