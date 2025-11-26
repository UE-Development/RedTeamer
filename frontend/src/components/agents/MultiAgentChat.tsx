/**
 * Multi-Agent Chat Component
 * Enables simultaneous communication with multiple AI agents
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import type { Agent, AgentMessage, AgentStatus } from '../../types';
import CommandInput from './CommandInput';

interface AgentChat {
  agent: Agent;
  messages: AgentMessage[];
  unreadCount: number;
}

interface MultiAgentChatProps {
  activeChats: AgentChat[];
  onSendMessage: (agentId: string, message: string) => void;
  onRemoveChat: (agentId: string) => void;
  onBroadcastMessage?: (message: string, agentIds: string[]) => void;
  loading?: boolean;
}

// Status to chip color mapping
const statusColorMap: Record<AgentStatus, 'success' | 'primary' | 'warning' | 'error'> = {
  active: 'success',
  busy: 'primary',
  standby: 'warning',
  error: 'error',
};

const MultiAgentChat = ({
  activeChats,
  onSendMessage,
  onRemoveChat,
  onBroadcastMessage,
  loading = false,
}: MultiAgentChatProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [broadcastMode, setBroadcastMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChats]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = (message: string) => {
    if (broadcastMode && onBroadcastMessage) {
      // Send to all active chats
      const agentIds = activeChats.map((chat) => chat.agent.id);
      onBroadcastMessage(message, agentIds);
    } else if (activeChats[selectedTab]) {
      // Send to selected agent
      onSendMessage(activeChats[selectedTab].agent.id, message);
    }
  };

  const currentChat = activeChats[selectedTab];

  const renderMessage = (message: AgentMessage) => {
    const isUser = message.isUser;

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          gap: 1.5,
          mb: 2,
          alignItems: 'flex-start',
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'success.main',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>

        <Box
          sx={{
            maxWidth: '75%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: isUser ? 'primary.light' : 'success.main' }}
            >
              {isUser ? 'You' : message.agentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(message.timestamp)}
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.dark' : 'background.default',
              borderRadius: 2,
              borderTopRightRadius: isUser ? 0 : 2,
              borderTopLeftRadius: isUser ? 2 : 0,
              border: '1px solid',
              borderColor: isUser ? 'primary.main' : 'divider',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.6,
              }}
            >
              {message.content}
            </Typography>

            {/* Progress indicator for agent messages */}
            {!isUser && message.metadata?.progress !== undefined && message.metadata.progress < 100 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {message.metadata.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={message.metadata.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                  }}
                />
              </Box>
            )}

            {/* Tools used indicator */}
            {!isUser && message.metadata?.toolsUsed && message.metadata.toolsUsed.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <BuildIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                {message.metadata.toolsUsed.map((tool, index) => (
                  <Chip
                    key={index}
                    label={tool}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header with Tabs */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <GroupIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Multi-Agent Chat
          </Typography>
          <Tooltip title={broadcastMode ? 'Broadcast Mode ON' : 'Broadcast Mode OFF'}>
            <Chip
              label={broadcastMode ? 'BROADCAST' : 'SINGLE'}
              size="small"
              color={broadcastMode ? 'warning' : 'default'}
              onClick={() => setBroadcastMode(!broadcastMode)}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        </Box>

        {activeChats.length > 0 && (
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
              },
            }}
          >
            {activeChats.map((chat, index) => (
              <Tab
                key={chat.agent.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={chat.unreadCount} color="error" max={99}>
                      <SmartToyIcon fontSize="small" />
                    </Badge>
                    <span>{chat.agent.name}</span>
                    <Chip
                      label={chat.agent.status}
                      size="small"
                      color={statusColorMap[chat.agent.status]}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveChat(chat.agent.id);
                        if (selectedTab >= activeChats.length - 1) {
                          setSelectedTab(Math.max(0, activeChats.length - 2));
                        }
                      }}
                      sx={{ ml: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                value={index}
              />
            ))}
            <Tab
              icon={<AddIcon />}
              onClick={(e) => {
                e.preventDefault();
                // This would typically open an agent selection dialog
              }}
              sx={{ minWidth: 48 }}
            />
          </Tabs>
        )}
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        {activeChats.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <GroupIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Multi-Agent Chat
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
              Add agents to start simultaneous conversations. Enable broadcast mode to send messages to all
              agents at once.
            </Typography>
          </Box>
        ) : currentChat ? (
          <>
            {currentChat.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        ) : null}
      </Box>

      {/* Broadcast Info */}
      {broadcastMode && activeChats.length > 0 && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'warning.dark' }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize="small" />
            Broadcast mode: Messages will be sent to all {activeChats.length} active agents
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <CommandInput
          onSend={handleSendMessage}
          disabled={activeChats.length === 0 || loading}
          placeholder={
            broadcastMode
              ? `Broadcast to ${activeChats.length} agents...`
              : currentChat
                ? `Message ${currentChat.agent.name}...`
                : 'Add an agent to start chatting...'
          }
        />
      </Box>
    </Paper>
  );
};

export default MultiAgentChat;
