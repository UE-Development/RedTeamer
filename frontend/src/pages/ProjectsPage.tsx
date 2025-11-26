/**
 * Projects Page - Project Management
 * Organize and manage security assessment projects
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BugReportIcon from '@mui/icons-material/BugReport';
import RadarIcon from '@mui/icons-material/Radar';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ProjectStatus, TeamMember } from '../types';

interface Project {
  id: string;
  name: string;
  description: string;
  client?: string;
  status: ProjectStatus;
  progress: number;
  targets: number;
  scans: number;
  vulnerabilities: number;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const DESCRIPTION_TRUNCATE_LENGTH = 120;

// Mock projects data
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Enterprise Pentest 2025',
    description: 'Comprehensive security assessment for ACME Corporation infrastructure including web applications, APIs, and internal network.',
    client: 'ACME Corp',
    status: 'active',
    progress: 65,
    targets: 25,
    scans: 48,
    vulnerabilities: 127,
    members: [
      { id: '1', name: 'Alice Johnson', role: 'Admin', email: 'alice@hexstrike.ai', status: 'online' },
      { id: '2', name: 'Bob Smith', role: 'Pentester', email: 'bob@hexstrike.ai', status: 'online' },
      { id: '3', name: 'Carol Williams', role: 'Analyst', email: 'carol@hexstrike.ai', status: 'away' },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'CTF Competition Nov 2025',
    description: 'Team preparation and challenge tracking for the national CTF competition.',
    status: 'active',
    progress: 80,
    targets: 12,
    scans: 0,
    vulnerabilities: 0,
    members: [
      { id: '4', name: 'Dave Lee', role: 'Team Lead', email: 'dave@hexstrike.ai', status: 'online' },
      { id: '5', name: 'Eve Martinez', role: 'Researcher', email: 'eve@hexstrike.ai', status: 'offline' },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Web App Security Audit',
    description: 'Security audit for the new customer-facing web application before production launch.',
    client: 'TechStartup Inc',
    status: 'active',
    progress: 35,
    targets: 8,
    scans: 15,
    vulnerabilities: 23,
    members: [
      { id: '1', name: 'Alice Johnson', role: 'Admin', email: 'alice@hexstrike.ai', status: 'online' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Q3 Security Assessment',
    description: 'Quarterly security assessment completed successfully.',
    client: 'GlobalFinance Ltd',
    status: 'completed',
    progress: 100,
    targets: 50,
    scans: 120,
    vulnerabilities: 89,
    members: [
      { id: '2', name: 'Bob Smith', role: 'Pentester', email: 'bob@hexstrike.ai', status: 'online' },
      { id: '3', name: 'Carol Williams', role: 'Analyst', email: 'carol@hexstrike.ai', status: 'away' },
    ],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Legacy System Audit 2024',
    description: 'Security audit for legacy systems completed in Q4 2024.',
    client: 'OldCorp Industries',
    status: 'archived',
    progress: 100,
    targets: 15,
    scans: 45,
    vulnerabilities: 67,
    members: [],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client: '',
  });

  const filterProjects = (status: ProjectStatus | 'all') => {
    let filtered = projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }

    return filtered;
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name: newProject.name,
      description: newProject.description,
      client: newProject.client || undefined,
      status: 'active',
      progress: 0,
      targets: 0,
      scans: 0,
      vulnerabilities: 0,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [project, ...prev]);
    setNewProject({ name: '', description: '', client: '' });
    setCreateDialogOpen(false);
  };

  const handleArchiveProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: 'archived' as ProjectStatus, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const activeProjects = filterProjects('active');
  const completedProjects = filterProjects('completed');
  const archivedProjects = filterProjects('archived');

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {project.name}
            </Typography>
          </Box>
          <Chip
            label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            size="small"
            color={getStatusColor(project.status)}
          />
        </Box>

        {project.client && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Client: {project.client}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {project.description.length > DESCRIPTION_TRUNCATE_LENGTH 
            ? `${project.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...` 
            : project.description}
        </Typography>

        {project.status !== 'archived' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="primary">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Stats */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <GpsFixedIcon fontSize="small" color="info" />
              <Typography variant="caption" display="block">
                {project.targets} Targets
              </Typography>
            </Box>
          </Grid>
          <Grid size={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <RadarIcon fontSize="small" color="primary" />
              <Typography variant="caption" display="block">
                {project.scans} Scans
              </Typography>
            </Box>
          </Grid>
          <Grid size={4}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <BugReportIcon fontSize="small" color="error" />
              <Typography variant="caption" display="block">
                {project.vulnerabilities} Vulns
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Team Members */}
        {project.members.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize="small" color="action" />
            <Box sx={{ display: 'flex' }}>
              {project.members.slice(0, 3).map((member, index) => (
                <Tooltip key={member.id} title={`${member.name} (${member.role})`}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor:
                          member.status === 'online'
                            ? 'success.main'
                            : member.status === 'away'
                              ? 'warning.main'
                              : 'grey.500',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: 12,
                        marginLeft: index > 0 ? -1 : 0,
                        border: '2px solid',
                        borderColor: 'background.paper',
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </Tooltip>
              ))}
              {project.members.length > 3 && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    marginLeft: -1,
                    bgcolor: 'grey.600',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  +{project.members.length - 3}
                </Avatar>
              )}
            </Box>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
          Last updated: {getTimeAgo(project.updatedAt)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" startIcon={<OpenInNewIcon />} variant="contained">
          Open
        </Button>
        <Box>
          <Tooltip title="Settings">
            <IconButton size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          {project.status !== 'archived' && (
            <Tooltip title="Archive">
              <IconButton size="small" onClick={() => handleArchiveProject(project.id)}>
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteProject(project.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Projects
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          New Project
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects by name, description, or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Active
                <Chip label={activeProjects.length} size="small" color="success" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Completed
                <Chip label={completedProjects.length} size="small" color="info" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Archived
                <Chip label={archivedProjects.length} size="small" />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {tabValue === 0 &&
          activeProjects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        {tabValue === 1 &&
          completedProjects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        {tabValue === 2 &&
          archivedProjects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
      </Grid>

      {/* Empty State */}
      {((tabValue === 0 && activeProjects.length === 0) ||
        (tabValue === 1 && completedProjects.length === 0) ||
        (tabValue === 2 && archivedProjects.length === 0)) && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {tabValue === 0
              ? 'Create your first project to get started!'
              : tabValue === 1
                ? 'No completed projects yet.'
                : 'No archived projects.'}
          </Typography>
          {tabValue === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create Project
            </Button>
          )}
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Client (Optional)"
            fullWidth
            variant="outlined"
            value={newProject.client}
            onChange={(e) => setNewProject((prev) => ({ ...prev, client: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={!newProject.name.trim()}>
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
