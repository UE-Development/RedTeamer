import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Scan } from '../../types';

interface ScansState {
  scans: Scan[];
  selectedScan: Scan | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScansState = {
  scans: [],
  selectedScan: null,
  loading: false,
  error: null,
};

const scansSlice = createSlice({
  name: 'scans',
  initialState,
  reducers: {
    setScans: (state, action: PayloadAction<Scan[]>) => {
      state.scans = action.payload;
    },
    addScan: (state, action: PayloadAction<Scan>) => {
      state.scans.unshift(action.payload);
    },
    updateScan: (state, action: PayloadAction<Scan>) => {
      const index = state.scans.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.scans[index] = action.payload;
      }
    },
    removeScan: (state, action: PayloadAction<string>) => {
      state.scans = state.scans.filter((s) => s.id !== action.payload);
    },
    setSelectedScan: (state, action: PayloadAction<Scan | null>) => {
      state.selectedScan = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setScans, addScan, updateScan, removeScan, setSelectedScan, setLoading, setError } =
  scansSlice.actions;

export default scansSlice.reducer;
