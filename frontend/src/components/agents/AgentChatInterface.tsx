/**
 * Agent Chat Interface Component
 * Displays conversation with AI agents in a chat-like interface
 */

import { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import type { AgentMessage, Agent, AgentStatus } from '../../types';
import CommandInput from './CommandInput';

interface AgentChatInterfaceProps {
  messages: AgentMessage[];
  selectedAgent: Agent | null;
  onSendMessage: (message: string) => void;
  loading?: boolean;
}

// Status to chip color mapping
const statusColorMap: Record<AgentStatus, 'success' | 'primary' | 'warning' | 'error'> = {
  active: 'success',
  busy: 'primary',
  standby: 'warning',
  error: 'error',
};

const AgentChatInterface = ({
  messages,
  selectedAgent,
  onSendMessage,
  loading = false,
}: AgentChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            <Typography variant="caption" sx={{ fontWeight: 600, color: isUser ? 'primary.light' : 'success.main' }}>
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
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedAgent ? selectedAgent.name : 'Agent Console'}
          </Typography>
          {selectedAgent && (
            <Chip
              label={selectedAgent.status.toUpperCase()}
              size="small"
              color={statusColorMap[selectedAgent.status]}
            />
          )}
        </Box>
        {loading && <CircularProgress size={24} />}
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
        {messages.length === 0 ? (
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
            <SmartToyIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Select an Agent'}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
              {selectedAgent
                ? 'Send a command or ask a question to start the conversation.'
                : 'Choose an AI agent from the panel to start a security assessment conversation.'}
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <CommandInput
          onSend={onSendMessage}
          disabled={!selectedAgent || loading}
          placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Select an agent to start chatting...'}
        />
      </Box>
    </Paper>
  );
};

export default AgentChatInterface;
