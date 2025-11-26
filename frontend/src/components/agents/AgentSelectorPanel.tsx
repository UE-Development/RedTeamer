/**
 * Agent Selector Panel Component
 * Displays available AI agents with status and quick actions
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BugReportIcon from '@mui/icons-material/BugReport';
import FlagIcon from '@mui/icons-material/Flag';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import LockIcon from '@mui/icons-material/Lock';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CloudIcon from '@mui/icons-material/Cloud';
import MemoryIcon from '@mui/icons-material/Memory';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import RouterIcon from '@mui/icons-material/Router';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import type { Agent, AgentType } from '../../types';
import AgentStatusBadge from './AgentStatusBadge';

interface AgentSelectorPanelProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onToggleAgent?: (agent: Agent) => void;
}

// Icon mapping for each agent type
const agentIcons: Record<AgentType, React.ReactNode> = {
  bugbounty: <BugReportIcon />,
  ctf: <FlagIcon />,
  cve_intelligence: <SecurityIcon />,
  exploit_generator: <CodeIcon />,
  web_security: <LanguageIcon />,
  auth_testing: <LockIcon />,
  mobile_security: <PhoneAndroidIcon />,
  cloud_security: <CloudIcon />,
  binary_analysis: <MemoryIcon />,
  osint: <PersonSearchIcon />,
  network_recon: <RouterIcon />,
  report_generator: <AssessmentIcon />,
};

const AgentSelectorPanel = ({
  agents,
  selectedAgent,
  onSelectAgent,
  onToggleAgent,
}: AgentSelectorPanelProps) => {
  const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'busy');
  const standbyAgents = agents.filter((a) => a.status === 'standby');
  const errorAgents = agents.filter((a) => a.status === 'error');

  const renderAgentItem = (agent: Agent) => {
    const isSelected = selectedAgent?.id === agent.id;

    return (
      <ListItem
        key={agent.id}
        disablePadding
        secondaryAction={
          onToggleAgent && (
            <Tooltip title={agent.status === 'active' || agent.status === 'busy' ? 'Deactivate' : 'Activate'}>
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAgent(agent);
                }}
                sx={{
                  color: agent.status === 'active' || agent.status === 'busy' ? 'error.main' : 'success.main',
                }}
              >
                {agent.status === 'active' || agent.status === 'busy' ? (
                  <StopIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )
        }
      >
        <ListItemButton
          selected={isSelected}
          onClick={() => onSelectAgent(agent)}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: 'primary.dark',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isSelected ? 'primary.light' : 'text.secondary',
            }}
          >
            {agentIcons[agent.type] || <SmartToyIcon />}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.light' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                  }}
                >
                  {agent.name}
                </Typography>
              </Box>
            }
            secondary={
              <AgentStatusBadge status={agent.status} size="small" />
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          AI Agents ({agents.length})
        </Typography>
      </CardContent>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1, pb: 2 }}>
        {activeAgents.length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{ px: 2, py: 1, display: 'block', color: 'success.main', fontWeight: 600 }}
            >
              🟢 ACTIVE ({activeAgents.length})
            </Typography>
            <List dense disablePadding>
              {activeAgents.map(renderAgentItem)}
            </List>
          </>
        )}

        {standbyAgents.length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{ px: 2, py: 1, display: 'block', color: 'warning.main', fontWeight: 600, mt: 1 }}
            >
              🟡 STANDBY ({standbyAgents.length})
            </Typography>
            <List dense disablePadding>
              {standbyAgents.map(renderAgentItem)}
            </List>
          </>
        )}

        {errorAgents.length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{ px: 2, py: 1, display: 'block', color: 'error.main', fontWeight: 600, mt: 1 }}
            >
              🔴 ERROR ({errorAgents.length})
            </Typography>
            <List dense disablePadding>
              {errorAgents.map(renderAgentItem)}
            </List>
          </>
        )}

        {agents.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No agents available
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default AgentSelectorPanel;
