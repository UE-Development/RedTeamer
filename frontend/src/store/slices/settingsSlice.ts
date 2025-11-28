/**
 * Settings Slice - Redux state for application settings
 * Includes localStorage persistence for settings
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// LocalStorage key for persisting settings
const SETTINGS_STORAGE_KEY = 'hexstrike_settings';

export interface MCPServerSettings {
  host: string;
  port: number;
  enabled: boolean;
  externalAccessEnabled: boolean;
  externalHost: string;
  authRequired: boolean;
  apiKey: string;
}

export interface ThemeSettings {
  mode: 'dark' | 'light';
  primaryColor: string;
  accentColor: string;
}

export interface APISettings {
  baseUrl: string;
  websocketUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Single AI provider configuration
export interface AIProviderConfig {
  id: string;
  providerType: string;  // 'openrouter', 'openai', 'anthropic', 'custom', etc.
  customUrl?: string;    // For custom provider URLs
  apiKey: string;
  selectedModel: string;
  providerFilter: string;  // Filter by provider: 'all', 'anthropic', 'openai', etc.
  enabled: boolean;
}

// Multiple AI providers settings
export interface AIProviderSettings {
  providers: AIProviderConfig[];
  // Legacy fields for backward compatibility
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterEnabled: boolean;
  openRouterProvider: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  scanCompleteNotify: boolean;
  vulnerabilityFoundNotify: boolean;
  criticalOnlyNotify: boolean;
}

export interface DeveloperSettings {
  mockDataEnabled: boolean;
}


export interface SettingsState {
  mcpServer: MCPServerSettings;
  theme: ThemeSettings;
  api: APISettings;
  aiProvider: AIProviderSettings;
  notifications: NotificationSettings;
  developer: DeveloperSettings;
  loading: boolean;
  error: string | null;
  lastSaved: string | null;
}

const defaultSettings: SettingsState = {
  mcpServer: {
    host: '127.0.0.1',
    port: 8889,
    enabled: true,
    externalAccessEnabled: false,
    externalHost: '0.0.0.0',
    authRequired: true,
    apiKey: '',
  },
  theme: {
    mode: 'dark',
    primaryColor: '#b71c1c',
    accentColor: '#ff5252',
  },
  api: {
    baseUrl: 'http://localhost:8889',
    websocketUrl: 'ws://localhost:8889',
    timeout: 30000,
    retryAttempts: 3,
  },
  aiProvider: {
    providers: [{
      id: 'default-openrouter',
      providerType: 'openrouter',
      apiKey: '',
      selectedModel: 'anthropic/claude-3.5-sonnet',
      providerFilter: 'all',
      enabled: false,
    }],
    // Legacy fields for backward compatibility
    openRouterApiKey: '',
    openRouterModel: 'anthropic/claude-3.5-sonnet',
    openRouterEnabled: false,
    openRouterProvider: 'all',
  },
  notifications: {
    enabled: true,
    soundEnabled: true,
    scanCompleteNotify: true,
    vulnerabilityFoundNotify: true,
    criticalOnlyNotify: false,
  },
  developer: {
    mockDataEnabled: false,
  },
  loading: false,
  error: null,
  lastSaved: null,
};

/**
 * Load settings from localStorage
 * Falls back to default settings if nothing is stored or if parsing fails
 * Handles migration from old single-provider structure to new multi-provider structure
 */
const loadSettingsFromStorage = (): SettingsState => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      
      // Migrate old aiProvider format to new format with providers array
      let aiProviderData = { ...defaultSettings.aiProvider };
      if (parsed.aiProvider) {
        // Check if we have the new providers array format
        if (Array.isArray(parsed.aiProvider.providers)) {
          aiProviderData = { ...defaultSettings.aiProvider, ...parsed.aiProvider };
        } else {
          // Migrate from old format to new format
          aiProviderData = {
            providers: [{
              id: 'migrated-openrouter',
              providerType: 'openrouter',
              apiKey: parsed.aiProvider.openRouterApiKey || '',
              selectedModel: parsed.aiProvider.openRouterModel || 'anthropic/claude-3.5-sonnet',
              providerFilter: parsed.aiProvider.openRouterProvider || 'all',
              enabled: parsed.aiProvider.openRouterEnabled || false,
            }],
            // Keep legacy fields for backward compatibility
            openRouterApiKey: parsed.aiProvider.openRouterApiKey || '',
            openRouterModel: parsed.aiProvider.openRouterModel || 'anthropic/claude-3.5-sonnet',
            openRouterEnabled: parsed.aiProvider.openRouterEnabled || false,
            openRouterProvider: parsed.aiProvider.openRouterProvider || 'all',
          };
        }
      }
      
      // Deep merge with defaults to ensure all fields exist
      return {
        ...defaultSettings,
        ...parsed,
        mcpServer: { ...defaultSettings.mcpServer, ...parsed.mcpServer },
        theme: { ...defaultSettings.theme, ...parsed.theme },
        api: { ...defaultSettings.api, ...parsed.api },
        aiProvider: aiProviderData,
        notifications: { ...defaultSettings.notifications, ...parsed.notifications },
        developer: { ...defaultSettings.developer, ...parsed.developer },
      };
    }
  } catch (error) {
    // If parsing fails, return default settings
    console.warn('Failed to load settings from localStorage:', error instanceof Error ? error.message : 'Unknown error');
  }
  return defaultSettings;
};

