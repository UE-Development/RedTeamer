/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices (will be created next)
import dashboardReducer from './slices/dashboardSlice';
import agentsReducer from './slices/agentsSlice';
import scansReducer from './slices/scansSlice';
import toolsReducer from './slices/toolsSlice';
import vulnerabilitiesReducer from './slices/vulnerabilitiesSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    agents: agentsReducer,
    scans: scansReducer,
    tools: toolsReducer,
    vulnerabilities: vulnerabilitiesReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['agents/addMessage'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.date'],
        // Ignore these paths in the state
        ignoredPaths: ['agents.messages', 'scans.items'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
