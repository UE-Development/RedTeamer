/**
 * Settings Page - Application Configuration
 * Includes MCP Server settings with external access configuration
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Autocomplete,
  ListSubheader,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DnsIcon from '@mui/icons-material/Dns';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import PaletteIcon from '@mui/icons-material/Palette';
import ApiIcon from '@mui/icons-material/Api';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAppSelector, useAppDispatch } from '../store';
import {
  setMCPServerSettings,
  setExternalAccessEnabled,
  setThemeSettings,
  setAPISettings,
  setAIProviderSettings,
  setNotificationSettings,
  setDeveloperSettings,
  saveSettings,
  resetSettings,
} from '../store/slices/settingsSlice';
import { apiClient } from '../services/api';

// OpenRouter model definitions with categories and pricing (per 1M tokens)
interface AIModel {
  id: string;
  name: string;
  category: 'recommended' | 'anthropic' | 'openai' | 'google' | 'meta' | 'mistral' | 'xai' | 'other';
  description?: string;
  priceIn?: number;  // Price per 1M input tokens in USD
  priceOut?: number; // Price per 1M output tokens in USD
}

const AI_MODELS: AIModel[] = [
  // Recommended / Top Choices
  { id: 'anthropic/claude-3.5-sonnet', name: '🌟 Claude 3.5 Sonnet', category: 'recommended', description: 'Best for security analysis', priceIn: 3.00, priceOut: 15.00 },
  { id: 'openai/gpt-4o', name: '🌟 GPT-4o', category: 'recommended', description: 'Fastest GPT-4 model', priceIn: 2.50, priceOut: 10.00 },
  { id: 'openai/gpt-4o-mini', name: '🌟 GPT-4o Mini', category: 'recommended', description: 'Fast and cost-effective', priceIn: 0.15, priceOut: 0.60 },
  { id: 'x-ai/grok-3-fast-code-1', name: '🌟 Grok Fast Code 1', category: 'recommended', description: 'xAI code-optimized model', priceIn: 3.00, priceOut: 15.00 },
  { id: 'anthropic/claude-3-opus', name: '🌟 Claude 3 Opus', category: 'recommended', description: 'Most capable model', priceIn: 15.00, priceOut: 75.00 },
  { id: 'google/gemini-pro-1.5', name: '🌟 Gemini Pro 1.5', category: 'recommended', description: 'Long context window', priceIn: 1.25, priceOut: 5.00 },
  
  // Anthropic Models
  { id: 'anthropic/claude-3.5-sonnet:beta', name: 'Claude 3.5 Sonnet (Beta)', category: 'anthropic', priceIn: 3.00, priceOut: 15.00 },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', category: 'anthropic', priceIn: 3.00, priceOut: 15.00 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', category: 'anthropic', description: 'Fast and efficient', priceIn: 0.25, priceOut: 1.25 },
  { id: 'anthropic/claude-2.1', name: 'Claude 2.1', category: 'anthropic', priceIn: 8.00, priceOut: 24.00 },
  { id: 'anthropic/claude-2', name: 'Claude 2', category: 'anthropic', priceIn: 8.00, priceOut: 24.00 },
  { id: 'anthropic/claude-instant-1.2', name: 'Claude Instant 1.2', category: 'anthropic', priceIn: 0.80, priceOut: 2.40 },
  
  // OpenAI Models
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', category: 'openai', priceIn: 10.00, priceOut: 30.00 },
  { id: 'openai/gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', category: 'openai', priceIn: 10.00, priceOut: 30.00 },
  { id: 'openai/gpt-4', name: 'GPT-4', category: 'openai', priceIn: 30.00, priceOut: 60.00 },
  { id: 'openai/gpt-4-32k', name: 'GPT-4 32K', category: 'openai', priceIn: 60.00, priceOut: 120.00 },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'openai', priceIn: 0.50, priceOut: 1.50 },
  { id: 'openai/gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', category: 'openai', priceIn: 3.00, priceOut: 4.00 },
  { id: 'openai/o1-preview', name: 'O1 Preview', category: 'openai', description: 'Reasoning model', priceIn: 15.00, priceOut: 60.00 },
  { id: 'openai/o1-mini', name: 'O1 Mini', category: 'openai', description: 'Fast reasoning', priceIn: 3.00, priceOut: 12.00 },
  
  // Google Models
  { id: 'google/gemini-pro', name: 'Gemini Pro', category: 'google', priceIn: 0.50, priceOut: 1.50 },
  { id: 'google/gemini-pro-vision', name: 'Gemini Pro Vision', category: 'google', priceIn: 0.50, priceOut: 1.50 },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'google', priceIn: 1.25, priceOut: 5.00 },
  { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'google', priceIn: 0.075, priceOut: 0.30 },
  { id: 'google/palm-2-chat-bison', name: 'PaLM 2 Chat', category: 'google', priceIn: 0.50, priceOut: 0.50 },
  
  // Meta Llama Models
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', category: 'meta', description: 'Largest open model', priceIn: 2.70, priceOut: 2.70 },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', category: 'meta', priceIn: 0.52, priceOut: 0.75 },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', category: 'meta', priceIn: 0.055, priceOut: 0.055 },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', category: 'meta', priceIn: 0.52, priceOut: 0.75 },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', category: 'meta', priceIn: 0.055, priceOut: 0.055 },
  { id: 'meta-llama/codellama-70b-instruct', name: 'CodeLlama 70B', category: 'meta', description: 'Code specialist', priceIn: 0.52, priceOut: 0.75 },
  
  // Mistral Models
  { id: 'mistralai/mistral-large', name: 'Mistral Large', category: 'mistral', priceIn: 2.00, priceOut: 6.00 },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', category: 'mistral', priceIn: 2.70, priceOut: 8.10 },
  { id: 'mistralai/mistral-small', name: 'Mistral Small', category: 'mistral', priceIn: 0.20, priceOut: 0.60 },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', category: 'mistral', priceIn: 0.24, priceOut: 0.24 },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', category: 'mistral', priceIn: 0.65, priceOut: 0.65 },
  { id: 'mistralai/codestral-latest', name: 'Codestral', category: 'mistral', description: 'Code specialist', priceIn: 0.20, priceOut: 0.60 },
  
  // xAI Models
  { id: 'x-ai/grok-3-fast-code-1', name: 'Grok Fast Code 1', category: 'xai', description: 'Code-optimized model', priceIn: 3.00, priceOut: 15.00 },
  { id: 'x-ai/grok-3', name: 'Grok 3', category: 'xai', description: 'Latest Grok model', priceIn: 3.00, priceOut: 15.00 },
  { id: 'x-ai/grok-2', name: 'Grok 2', category: 'xai', priceIn: 2.00, priceOut: 10.00 },
  { id: 'x-ai/grok-beta', name: 'Grok Beta', category: 'xai', priceIn: 5.00, priceOut: 15.00 },
  
  // Other Models
  { id: 'cohere/command-r-plus', name: 'Command R+', category: 'other', priceIn: 2.50, priceOut: 10.00 },
  { id: 'cohere/command-r', name: 'Command R', category: 'other', priceIn: 0.15, priceOut: 0.60 },
  { id: 'databricks/dbrx-instruct', name: 'DBRX Instruct', category: 'other', priceIn: 0.75, priceOut: 0.75 },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', category: 'other', priceIn: 0.14, priceOut: 0.28 },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', category: 'other', priceIn: 0.14, priceOut: 0.28 },
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Perplexity Sonar Large', category: 'other', description: 'With web search', priceIn: 1.00, priceOut: 1.00 },
  { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Perplexity Sonar Small', category: 'other', description: 'With web search', priceIn: 0.20, priceOut: 0.20 },
  { id: 'qwen/qwen-2-72b-instruct', name: 'Qwen 2 72B', category: 'other', priceIn: 0.34, priceOut: 0.39 },
  { id: '01-ai/yi-large', name: 'Yi Large', category: 'other', priceIn: 3.00, priceOut: 3.00 },
];

const CATEGORY_LABELS: Record<string, string> = {
  recommended: '⭐ TOP CHOICES',
  anthropic: '🟣 Anthropic',
  openai: '🟢 OpenAI',
  google: '🔵 Google',
  meta: '🟠 Meta Llama',
  mistral: '🟡 Mistral AI',
  xai: '⚫ xAI',
  other: '⚪ Other Models',
};

const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  
  // Edit mode states for sensitive fields
  const [editModeOpenRouterKey, setEditModeOpenRouterKey] = useState(false);
  const [editModeHost, setEditModeHost] = useState(false);
  const [editModePort, setEditModePort] = useState(false);
  const [editModeApiBaseUrl, setEditModeApiBaseUrl] = useState(false);
  const [editModeWebsocketUrl, setEditModeWebsocketUrl] = useState(false);

  const handleSaveSettings = () => {
    dispatch(saveSettings());
    setShowSuccess(true);
  };

  const handleResetSettings = () => {
    dispatch(resetSettings());
    setShowSuccess(true);
  };

  const generateApiKey = async () => {
    try {
      // Use the secure backend API to generate API keys
      const response = await apiClient.generateApiKey();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response as any;
      if (data.success && data.api_key) {
        dispatch(setMCPServerSettings({ apiKey: data.api_key }));
      }
    } catch {
      // Fallback to secure local generation using Web Crypto API
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let key = 'hx_';
      for (let i = 0; i < 32; i++) {
        key += characters.charAt(array[i] % characters.length);
      }
      dispatch(setMCPServerSettings({ apiKey: key }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* MCP Server Configuration */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DnsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                MCP Server Configuration
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure the HexStrike AI MCP (Model Context Protocol) server settings for AI agent communication.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    bgcolor: settings.mcpServer.enabled ? 'success.main' : 'action.disabledBackground',
                    color: settings.mcpServer.enabled ? 'white' : 'text.secondary',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          MCP Server Status
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {settings.mcpServer.enabled ? 'Server is running and accepting connections' : 'Server is disabled'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={settings.mcpServer.enabled}
                        onChange={(e) => dispatch(setMCPServerSettings({ enabled: e.target.checked }))}
                        color="default"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    bgcolor: settings.mcpServer.externalAccessEnabled ? 'warning.dark' : 'background.paper',
                    border: settings.mcpServer.externalAccessEnabled ? '2px solid' : '1px solid',
                    borderColor: settings.mcpServer.externalAccessEnabled ? 'warning.main' : 'divider',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PublicIcon sx={{ color: settings.mcpServer.externalAccessEnabled ? 'warning.light' : 'text.secondary' }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            External Access
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Allow external services to connect
                          </Typography>
                        </Box>
                      </Box>
                      <Switch
                        checked={settings.mcpServer.externalAccessEnabled}
                        onChange={(e) => dispatch(setExternalAccessEnabled(e.target.checked))}
                        color="warning"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {settings.mcpServer.externalAccessEnabled && (
                <Grid size={12}>
                  <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Security Warning
                    </Typography>
                    <Typography variant="body2">
                      Enabling external access will allow connections from any IP address (0.0.0.0). 
                      Make sure to enable authentication and use a strong API key. 
                      Consider using a firewall to restrict access to trusted IPs only.
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Host Address"
                  value={settings.mcpServer.host}
                  onChange={(e) => dispatch(setMCPServerSettings({ host: e.target.value }))}
                  disabled={!editModeHost}
                  helperText={
                    settings.mcpServer.externalAccessEnabled
                      ? 'Using 0.0.0.0 for external access (all interfaces)'
                      : 'Use 127.0.0.1 for local only access'
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DnsIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {editModeHost ? (
                          <Tooltip title="Save Host Address">
                            <IconButton
                              onClick={() => {
                                setEditModeHost(false);
                                dispatch(saveSettings());
                              }}
                              color="success"
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit Host Address">
                            <IconButton onClick={() => setEditModeHost(true)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={settings.mcpServer.port}
                  onChange={(e) => dispatch(setMCPServerSettings({ port: parseInt(e.target.value) || 8888 }))}
                  disabled={!editModePort}
                  helperText="Default: 8888"
                  InputProps={{
                    inputProps: { min: 1024, max: 65535 },
                    endAdornment: (
                      <InputAdornment position="end">
                        {editModePort ? (
                          <Tooltip title="Save Port">
                            <IconButton
                              onClick={() => {
                                setEditModePort(false);
                                dispatch(saveSettings());
                              }}
                              color="success"
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit Port">
                            <IconButton onClick={() => setEditModePort(true)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Authentication
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.mcpServer.authRequired}
                      onChange={(e) => dispatch(setMCPServerSettings({ authRequired: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Require Authentication"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={settings.mcpServer.apiKey}
                  onChange={(e) => dispatch(setMCPServerSettings({ apiKey: e.target.value }))}
                  disabled={!settings.mcpServer.authRequired}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Copy API Key">
                          <IconButton
                            onClick={() => copyToClipboard(settings.mcpServer.apiKey)}
                            disabled={!settings.mcpServer.apiKey}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate New API Key">
                          <IconButton onClick={generateApiKey} disabled={!settings.mcpServer.authRequired}>
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  helperText={settings.mcpServer.authRequired ? 'Use this key to authenticate external connections' : 'Enable authentication to use API keys'}
                />
              </Grid>

              {settings.mcpServer.externalAccessEnabled && (
                <Grid size={12}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Connection Information for External Services
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={`URL: http://${settings.mcpServer.host}:${settings.mcpServer.port}`}
                        variant="outlined"
                        onClick={() => copyToClipboard(`http://${settings.mcpServer.host}:${settings.mcpServer.port}`)}
                        icon={<ContentCopyIcon />}
                      />
                      <Chip
                        label={`WebSocket: ws://${settings.mcpServer.host}:${settings.mcpServer.port}`}
                        variant="outlined"
                        onClick={() => copyToClipboard(`ws://${settings.mcpServer.host}:${settings.mcpServer.port}`)}
                        icon={<ContentCopyIcon />}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* OpenRouter AI Configuration */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SmartToyIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                OpenRouter AI Configuration
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure OpenRouter API for AI-powered security analysis and agent capabilities.
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ff41' }}
              >
                openrouter.ai/keys
              </a>
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    bgcolor: settings.aiProvider.openRouterEnabled ? 'success.main' : 'action.disabledBackground',
                    color: settings.aiProvider.openRouterEnabled ? 'white' : 'text.secondary',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          OpenRouter Status
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {settings.aiProvider.openRouterEnabled ? 'AI features enabled' : 'AI features disabled'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={settings.aiProvider.openRouterEnabled}
                        onChange={(e) => dispatch(setAIProviderSettings({ openRouterEnabled: e.target.checked }))}
                        color="default"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="OpenRouter API Key"
                  type={showOpenRouterKey ? 'text' : 'password'}
                  value={settings.aiProvider.openRouterApiKey}
                  onChange={(e) => dispatch(setAIProviderSettings({ openRouterApiKey: e.target.value }))}
                  placeholder="sk-or-v1-..."
                  disabled={!editModeOpenRouterKey}
                  helperText={editModeOpenRouterKey ? "Enter your OpenRouter API key, then click Save" : "Your OpenRouter API key for AI-powered features"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SecurityIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showOpenRouterKey ? 'Hide API Key' : 'Show API Key'}>
                          <IconButton onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}>
                            {showOpenRouterKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy API Key">
                          <IconButton
                            onClick={() => copyToClipboard(settings.aiProvider.openRouterApiKey)}
                            disabled={!settings.aiProvider.openRouterApiKey}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        {editModeOpenRouterKey ? (
                          <Tooltip title="Save API Key">
                            <IconButton
                              onClick={() => {
                                setEditModeOpenRouterKey(false);
                                dispatch(saveSettings());
                              }}
                              color="success"
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit API Key">
                            <IconButton onClick={() => setEditModeOpenRouterKey(true)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  options={AI_MODELS}
                  groupBy={(option) => option.category}
                  getOptionLabel={(option) => option.name}
                  value={AI_MODELS.find((m) => m.id === settings.aiProvider.openRouterModel) || AI_MODELS[0]}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      dispatch(setAIProviderSettings({ openRouterModel: newValue.id }));
                    }
                  }}
                  disabled={!settings.aiProvider.openRouterEnabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="AI Model"
                      placeholder="Search models..."
                      helperText="Search by name or scroll through categories"
                    />
                  )}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <ListSubheader
                        component="div"
                        sx={{
                          bgcolor: 'background.paper',
                          color: params.group === 'recommended' ? 'warning.main' : 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {CATEGORY_LABELS[params.group] || params.group}
                      </ListSubheader>
                      <ul style={{ padding: 0 }}>{params.children}</ul>
                    </li>
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5, width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{option.name}</Typography>
                              {option.category === 'recommended' && (
                                <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              )}
                            </Box>
                            {(option.priceIn !== undefined || option.priceOut !== undefined) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AttachMoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                <Typography variant="caption" sx={{ color: 'success.main', fontFamily: 'monospace', fontWeight: 600 }}>
                                  ${option.priceIn?.toFixed(2) ?? '?'} / ${option.priceOut?.toFixed(2) ?? '?'}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {option.description && (
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                              {option.id}
                            </Typography>
                            {(option.priceIn !== undefined || option.priceOut !== undefined) && (
                              <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                                per 1M tokens (in/out)
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </li>
                    );
                  }}
                  ListboxProps={{
                    sx: { maxHeight: 400 },
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>

              {settings.aiProvider.openRouterEnabled && settings.aiProvider.openRouterApiKey && (
                <Grid size={12}>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      OpenRouter Connected
                    </Typography>
                    <Typography variant="body2">
                      AI-powered security analysis is now available. Your agents can use advanced AI capabilities for vulnerability detection and exploit generation.
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {settings.aiProvider.openRouterEnabled && !settings.aiProvider.openRouterApiKey && (
                <Grid size={12}>
                  <Alert severity="warning" icon={<WarningIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      API Key Required
                    </Typography>
                    <Typography variant="body2">
                      Please enter your OpenRouter API key to enable AI features. You can get one at{' '}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', fontWeight: 600 }}
                      >
                        openrouter.ai/keys
                      </a>
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* API Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ApiIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                API Configuration
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="API Base URL"
                  value={settings.api.baseUrl}
                  onChange={(e) => dispatch(setAPISettings({ baseUrl: e.target.value }))}
                  disabled={!editModeApiBaseUrl}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {editModeApiBaseUrl ? (
                          <Tooltip title="Save API Base URL">
                            <IconButton
                              onClick={() => {
                                setEditModeApiBaseUrl(false);
                                dispatch(saveSettings());
                              }}
                              color="success"
                              size="small"
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit API Base URL">
                            <IconButton onClick={() => setEditModeApiBaseUrl(true)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="WebSocket URL"
                  value={settings.api.websocketUrl}
                  onChange={(e) => dispatch(setAPISettings({ websocketUrl: e.target.value }))}
                  disabled={!editModeWebsocketUrl}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {editModeWebsocketUrl ? (
                          <Tooltip title="Save WebSocket URL">
                            <IconButton
                              onClick={() => {
                                setEditModeWebsocketUrl(false);
                                dispatch(saveSettings());
                              }}
                              color="success"
                              size="small"
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit WebSocket URL">
                            <IconButton onClick={() => setEditModeWebsocketUrl(true)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Timeout (ms)"
                  type="number"
                  value={settings.api.timeout}
                  onChange={(e) => dispatch(setAPISettings({ timeout: parseInt(e.target.value) || 30000 }))}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Retry Attempts"
                  type="number"
                  value={settings.api.retryAttempts}
                  onChange={(e) => dispatch(setAPISettings({ retryAttempts: parseInt(e.target.value) || 3 }))}
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 10 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Theme Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaletteIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Theme Settings
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    value={settings.theme.mode}
                    label="Theme Mode"
                    onChange={(e) => dispatch(setThemeSettings({ mode: e.target.value as 'dark' | 'light' }))}
                  >
                    <MenuItem value="dark">🌙 Dark Mode (Recommended)</MenuItem>
                    <MenuItem value="light">☀️ Light Mode</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={settings.theme.primaryColor}
                  onChange={(e) => dispatch(setThemeSettings({ primaryColor: e.target.value }))}
                  size="small"
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Accent Color"
                  type="color"
                  value={settings.theme.accentColor}
                  onChange={(e) => dispatch(setThemeSettings({ accentColor: e.target.value }))}
                  size="small"
                  sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notification Settings
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enabled}
                      onChange={(e) => dispatch(setNotificationSettings({ enabled: e.target.checked }))}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.soundEnabled}
                      onChange={(e) => dispatch(setNotificationSettings({ soundEnabled: e.target.checked }))}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label="Sound Alerts"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.criticalOnlyNotify}
                      onChange={(e) => dispatch(setNotificationSettings({ criticalOnlyNotify: e.target.checked }))}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label="Critical Only"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.scanCompleteNotify}
                      onChange={(e) => dispatch(setNotificationSettings({ scanCompleteNotify: e.target.checked }))}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label="Notify on Scan Complete"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.vulnerabilityFoundNotify}
                      onChange={(e) => dispatch(setNotificationSettings({ vulnerabilityFoundNotify: e.target.checked }))}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label="Notify on Vulnerability Found"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Developer Settings */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CodeIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Developer Settings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure developer and demonstration options.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    bgcolor: settings.developer.mockDataEnabled ? 'info.dark' : 'action.disabledBackground',
                    border: settings.developer.mockDataEnabled ? '2px solid' : '1px solid',
                    borderColor: settings.developer.mockDataEnabled ? 'info.main' : 'divider',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Demo Mode
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {settings.developer.mockDataEnabled
                            ? 'Showing mock data for demonstration'
                            : 'Using real data from backend'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={settings.developer.mockDataEnabled}
                        onChange={(e) => dispatch(setDeveloperSettings({ mockDataEnabled: e.target.checked }))}
                        color="info"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {settings.developer.mockDataEnabled && (
                <Grid size={12}>
                  <Alert severity="info" icon={<CodeIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Demo Mode Active
                    </Typography>
                    <Typography variant="body2">
                      Mock data is being displayed for demonstration and showcase purposes. 
                      Disable this setting to use real data from the backend server.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" startIcon={<RestoreIcon />} onClick={handleResetSettings} color="secondary">
              Reset to Defaults
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </Box>
        </Grid>

        {/* Last Saved Info */}
        {settings.lastSaved && (
          <Grid size={12}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Settings last saved: {new Date(settings.lastSaved).toLocaleString()}
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Settings saved successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Copy Success Snackbar */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SettingsPage;
