/**
 * Tool Update Notifications Component
 * Sprint 5: Add tool update notifications
 * Displays notifications for available tool updates
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Popover,
  Divider,
  LinearProgress,
  Alert,
  Link,
} from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

export interface ToolUpdate {
  id: string;
  toolName: string;
  currentVersion: string;
  newVersion: string;
  releaseDate: string;
  updateType: 'security' | 'feature' | 'bugfix' | 'major';
  severity: 'critical' | 'high' | 'medium' | 'low';
  changelog?: string;
  downloadUrl?: string;
  isInstalling?: boolean;
  isInstalled?: boolean;
}

interface ToolUpdateNotificationsProps {
  updates: ToolUpdate[];
  onUpdateTool: (toolId: string) => Promise<void>;
  onUpdateAll: () => Promise<void>;
  onDismiss: (toolId: string) => void;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

// Mock updates for demonstration
const MOCK_UPDATES: ToolUpdate[] = [
  {
    id: 'nmap-update',
    toolName: 'Nmap',
    currentVersion: '7.93',
    newVersion: '7.94',
    releaseDate: '2024-01-15',
    updateType: 'security',
    severity: 'high',
    changelog: 'Security fix for NSE script vulnerabilities. New service detection signatures.',
  },
  {
    id: 'nuclei-update',
    toolName: 'Nuclei',
    currentVersion: '3.0.0',
    newVersion: '3.1.4',
    releaseDate: '2024-01-20',
    updateType: 'feature',
    severity: 'medium',
    changelog: 'Added 500+ new templates. Improved JavaScript execution. Better rate limiting.',
  },
  {
    id: 'sqlmap-update',
    toolName: 'SQLMap',
    currentVersion: '1.7.10',
    newVersion: '1.7.12',
    releaseDate: '2024-01-18',
    updateType: 'bugfix',
    severity: 'low',
    changelog: 'Fixed false positive issues. Improved tamper script handling.',
  },
  {
    id: 'gobuster-update',
    toolName: 'Gobuster',
    currentVersion: '3.5.0',
    newVersion: '3.6.0',
    releaseDate: '2024-01-10',
    updateType: 'major',
    severity: 'medium',
    changelog: 'New fuzzing mode added. Performance improvements. Enhanced DNS enumeration.',
  },
];

const UPDATE_TYPE_ICONS: Record<string, React.ReactNode> = {
  security: <SecurityIcon color="error" />,
  feature: <NewReleasesIcon color="primary" />,
  bugfix: <CheckCircleIcon color="success" />,
  major: <SystemUpdateAltIcon color="warning" />,
};

const UPDATE_TYPE_COLORS: Record<string, 'error' | 'primary' | 'success' | 'warning'> = {
  security: 'error',
  feature: 'primary',
  bugfix: 'success',
  major: 'warning',
};

const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const ToolUpdateNotifications = ({
  updates: propUpdates = [],
  onUpdateTool,
  onUpdateAll,
  onDismiss,
  onRefresh,
  isLoading = false,
}: ToolUpdateNotificationsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [updates, setUpdates] = useState<ToolUpdate[]>(
    propUpdates.length > 0 ? propUpdates : MOCK_UPDATES
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  const open = Boolean(anchorEl);

  // Count updates by severity
  const updateCounts = useMemo(() => {
    return updates.reduce(
      (acc, update) => {
        if (!update.isInstalled) {
          acc.total++;
          if (update.updateType === 'security') acc.security++;
          if (update.severity === 'critical' || update.severity === 'high') acc.critical++;
        }
        return acc;
      },
      { total: 0, security: 0, critical: 0 }
    );
  }, [updates]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateTool = async (toolId: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === toolId ? { ...u, isInstalling: true } : u))
    );
    try {
      await onUpdateTool(toolId);
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === toolId ? { ...u, isInstalling: false, isInstalled: true } : u
        )
      );
    } catch {
      setUpdates((prev) =>
        prev.map((u) => (u.id === toolId ? { ...u, isInstalling: false } : u))
      );
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    try {
      await onUpdateAll();
      setUpdates((prev) =>
        prev.map((u) => ({ ...u, isInstalled: true }))
      );
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleDismiss = (toolId: string) => {
    onDismiss(toolId);
    setUpdates((prev) => prev.filter((u) => u.id !== toolId));
  };

  const pendingUpdates = updates.filter((u) => !u.isInstalled);

  return (
    <>
      {/* Notification Badge Button */}
      <Tooltip title={`${updateCounts.total} tool updates available`}>
        <IconButton
          onClick={handleClick}
          color={updateCounts.security > 0 ? 'error' : updateCounts.total > 0 ? 'primary' : 'default'}
        >
          <Badge
            badgeContent={updateCounts.total}
            color={updateCounts.critical > 0 ? 'error' : 'primary'}
            max={99}
          >
            <SystemUpdateAltIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Popover with Update List */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 400, maxHeight: 500, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SystemUpdateAltIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tool Updates
              </Typography>
              {updateCounts.total > 0 && (
                <Chip
                  label={`${updateCounts.total} available`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
            <Box>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {isLoading || isRefreshing ? (
            <LinearProgress />
          ) : null}

          {/* Security Alert */}
          {updateCounts.security > 0 && (
            <Alert severity="error" sx={{ m: 1, py: 0.5 }}>
              {updateCounts.security} security update{updateCounts.security > 1 ? 's' : ''} available!
            </Alert>
          )}

          {/* Update List */}
          <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
            {pendingUpdates.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  All tools are up to date!
                </Typography>
              </Box>
            ) : (
              <List dense>
                {pendingUpdates.map((update, index) => (
                  <Box key={update.id}>
                    <ListItem
                      sx={{
                        opacity: update.isInstalled ? 0.5 : 1,
                        bgcolor: update.updateType === 'security' ? 'error.dark' : 'transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {UPDATE_TYPE_ICONS[update.updateType]}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {update.toolName}
                            </Typography>
                            <Chip
                              label={update.updateType}
                              size="small"
                              color={UPDATE_TYPE_COLORS[update.updateType]}
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {update.currentVersion} → {update.newVersion}
                            </Typography>
                            {update.changelog && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {update.changelog}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {update.isInstalling ? (
                          <Box sx={{ width: 60 }}>
                            <LinearProgress />
                          </Box>
                        ) : update.isInstalled ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Update now">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleUpdateTool(update.id)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dismiss">
                              <IconButton
                                size="small"
                                onClick={() => handleDismiss(update.id)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < pendingUpdates.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {/* Footer Actions */}
          {pendingUpdates.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.default',
              }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  // Open changelog/release notes
                }}
              >
                <InfoIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                View all changelogs
              </Link>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleUpdateAll}
                disabled={isUpdatingAll}
              >
                {isUpdatingAll ? 'Updating...' : 'Update All'}
              </Button>
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  );
};

// Standalone notification panel component
export const ToolUpdatePanel = ({
  updates: propUpdates = [],
  onUpdateTool,
  onUpdateAll,
  onDismiss,
  onRefresh,
  isLoading = false,
}: ToolUpdateNotificationsProps) => {
  const [updates, setUpdates] = useState<ToolUpdate[]>(
    propUpdates.length > 0 ? propUpdates : MOCK_UPDATES
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateTool = async (toolId: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === toolId ? { ...u, isInstalling: true } : u))
    );
    try {
      await onUpdateTool(toolId);
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === toolId ? { ...u, isInstalling: false, isInstalled: true } : u
        )
      );
    } catch {
      setUpdates((prev) =>
        prev.map((u) => (u.id === toolId ? { ...u, isInstalling: false } : u))
      );
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    try {
      await onUpdateAll();
      setUpdates((prev) =>
        prev.map((u) => ({ ...u, isInstalled: true }))
      );
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleDismiss = (toolId: string) => {
    onDismiss(toolId);
    setUpdates((prev) => prev.filter((u) => u.id !== toolId));
  };

  const pendingUpdates = updates.filter((u) => !u.isInstalled);
  const securityUpdates = pendingUpdates.filter((u) => u.updateType === 'security');

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SystemUpdateAltIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tool Updates
          </Typography>
          {pendingUpdates.length > 0 && (
            <Chip
              label={`${pendingUpdates.length} available`}
              size="small"
              color="primary"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          {pendingUpdates.length > 0 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleUpdateAll}
              disabled={isUpdatingAll}
            >
              Update All
            </Button>
          )}
        </Box>
      </Box>

      {isLoading || isRefreshing ? <LinearProgress sx={{ mb: 2 }} /> : null}

      {/* Security Warning */}
      {securityUpdates.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              <strong>{securityUpdates.length} security update{securityUpdates.length > 1 ? 's' : ''} available!</strong> Install immediately to protect your system.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Update Cards */}
      {pendingUpdates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            All tools are up to date!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pendingUpdates.map((update) => (
            <Paper
              key={update.id}
              variant="outlined"
              sx={{
                p: 2,
                borderColor: update.updateType === 'security' ? 'error.main' : 'divider',
                borderWidth: update.updateType === 'security' ? 2 : 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ pt: 0.5 }}>
                    {UPDATE_TYPE_ICONS[update.updateType]}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {update.toolName}
                      </Typography>
                      <Chip
                        label={update.updateType}
                        size="small"
                        color={UPDATE_TYPE_COLORS[update.updateType]}
                      />
                      <Chip
                        label={update.severity}
                        size="small"
                        color={SEVERITY_COLORS[update.severity]}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {update.currentVersion} → <strong>{update.newVersion}</strong>
                    </Typography>
                    {update.changelog && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {update.changelog}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Released: {update.releaseDate}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {update.isInstalling ? (
                    <Box sx={{ width: 100 }}>
                      <LinearProgress />
                      <Typography variant="caption" color="text.secondary">
                        Installing...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color={update.updateType === 'security' ? 'error' : 'primary'}
                        startIcon={<DownloadIcon />}
                        onClick={() => handleUpdateTool(update.id)}
                      >
                        Update
                      </Button>
                      <IconButton size="small" onClick={() => handleDismiss(update.id)}>
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ToolUpdateNotifications;
