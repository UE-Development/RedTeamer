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
import { useAppSelector, useAppDispatch } from '../store';
import {
  setMCPServerSettings,
  setExternalAccessEnabled,
  setThemeSettings,
  setAPISettings,
  setNotificationSettings,
  saveSettings,
  resetSettings,
} from '../store/slices/settingsSlice';
import { apiClient } from '../services/api';

const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

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
                  helperText="Default: 8888"
                  InputProps={{
                    inputProps: { min: 1024, max: 65535 },
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
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="WebSocket URL"
                  value={settings.api.websocketUrl}
                  onChange={(e) => dispatch(setAPISettings({ websocketUrl: e.target.value }))}
                  size="small"
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
