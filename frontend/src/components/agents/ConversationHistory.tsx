/**
 * Conversation History Component
 * Shows searchable history of agent conversations
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Collapse,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AgentMessage } from '../../types';

interface ConversationHistoryProps {
  messages: AgentMessage[];
  onSelectConversation?: (messages: AgentMessage[]) => void;
  onClearHistory?: () => void;
}

interface ConversationGroup {
  agentId: string;
  agentName: string;
  messages: AgentMessage[];
  lastMessageTime: string;
}

const ConversationHistory = ({
  messages,
  onSelectConversation,
  onClearHistory,
}: ConversationHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  // Group messages by agent and filter by search
  const conversationGroups = useMemo(() => {
    const groups: Record<string, ConversationGroup> = {};

    messages.forEach((message) => {
      if (!groups[message.agentId]) {
        groups[message.agentId] = {
          agentId: message.agentId,
          agentName: message.agentName,
          messages: [],
          lastMessageTime: message.timestamp,
        };
      }
      groups[message.agentId].messages.push(message);
      // Update last message time if this message is more recent
      if (new Date(message.timestamp) > new Date(groups[message.agentId].lastMessageTime)) {
        groups[message.agentId].lastMessageTime = message.timestamp;
      }
    });

    // Filter by search query
    const filteredGroups = Object.values(groups).filter((group) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        group.agentName.toLowerCase().includes(query) ||
        group.messages.some((msg) => msg.content.toLowerCase().includes(query))
      );
    });

    // Sort by last message time (most recent first)
    return filteredGroups.sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [messages, searchQuery]);

  // Filter messages within groups by search query
  const getFilteredMessages = (group: ConversationGroup) => {
    if (!searchQuery) return group.messages;
    const query = searchQuery.toLowerCase();
    return group.messages.filter((msg) => msg.content.toLowerCase().includes(query));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const toggleAgentExpanded = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Box
          key={index}
          component="span"
          sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', px: 0.5, borderRadius: 0.5 }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Conversation History
          </Typography>
          <Chip label={messages.length} size="small" color="primary" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onClearHistory && messages.length > 0 && (
            <Tooltip title="Clear History">
              <IconButton size="small" color="error" onClick={onClearHistory}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Conversation List */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
          {conversationGroups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <HistoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">
                {searchQuery ? 'No conversations match your search' : 'No conversation history yet'}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {conversationGroups.map((group) => (
                <Box key={group.agentId}>
                  <ListItemButton
                    onClick={() => toggleAgentExpanded(group.agentId)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <ListItemIcon>
                      <SmartToyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {group.agentName}
                          </Typography>
                          <Chip
                            label={`${group.messages.length} messages`}
                            size="small"
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={formatTime(group.lastMessageTime)}
                    />
                    {expandedAgents.has(group.agentId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  <Collapse in={expandedAgents.has(group.agentId)}>
                    <List dense sx={{ pl: 2 }}>
                      {getFilteredMessages(group)
                        .slice(-10)
                        .reverse()
                        .map((message) => (
                          <ListItemButton
                            key={message.id}
                            onClick={() => onSelectConversation?.([message])}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              py: 1,
                              borderLeft: '3px solid',
                              borderColor: message.isUser ? 'primary.main' : 'success.main',
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {message.isUser ? (
                                <PersonIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <SmartToyIcon sx={{ fontSize: 18 }} color="success" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {highlightText(truncateText(message.content), searchQuery)}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(message.timestamp)}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        ))}
                    </List>
                  </Collapse>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ConversationHistory;
