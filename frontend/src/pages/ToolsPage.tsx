/**
 * Tools Page - Security Tools Library
 * Browse and manage 150+ security tools
 * Supports both demo mode (mock data) and real backend data
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  InputAdornment,
  Paper,
  Button,
  Snackbar,
  Alert,
  ButtonGroup,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';
import { ToolCard, ToolDetailDialog, ToolChainBuilder } from '../components/tools';
import type { Workflow } from '../components/tools';
import { useAppSelector } from '../store';
import type { Tool, ToolCategory } from '../types';
import { getAllTools, getToolCounts } from '../data/securityTools';
import { apiClient } from '../services/api';

// Interface for backend tool response
interface BackendTool {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  installed: boolean;
  usageCount: number;
}

// Valid tool categories - extracted as module constant for reuse
const VALID_TOOL_CATEGORIES: ToolCategory[] = ['network', 'web', 'binary', 'cloud', 'ctf', 'osint', 'password'];

// Helper to validate and transform backend tool data
function transformBackendTool(tool: BackendTool): Tool {
  const category = VALID_TOOL_CATEGORIES.includes(tool.category as ToolCategory) 
    ? (tool.category as ToolCategory) 
    : 'network';
  
  return {
    id: tool.id,
    name: tool.name,
    category,
    version: tool.version,
    description: tool.description,
    installed: tool.installed,
    parameters: [],
    usageCount: tool.usageCount || 0,
  };
}

const ToolsPage = () => {
  const mockDataEnabled = useAppSelector((state) => state.settings.developer.mockDataEnabled);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['net-1', 'web-1', 'bin-1']));
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [backendTools, setBackendTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Fetch tools from backend when demo mode is off
  const fetchToolsFromBackend = useCallback(async () => {
    if (mockDataEnabled) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.listTools();
      if (response.success && Array.isArray(response.data)) {
        const transformedTools = response.data.map((tool: BackendTool) => transformBackendTool(tool));
        setBackendTools(transformedTools);
      }
    } catch (error) {
      console.warn('Failed to fetch tools from backend:', error instanceof Error ? error.message : 'Unknown error');
      setBackendTools([]);
    } finally {
      setIsLoading(false);
    }
  }, [mockDataEnabled]);

  // Fetch tools when component mounts or mockDataEnabled changes
  useEffect(() => {
    if (!mockDataEnabled) {
      fetchToolsFromBackend();
    }
  }, [mockDataEnabled, fetchToolsFromBackend]);

  // Get all tools from the comprehensive database in demo mode, or from backend otherwise
  const allSecurityTools = useMemo(() => getAllTools(), []);
  const tools = mockDataEnabled ? allSecurityTools : backendTools;

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesInstalled = !showInstalledOnly || tool.installed;

      return matchesSearch && matchesCategory && matchesInstalled;
    });
  }, [tools, searchQuery, selectedCategory, showInstalledOnly]);

  const handleLaunchTool = (tool: Tool) => {
    setSelectedTool(tool);
    setDetailDialogOpen(true);
  };

  const handleToolExecute = (tool: Tool, parameters: Record<string, unknown>) => {
    console.log('Executing tool:', tool.name, 'with parameters:', parameters);
    setDetailDialogOpen(false);
    setSnackbar({
      open: true,
      message: `${tool.name} execution started with target: ${parameters.target}`,
      severity: 'success',
    });
  };

  const handleToggleFavorite = (tool: Tool) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tool.id)) {
        newFavorites.delete(tool.id);
      } else {
        newFavorites.add(tool.id);
      }
      return newFavorites;
    });
  };

  const handleWorkflowSave = (workflow: Workflow) => {
    console.log('Saving workflow:', workflow);
    setSnackbar({
      open: true,
      message: `Workflow "${workflow.name}" saved successfully!`,
      severity: 'success',
    });
    setWorkflowBuilderOpen(false);
  };

  const handleWorkflowRun = (workflow: Workflow) => {
    console.log('Running workflow:', workflow);
    setSnackbar({
      open: true,
      message: `Workflow "${workflow.name}" started with ${workflow.steps.length} steps`,
      severity: 'info',
    });
    setWorkflowBuilderOpen(false);
  };

  // Use dynamic tool counts based on data source
  const dynamicCounts = useMemo(() => getToolCounts(), []);
  const toolStats = mockDataEnabled ? {
    total: dynamicCounts.total,
    installed: tools.filter((t) => t.installed).length,
    network: dynamicCounts.network,
    web: dynamicCounts.web,
    binary: dynamicCounts.binary,
    cloud: dynamicCounts.cloud,
    ctf: dynamicCounts.ctf,
    osint: dynamicCounts.osint,
    password: dynamicCounts.password,
  } : {
    total: tools.length,
    installed: tools.filter((t) => t.installed).length,
    network: tools.filter((t) => t.category === 'network').length,
    web: tools.filter((t) => t.category === 'web').length,
    binary: tools.filter((t) => t.category === 'binary').length,
    cloud: tools.filter((t) => t.category === 'cloud').length,
    ctf: tools.filter((t) => t.category === 'ctf').length,
    osint: tools.filter((t) => t.category === 'osint').length,
    password: tools.filter((t) => t.category === 'password').length,
  };

  return (
    <Box>
      {/* Info banner when demo mode is off */}
      {!mockDataEnabled && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          {isLoading ? 'Loading tools from backend...' : `Showing ${tools.length} tools from the backend. Enable Demo Mode in Settings for the full 160+ tool library.`}
        </Alert>
      )}
      
      {/* Header - Mobile optimized */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: { xs: 1.5, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          Security Tools ({toolStats.total}+)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <ButtonGroup variant="outlined" size="small">
            <Chip
              label={`${toolStats.installed} Installed`}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${toolStats.total - toolStats.installed} Not Installed`}
              color="warning"
              variant="outlined"
              size="small"
            />
          </ButtonGroup>
          <Button
            variant="contained"
            startIcon={<AccountTreeIcon />}
            onClick={() => setWorkflowBuilderOpen(true)}
            size="small"
          >
            Workflow Builder
          </Button>
        </Box>
      </Box>

      {/* Tool Chain Builder */}
      <ToolChainBuilder
        open={workflowBuilderOpen}
        onClose={() => setWorkflowBuilderOpen(false)}
        onSave={handleWorkflowSave}
        onRun={handleWorkflowRun}
      />

      {/* Filters - Mobile optimized */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All ({toolStats.total})</MenuItem>
                <MenuItem value="network">🔍 Network ({toolStats.network})</MenuItem>
                <MenuItem value="web">🌐 Web ({toolStats.web})</MenuItem>
                <MenuItem value="binary">💻 Binary ({toolStats.binary})</MenuItem>
                <MenuItem value="cloud">☁️ Cloud ({toolStats.cloud})</MenuItem>
                <MenuItem value="ctf">🏆 CTF ({toolStats.ctf})</MenuItem>
                <MenuItem value="osint">🔥 OSINT ({toolStats.osint})</MenuItem>
                <MenuItem value="password">🔐 Password ({toolStats.password})</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <Button
              fullWidth
              size="small"
              variant={showInstalledOnly ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowInstalledOnly(!showInstalledOnly)}
              sx={{ height: '40px' }}
            >
              {showInstalledOnly ? 'Installed' : 'All'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tools Grid - Mobile optimized */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {filteredTools.map((tool) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={tool.id}>
            <ToolCard
              tool={tool}
              onLaunch={handleLaunchTool}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(tool.id)}
            />
          </Grid>
        ))}
      </Grid>

      {filteredTools.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tools found matching your criteria
          </Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setShowInstalledOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Tool Detail Dialog */}
      <ToolDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        tool={selectedTool}
        onExecute={handleToolExecute}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ToolsPage;