/**
 * Save settings to localStorage
 */
const saveSettingsToStorage = (settings: SettingsState): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Initialize state from localStorage
const initialState: SettingsState = loadSettingsFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setMCPServerSettings: (state, action: PayloadAction<Partial<MCPServerSettings>>) => {
      state.mcpServer = { ...state.mcpServer, ...action.payload };
    },
    setExternalAccessEnabled: (state, action: PayloadAction<boolean>) => {
      state.mcpServer.externalAccessEnabled = action.payload;
      // When enabling external access, change host to 0.0.0.0
      if (action.payload) {
        state.mcpServer.host = state.mcpServer.externalHost;
      } else {
        state.mcpServer.host = '127.0.0.1';
      }
    },
    setThemeSettings: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    setAPISettings: (state, action: PayloadAction<Partial<APISettings>>) => {
      state.api = { ...state.api, ...action.payload };
    },
    setAIProviderSettings: (state, action: PayloadAction<Partial<AIProviderSettings>>) => {
      state.aiProvider = { ...state.aiProvider, ...action.payload };
      // Sync legacy fields from first provider for backward compatibility
      if (state.aiProvider.providers.length > 0) {
        const firstProvider = state.aiProvider.providers[0];
        state.aiProvider.openRouterApiKey = firstProvider.apiKey;
        state.aiProvider.openRouterModel = firstProvider.selectedModel;
        state.aiProvider.openRouterEnabled = firstProvider.enabled;
        state.aiProvider.openRouterProvider = firstProvider.providerFilter;
      }
    },
    // Add a new AI provider
    addAIProvider: (state) => {
      const newId = `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.aiProvider.providers.push({
        id: newId,
        providerType: 'openrouter',
        apiKey: '',
        selectedModel: 'anthropic/claude-3.5-sonnet',
        providerFilter: 'all',
        enabled: false,
      });
    },
    // Remove an AI provider by ID
    removeAIProvider: (state, action: PayloadAction<string>) => {
      state.aiProvider.providers = state.aiProvider.providers.filter(
        (provider) => provider.id !== action.payload
      );
      // Ensure at least one provider exists
      if (state.aiProvider.providers.length === 0) {
        state.aiProvider.providers.push({
          id: 'default-openrouter',
          providerType: 'openrouter',
          apiKey: '',
          selectedModel: 'anthropic/claude-3.5-sonnet',
          providerFilter: 'all',
          enabled: false,
        });
      }
      // Update legacy fields
      const firstProvider = state.aiProvider.providers[0];
      state.aiProvider.openRouterApiKey = firstProvider.apiKey;
      state.aiProvider.openRouterModel = firstProvider.selectedModel;
      state.aiProvider.openRouterEnabled = firstProvider.enabled;
      state.aiProvider.openRouterProvider = firstProvider.providerFilter;
    },
    // Update a specific AI provider by ID
    updateAIProvider: (state, action: PayloadAction<{ id: string; updates: Partial<AIProviderConfig> }>) => {
      const { id, updates } = action.payload;
      const providerIndex = state.aiProvider.providers.findIndex((p) => p.id === id);
      if (providerIndex !== -1) {
        state.aiProvider.providers[providerIndex] = {
          ...state.aiProvider.providers[providerIndex],
          ...updates,
        };
        // Update legacy fields if this is the first provider
        if (providerIndex === 0) {
          const firstProvider = state.aiProvider.providers[0];
          state.aiProvider.openRouterApiKey = firstProvider.apiKey;
          state.aiProvider.openRouterModel = firstProvider.selectedModel;
          state.aiProvider.openRouterEnabled = firstProvider.enabled;
          state.aiProvider.openRouterProvider = firstProvider.providerFilter;
        }
      }
    },
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setDeveloperSettings: (state, action: PayloadAction<Partial<DeveloperSettings>>) => {
      state.developer = { ...state.developer, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    saveSettings: (state) => {
      state.lastSaved = new Date().toISOString();
      state.error = null;
      // Persist to localStorage when saving
      saveSettingsToStorage(state);
    },
    resetSettings: () => {
      // Clear localStorage when resetting
      try {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear settings from localStorage:', error instanceof Error ? error.message : 'Unknown error');
      }
      return defaultSettings;
    },
  },
});

export const {
  setMCPServerSettings,
  setExternalAccessEnabled,
  setThemeSettings,
  setAPISettings,
  setAIProviderSettings,
  addAIProvider,
  removeAIProvider,
  updateAIProvider,
  setNotificationSettings,
  setDeveloperSettings,
  setLoading,
  setError,
  saveSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
