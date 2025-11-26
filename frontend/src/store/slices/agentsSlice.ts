import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Agent, AgentMessage } from '../../types';

interface AgentsState {
  agents: Agent[];
  selectedAgent: Agent | null;
  messages: AgentMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  selectedAgent: null,
  messages: [],
  loading: false,
  error: null,
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    setSelectedAgent: (state, action: PayloadAction<Agent | null>) => {
      state.selectedAgent = action.payload;
    },
    addMessage: (state, action: PayloadAction<AgentMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<AgentMessage[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
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
  setAgents,
  updateAgent,
  setSelectedAgent,
  addMessage,
  setMessages,
  clearMessages,
  setLoading,
  setError,
} = agentsSlice.actions;

export default agentsSlice.reducer;
