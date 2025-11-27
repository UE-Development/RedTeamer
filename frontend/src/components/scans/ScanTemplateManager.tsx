/**
 * Scan Template Manager Component
 * Sprint 7: Create scan template manager
 * Manage, create, and apply scan templates for reusable configurations
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';

export interface ScanTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reconnaissance' | 'vulnerability' | 'web' | 'network' | 'cloud' | 'custom';
  scanType: 'quick' | 'standard' | 'deep' | 'custom';
  tools: string[];
  parameters: Record<string, unknown>;
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  estimatedDuration: string;
}

interface ScanTemplateManagerProps {
  templates: ScanTemplate[];
  onApplyTemplate: (template: ScanTemplate) => void;
  onSaveTemplate: (template: Omit<ScanTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onUpdateTemplate: (id: string, template: Partial<ScanTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (template: ScanTemplate) => void;
}

// Default templates
const DEFAULT_TEMPLATES: ScanTemplate[] = [
  {
    id: 'default-quick',
    name: 'Quick Vulnerability Scan',
    description: 'Fast scan for common vulnerabilities on web applications',
    category: 'vulnerability',
    scanType: 'quick',
    tools: ['Nmap', 'Nuclei'],
    parameters: { threads: 20, timeout: 60, aggressive: false },
    isDefault: true,
    isFavorite: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 156,
    estimatedDuration: '5-10 min',
  },
  {
    id: 'default-web',
    name: 'Web Application Assessment',
    description: 'Comprehensive web application security testing',
    category: 'web',
    scanType: 'standard',
    tools: ['Nmap', 'Nuclei', 'Gobuster', 'SQLMap', 'FFuf'],
    parameters: { threads: 30, timeout: 300, aggressive: true, crawlDepth: 3 },
    isDefault: true,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 89,
    estimatedDuration: '20-30 min',
  },
  {
    id: 'default-network',
    name: 'Network Infrastructure Scan',
    description: 'Deep network scanning with service detection and vulnerability assessment',
    category: 'network',
    scanType: 'deep',
    tools: ['Nmap', 'Rustscan', 'Masscan', 'Enum4linux'],
    parameters: { threads: 50, timeout: 600, portRange: '1-65535', osDetection: true },
    isDefault: true,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 67,
    estimatedDuration: '60+ min',
  },
  {
    id: 'default-recon',
    name: 'Subdomain Reconnaissance',
    description: 'Comprehensive subdomain enumeration and reconnaissance',
    category: 'reconnaissance',
    scanType: 'standard',
    tools: ['Amass', 'Subfinder', 'HTTPx', 'TheHarvester'],
    parameters: { passive: true, active: false, recursive: true },
    isDefault: true,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 234,
    estimatedDuration: '15-25 min',
  },
  {
    id: 'default-cloud',
    name: 'Cloud Security Assessment',
    description: 'AWS/Azure/GCP security misconfiguration detection',
    category: 'cloud',
    scanType: 'standard',
    tools: ['Prowler', 'Scout Suite', 'Trivy', 'Checkov'],
    parameters: { cloudProvider: 'aws', complianceChecks: true },
    isDefault: true,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    usageCount: 45,
    estimatedDuration: '30-45 min',
  },
];

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  reconnaissance: 'info',
  vulnerability: 'error',
  web: 'primary',
  network: 'secondary',
  cloud: 'success',
  custom: 'warning',
};

const CATEGORY_ICONS: Record<string, string> = {
  reconnaissance: '🔍',
  vulnerability: '🛡️',
  web: '🌐',
  network: '🔌',
  cloud: '☁️',
  custom: '⚙️',
};

const ScanTemplateManager = ({
  templates: propTemplates = [],
  onApplyTemplate,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
}: ScanTemplateManagerProps) => {
  const [templates] = useState<ScanTemplate[]>(
    propTemplates.length > 0 ? propTemplates : DEFAULT_TEMPLATES
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScanTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ScanTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    scanType: 'standard',
    tools: [],
    parameters: {},
    isDefault: false,
    isFavorite: false,
  });

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort templates: favorites first, then by usage count
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.usageCount - a.usageCount;
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.description) {
      onSaveTemplate(newTemplate as Omit<ScanTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>);
      setCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'custom',
        scanType: 'standard',
        tools: [],
        parameters: {},
        isDefault: false,
        isFavorite: false,
      });
    }
  };

  const handleToggleFavorite = (template: ScanTemplate) => {
    onUpdateTemplate(template.id, { isFavorite: !template.isFavorite });
  };

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'reconnaissance', label: '🔍 Reconnaissance' },
    { value: 'vulnerability', label: '🛡️ Vulnerability' },
    { value: 'web', label: '🌐 Web' },
    { value: 'network', label: '🔌 Network' },
    { value: 'cloud', label: '☁️ Cloud' },
    { value: 'custom', label: '⚙️ Custom' },
  ];

  // Available tools for template creation
  const availableTools = [
    'Nmap', 'Rustscan', 'Masscan', 'Amass', 'Subfinder',
    'Nuclei', 'Gobuster', 'FFuf', 'SQLMap', 'Nikto',
    'Prowler', 'Scout Suite', 'Trivy', 'Checkov',
    'TheHarvester', 'HTTPx', 'Enum4linux',
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          Scan Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Template
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {sortedTemplates.map((template) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: template.isFavorite ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {CATEGORY_ICONS[template.category]} {template.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleFavorite(template)}
                    color={template.isFavorite ? 'warning' : 'default'}
                  >
                    {template.isFavorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label={template.category}
                    size="small"
                    color={CATEGORY_COLORS[template.category]}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip
                    label={template.scanType}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  {template.isDefault && (
                    <Chip label="Default" size="small" color="info" variant="outlined" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {template.estimatedDuration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {template.usageCount} uses
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" display="block">
                  Tools: {template.tools.slice(0, 3).join(', ')}
                  {template.tools.length > 3 && ` +${template.tools.length - 3} more`}
                </Typography>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => setEditingTemplate(template)}
                      disabled={template.isDefault}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <IconButton size="small" onClick={() => onDuplicateTemplate(template)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteTemplate(template.id)}
                      disabled={template.isDefault}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onApplyTemplate(template)}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedTemplates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No templates found
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            Create Your First Template
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || !!editingTemplate}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Scan Template'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Template Name"
                value={editingTemplate?.name || newTemplate.name}
                onChange={(e) =>
                  editingTemplate
                    ? setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    : setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="e.g., Bug Bounty Full Scan"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={editingTemplate?.description || newTemplate.description}
                onChange={(e) =>
                  editingTemplate
                    ? setEditingTemplate({ ...editingTemplate, description: e.target.value })
                    : setNewTemplate({ ...newTemplate, description: e.target.value })
                }
                placeholder="Describe what this template is for..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingTemplate?.category || newTemplate.category}
                  label="Category"
                  onChange={(e) =>
                    editingTemplate
                      ? setEditingTemplate({ ...editingTemplate, category: e.target.value as ScanTemplate['category'] })
                      : setNewTemplate({ ...newTemplate, category: e.target.value as ScanTemplate['category'] })
                  }
                >
                  <MenuItem value="reconnaissance">🔍 Reconnaissance</MenuItem>
                  <MenuItem value="vulnerability">🛡️ Vulnerability</MenuItem>
                  <MenuItem value="web">🌐 Web</MenuItem>
                  <MenuItem value="network">🔌 Network</MenuItem>
                  <MenuItem value="cloud">☁️ Cloud</MenuItem>
                  <MenuItem value="custom">⚙️ Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Scan Type</InputLabel>
                <Select
                  value={editingTemplate?.scanType || newTemplate.scanType}
                  label="Scan Type"
                  onChange={(e) =>
                    editingTemplate
                      ? setEditingTemplate({ ...editingTemplate, scanType: e.target.value as ScanTemplate['scanType'] })
                      : setNewTemplate({ ...newTemplate, scanType: e.target.value as ScanTemplate['scanType'] })
                  }
                >
                  <MenuItem value="quick">⚡ Quick</MenuItem>
                  <MenuItem value="standard">🔍 Standard</MenuItem>
                  <MenuItem value="deep">🔬 Deep</MenuItem>
                  <MenuItem value="custom">⚙️ Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Tools
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTools.map((tool) => {
                  const tools = editingTemplate?.tools || newTemplate.tools || [];
                  const isSelected = tools.includes(tool);
                  return (
                    <Chip
                      key={tool}
                      label={tool}
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => {
                        const newTools = isSelected
                          ? tools.filter((t: string) => t !== tool)
                          : [...tools, tool];
                        if (editingTemplate) {
                          setEditingTemplate({ ...editingTemplate, tools: newTools });
                        } else {
                          setNewTemplate({ ...newTemplate, tools: newTools });
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingTemplate?.isFavorite || newTemplate.isFavorite || false}
                    onChange={(e) =>
                      editingTemplate
                        ? setEditingTemplate({ ...editingTemplate, isFavorite: e.target.checked })
                        : setNewTemplate({ ...newTemplate, isFavorite: e.target.checked })
                    }
                  />
                }
                label="Add to favorites"
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Templates can be customized further when applying them to a new scan.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditingTemplate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={editingTemplate 
              ? () => {
                  onUpdateTemplate(editingTemplate.id, editingTemplate);
                  setEditingTemplate(null);
                }
              : handleCreateTemplate
            }
          >
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanTemplateManager;
