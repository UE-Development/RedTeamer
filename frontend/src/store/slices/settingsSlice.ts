/**
 * Settings Slice - Redux state for application settings
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

export interface AIProviderSettings {
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterEnabled: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  scanCompleteNotify: boolean;
  vulnerabilityFoundNotify: boolean;
  criticalOnlyNotify: boolean;
}

export interface SettingsState {
  mcpServer: MCPServerSettings;
  theme: ThemeSettings;
  api: APISettings;
  aiProvider: AIProviderSettings;
  notifications: NotificationSettings;
  loading: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialState: SettingsState = {
  mcpServer: {
    host: '127.0.0.1',
    port: 8888,
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
    baseUrl: 'http://localhost:8888',
    websocketUrl: 'ws://localhost:8888',
    timeout: 30000,
    retryAttempts: 3,
  },
  aiProvider: {
    openRouterApiKey: '',
    openRouterModel: 'anthropic/claude-3.5-sonnet',
    openRouterEnabled: false,
  },
  notifications: {
    enabled: true,
    soundEnabled: true,
    scanCompleteNotify: true,
    vulnerabilityFoundNotify: true,
    criticalOnlyNotify: false,
  },
  loading: false,
  error: null,
  lastSaved: null,
};

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
    },
    setNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
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
    },
    resetSettings: () => initialState,
  },
});

export const {
  setMCPServerSettings,
  setExternalAccessEnabled,
  setThemeSettings,
  setAPISettings,
  setAIProviderSettings,
  setNotificationSettings,
  setLoading,
  setError,
  saveSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
