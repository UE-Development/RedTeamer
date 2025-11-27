/**
 * Tools Page - Security Tools Library
 * Browse and manage 150+ security tools
 */

import { useState, useMemo } from 'react';
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
import { ToolCard, ToolDetailDialog, ToolChainBuilder } from '../components/tools';
import type { Workflow } from '../components/tools';
import { useAppSelector } from '../store';
import type { Tool } from '../types';
import { getAllTools, getToolCounts } from '../data/securityTools';


const ToolsPage = () => {
  const mockDataEnabled = useAppSelector((state) => state.settings.developer.mockDataEnabled);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['net-1', 'web-1', 'bin-1']));
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Get all tools from the comprehensive database - always show full list in demo mode
  const allSecurityTools = useMemo(() => getAllTools(), []);
  const tools = mockDataEnabled ? allSecurityTools : [];

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

  // Use dynamic tool counts from the data file
  const dynamicCounts = useMemo(() => getToolCounts(), []);
  const toolStats = {
    total: dynamicCounts.total,
    installed: tools.filter((t) => t.installed).length,
    network: dynamicCounts.network,
    web: dynamicCounts.web,
    binary: dynamicCounts.binary,
    cloud: dynamicCounts.cloud,
    ctf: dynamicCounts.ctf,
    osint: dynamicCounts.osint,
    password: dynamicCounts.password,
  };

  return (
    <Box>
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
