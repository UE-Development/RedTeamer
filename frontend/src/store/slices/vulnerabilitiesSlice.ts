import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Vulnerability } from '../../types';

interface VulnerabilitiesState {
  vulnerabilities: Vulnerability[];
  selectedVulnerability: Vulnerability | null;
  filter: string;
  severityFilter: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: VulnerabilitiesState = {
  vulnerabilities: [],
  selectedVulnerability: null,
  filter: '',
  severityFilter: null,
  loading: false,
  error: null,
};

const vulnerabilitiesSlice = createSlice({
  name: 'vulnerabilities',
  initialState,
  reducers: {
    setVulnerabilities: (state, action: PayloadAction<Vulnerability[]>) => {
      state.vulnerabilities = action.payload;
    },
    addVulnerability: (state, action: PayloadAction<Vulnerability>) => {
      state.vulnerabilities.unshift(action.payload);
    },
    updateVulnerability: (state, action: PayloadAction<Vulnerability>) => {
      const index = state.vulnerabilities.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vulnerabilities[index] = action.payload;
      }
    },
    setSelectedVulnerability: (state, action: PayloadAction<Vulnerability | null>) => {
      state.selectedVulnerability = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setSeverityFilter: (state, action: PayloadAction<string | null>) => {
      state.severityFilter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setVulnerabilities,
  addVulnerability,
  updateVulnerability,
  setSelectedVulnerability,
  setFilter,
  setSeverityFilter,
  setLoading,
  setError,
} = vulnerabilitiesSlice.actions;

export default vulnerabilitiesSlice.reducer;
