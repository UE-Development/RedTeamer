/**
 * AI Provider Card Component
 * Reusable component for configuring individual AI providers
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  ListSubheader,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import LinkIcon from '@mui/icons-material/Link';
import Grid from '@mui/material/Grid';
import type { AIProviderConfig } from '../../store/slices/settingsSlice';
import { apiClient } from '../../services/api';

// Available provider types
const PROVIDER_TYPES = [
  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai' },
  { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com' },
  { id: 'anthropic', name: 'Anthropic', url: 'https://api.anthropic.com' },
  { id: 'custom', name: 'Custom Link', url: '' },
];

interface DynamicAIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  priceIn?: number | null;
  priceOut?: number | null;
  context_length?: number;
}

interface AIProviderInfo {
  id: string;
  name: string;
}

interface AIProviderCardProps {
  provider: AIProviderConfig;
  onUpdate: (updates: Partial<AIProviderConfig>) => void;
  onRemove: () => void;
  onCopy: (text: string) => void;
  showRemoveButton?: boolean;
}

const AIProviderCard = ({
  provider,
  onUpdate,
  onRemove,
  onCopy,
  showRemoveButton = true,
}: AIProviderCardProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [editModeApiKey, setEditModeApiKey] = useState(false);
  const [editModeCustomUrl, setEditModeCustomUrl] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<DynamicAIModel[]>([]);
  const [availableProviders, setAvailableProviders] = useState<AIProviderInfo[]>([
    { id: 'all', name: 'All Providers' },
  ]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsSource, setModelsSource] = useState<'static' | 'openrouter'>('static');

  // Load AI models when API key or provider filter changes
  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const response = await apiClient.getAIModels(
        provider.apiKey || undefined,
        provider.providerFilter || 'all'
      );
      if (response.success) {
        const data = response as {
          success: boolean;
          models?: DynamicAIModel[];
          providers?: AIProviderInfo[];
          source?: string;
        };
        setDynamicModels(data.models || []);
        setAvailableProviders(data.providers || [{ id: 'all', name: 'All Providers' }]);
        setModelsSource(data.source === 'openrouter' ? 'openrouter' : 'static');
      }
    } catch (error) {
      console.error('Failed to load AI models:', error);
      // Keep existing models on error
    } finally {
      setModelsLoading(false);
    }
  }, [provider.apiKey, provider.providerFilter]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleSaveApiKey = () => {
    setEditModeApiKey(false);
  };

  const handleSaveCustomUrl = () => {
    setEditModeCustomUrl(false);
  };

  const isCustomProvider = provider.providerType === 'custom';

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: provider.enabled ? 'success.main' : 'divider',
        transition: 'all 0.3s ease',
        mb: 2,
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {/* Provider Type Dropdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={provider.providerType}
                label="Provider"
                onChange={(e) => onUpdate({ providerType: e.target.value })}
                startAdornment={
                  isCustomProvider ? (
                    <InputAdornment position="start">
                      <LinkIcon color="primary" />
                    </InputAdornment>
                  ) : undefined
                }
              >
                {PROVIDER_TYPES.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* On/Off Toggle */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Card
              sx={{
                bgcolor: provider.enabled ? 'success.main' : 'action.disabledBackground',
                color: provider.enabled ? 'white' : 'text.secondary',
                transition: 'all 0.3s ease',
                height: '100%',
                minHeight: 56,
              }}
            >
              <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    {provider.enabled ? 'ON' : 'OFF'}
                  </Typography>
                  <Switch
                    checked={provider.enabled}
                    onChange={(e) => onUpdate({ enabled: e.target.checked })}
                    color="default"
                    size="small"
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

          {/* Remove Button */}
          {showRemoveButton && (
            <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Remove Provider">
                <IconButton onClick={onRemove} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}

          {/* Custom URL Input (only for custom provider) */}
          {isCustomProvider && (
            <Grid size={12}>
              <TextField
                fullWidth
                label="Custom API URL"
                value={provider.customUrl || ''}
                onChange={(e) => onUpdate({ customUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                disabled={!editModeCustomUrl}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy URL">
                        <IconButton
                          onClick={() => onCopy(provider.customUrl || '')}
                          disabled={!provider.customUrl}
                          size="small"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {editModeCustomUrl ? (
                        <Tooltip title="Save URL">
                          <IconButton onClick={handleSaveCustomUrl} color="success" size="small">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Edit URL">
                          <IconButton onClick={() => setEditModeCustomUrl(true)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}

          {/* API Key Input */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={provider.apiKey}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
              placeholder="sk-..."
              disabled={!editModeApiKey}
              helperText={editModeApiKey ? 'Enter your API key, then click Save' : 'Your API key for AI-powered features'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showApiKey ? 'Hide API Key' : 'Show API Key'}>
                      <IconButton onClick={() => setShowApiKey(!showApiKey)} size="small">
                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy API Key">
                      <IconButton
                        onClick={() => onCopy(provider.apiKey)}
                        disabled={!provider.apiKey}
                        size="small"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    {editModeApiKey ? (
                      <Tooltip title="Save API Key">
                        <IconButton onClick={handleSaveApiKey} color="success" size="small">
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit API Key">
                        <IconButton onClick={() => setEditModeApiKey(true)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Provider Filter Dropdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={!provider.enabled}>
              <InputLabel>Provider Filter</InputLabel>
              <Select
                value={provider.providerFilter || 'all'}
                label="Provider Filter"
                onChange={(e) => onUpdate({ providerFilter: e.target.value })}
              >
                {availableProviders.map((prov) => (
                  <MenuItem key={prov.id} value={prov.id}>
                    {prov.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Dynamic Model Selection */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Autocomplete
              options={dynamicModels}
              groupBy={(option) => option.provider}
              getOptionLabel={(option) => option.name}
              value={dynamicModels.find((m) => m.id === provider.selectedModel) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  onUpdate({ selectedModel: newValue.id });
                }
              }}
              disabled={!provider.enabled}
              loading={modelsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="AI Model"
                  placeholder="Search models..."
                  helperText={
                    modelsLoading
                      ? 'Loading models...'
                      : modelsSource === 'openrouter'
                        ? `${dynamicModels.length} models loaded from OpenRouter API`
                        : 'Using default model list (add API key for full list)'
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {modelsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderGroup={(params) => (
                <li key={params.key}>
                  <ListSubheader
                    component="div"
                    sx={{
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {availableProviders.find((p) => p.id === params.group)?.name || params.group}
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
                        </Box>
                        {option.priceIn !== undefined &&
                          option.priceIn !== null &&
                          option.priceOut !== undefined &&
                          option.priceOut !== null && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AttachMoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                              <Typography
                                variant="caption"
                                sx={{ color: 'success.main', fontFamily: 'monospace', fontWeight: 600 }}
                              >
                                ${option.priceIn.toFixed(2)} / ${option.priceOut.toFixed(2)}
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
                        {option.context_length && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}
                          >
                            {(option.context_length / 1000).toFixed(0)}K context
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
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AIProviderCard;
