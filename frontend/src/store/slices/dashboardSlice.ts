/**
 * Dashboard State Management
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DashboardMetrics, ActivityItem } from '../../types';

interface DashboardState {
  metrics: DashboardMetrics;
  recentActivity: ActivityItem[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: {
    activeScans: 0,
    toolsUsed: 0,
    vulnerabilitiesFound: 0,
    projectsActive: 0,
    agentsOnline: 0,
  },
  recentActivity: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<DashboardMetrics>) => {
      state.metrics = action.payload;
    },
    updateMetric: (state, action: PayloadAction<{ key: keyof DashboardMetrics; value: number }>) => {
      state.metrics[action.payload.key] = action.payload.value;
    },
    addActivity: (state, action: PayloadAction<ActivityItem>) => {
      state.recentActivity.unshift(action.payload);
      // Keep only last 50 activities
      if (state.recentActivity.length > 50) {
        state.recentActivity = state.recentActivity.slice(0, 50);
      }
    },
    setRecentActivity: (state, action: PayloadAction<ActivityItem[]>) => {
      state.recentActivity = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setMetrics,
  updateMetric,
  addActivity,
  setRecentActivity,
  setLoading,
  setError,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
