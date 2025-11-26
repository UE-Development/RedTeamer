import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Tool } from '../../types';

interface ToolsState {
  tools: Tool[];
  selectedTool: Tool | null;
  filter: string;
  category: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ToolsState = {
  tools: [],
  selectedTool: null,
  filter: '',
  category: null,
  loading: false,
  error: null,
};

const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    setTools: (state, action: PayloadAction<Tool[]>) => {
      state.tools = action.payload;
    },
    updateTool: (state, action: PayloadAction<Tool>) => {
      const index = state.tools.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tools[index] = action.payload;
      }
    },
    setSelectedTool: (state, action: PayloadAction<Tool | null>) => {
      state.selectedTool = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTools, updateTool, setSelectedTool, setFilter, setCategory, setLoading, setError } =
  toolsSlice.actions;

export default toolsSlice.reducer;
