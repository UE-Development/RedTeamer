/**
 * Log Streaming Viewer Component
 * Sprint 6: Build log streaming viewer with filtering
 * Real-time log output with search and filtering capabilities
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import TerminalIcon from '@mui/icons-material/Terminal';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug' | 'success';
  source: string;
  message: string;
}

interface LogStreamingViewerProps {
  logs: LogEntry[];
  title?: string;
  maxHeight?: number | string;
  onClear?: () => void;
}

const LOG_LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  info: { bg: 'rgba(33, 150, 243, 0.1)', text: '#2196f3' },
  warning: { bg: 'rgba(255, 152, 0, 0.1)', text: '#ff9800' },
  error: { bg: 'rgba(244, 67, 54, 0.1)', text: '#f44336' },
  debug: { bg: 'rgba(158, 158, 158, 0.1)', text: '#9e9e9e' },
  success: { bg: 'rgba(76, 175, 80, 0.1)', text: '#4caf50' },
};

const LogStreamingViewer = ({
  logs,
  title = 'Log Output',
  maxHeight = 400,
  onClear,
}: LogStreamingViewerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Get unique sources from logs
  const sources = Array.from(new Set(logs.map((log) => log.source)));

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSource = selectedSource === 'all' || log.source === selectedSource;
    return matchesSearch && matchesLevel && matchesSource;
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && !isPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isPaused]);

  const handleDownload = () => {
    const logContent = filteredLogs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  const getLevelIcon = (level: string): string => {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
      success: '✅',
    };
    return icons[level] || 'ℹ️';
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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
          <TerminalIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={`${filteredLogs.length} entries`}
            size="small"
            variant="outlined"
          />
          {isPaused && (
            <Chip label="Paused" color="warning" size="small" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
            <IconButton
              size="small"
              onClick={() => setIsPaused(!isPaused)}
              color={isPaused ? 'warning' : 'default'}
            >
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Logs">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          {onClear && (
            <Tooltip title="Clear Logs">
              <IconButton size="small" onClick={onClear}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <TextField
          size="small"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select
            value={selectedLevel}
            label="Level"
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="debug">Debug</MenuItem>
            <MenuItem value="success">Success</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={selectedSource}
            label="Source"
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <MenuItem value="all">All Sources</MenuItem>
            {sources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Log Content */}
      <Box
        ref={logContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: '#0a0a0a',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.8rem',
          maxHeight: maxHeight,
          minHeight: 200,
          position: 'relative',
        }}
      >
        {filteredLogs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              {logs.length === 0 ? 'No logs yet...' : 'No matching logs found'}
            </Typography>
          </Box>
        ) : (
          filteredLogs.map((log, index) => (
            <Box
              key={log.id || index}
              sx={{
                display: 'flex',
                p: 0.75,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                bgcolor: LOG_LEVEL_COLORS[log.level]?.bg || 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: 'text.secondary',
                  minWidth: 180,
                  fontSize: 'inherit',
                }}
              >
                {log.timestamp}
              </Typography>
              <Typography
                component="span"
                sx={{
                  minWidth: 24,
                  textAlign: 'center',
                }}
              >
                {getLevelIcon(log.level)}
              </Typography>
              <Chip
                label={log.level.toUpperCase()}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  minWidth: 60,
                  bgcolor: LOG_LEVEL_COLORS[log.level]?.bg,
                  color: LOG_LEVEL_COLORS[log.level]?.text,
                  border: `1px solid ${LOG_LEVEL_COLORS[log.level]?.text}`,
                  mx: 1,
                }}
              />
              <Typography
                component="span"
                sx={{
                  color: 'primary.light',
                  minWidth: 100,
                  fontSize: 'inherit',
                }}
              >
                [{log.source}]
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: 'text.primary',
                  flex: 1,
                  ml: 1,
                  wordBreak: 'break-word',
                  fontSize: 'inherit',
                }}
              >
                {log.message}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Footer with scroll button */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Showing {filteredLogs.length} of {logs.length} entries
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel('all');
              setSelectedSource('all');
            }}
            disabled={searchQuery === '' && selectedLevel === 'all' && selectedSource === 'all'}
          >
            Clear Filters
          </Button>
          <Button
            size="small"
            startIcon={<KeyboardArrowDownIcon />}
            onClick={handleScrollToBottom}
          >
            Scroll to Bottom
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default LogStreamingViewer;
