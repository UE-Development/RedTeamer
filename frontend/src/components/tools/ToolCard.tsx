/**
 * Tool Card Component
 * Displays individual security tool information
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Rating,
  Tooltip,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InfoIcon from '@mui/icons-material/Info';
import type { Tool } from '../../types';

interface ToolCardProps {
  tool: Tool;
  onLaunch: (tool: Tool) => void;
  onConfigure?: (tool: Tool) => void;
  onToggleFavorite?: (tool: Tool) => void;
  isFavorite?: boolean;
}

const ToolCard = ({ tool, onLaunch, onConfigure, onToggleFavorite, isFavorite }: ToolCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      network: 'primary',
      web: 'secondary',
      binary: 'info',
      cloud: 'success',
      ctf: 'warning',
      osint: 'error',
    };
    return colors[category] || 'default';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}20`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {tool.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              v{tool.version}
            </Typography>
          </Box>
          {onToggleFavorite && (
            <IconButton
              size="small"
              onClick={() => onToggleFavorite(tool)}
              sx={{ color: isFavorite ? 'error.main' : 'text.secondary' }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, flexGrow: 1, minHeight: '40px' }}
        >
          {tool.description}
        </Typography>

        {/* Category Chip */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={tool.category}
            size="small"
            color={getCategoryColor(tool.category) as any}
            sx={{ textTransform: 'capitalize' }}
          />
          {!tool.installed && (
            <Chip
              label="Not Installed"
              size="small"
              color="warning"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={5} readOnly size="small" sx={{ mr: 0.5 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Used {tool.usageCount} times
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={() => onLaunch(tool)}
            disabled={!tool.installed}
            fullWidth
          >
            Launch
          </Button>
          {onConfigure && (
            <Tooltip title="Configure">
              <IconButton
                size="small"
                onClick={() => onConfigure(tool)}
                disabled={!tool.installed}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Tool Info">
            <IconButton
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
