/**
 * Command Input Component
 * Text input with auto-completion for agent commands
 */

import { useState, useRef, useMemo, type KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Fade,
  Typography,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TerminalIcon from '@mui/icons-material/Terminal';

interface CommandInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
}

// Default command suggestions
const defaultSuggestions = [
  'Scan example.com for vulnerabilities',
  'Run nmap port scan on target',
  'Enumerate subdomains for domain',
  'Check for SQL injection vulnerabilities',
  'Test for XSS vulnerabilities',
  'Run nuclei scan on target',
  'Analyze web application security',
  'Generate security report',
  'Check CVE database for vulnerabilities',
  'Run OSINT reconnaissance',
  'Test authentication mechanisms',
  'Scan for cloud misconfigurations',
];

const CommandInput = ({
  onSend,
  disabled = false,
  placeholder = 'Type your command or question...',
  suggestions = defaultSuggestions,
}: CommandInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute filtered suggestions using useMemo
  const filteredSuggestions = useMemo(() => {
    if (inputValue.length >= 2) {
      return suggestions
        .filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5);
    }
    return [];
  }, [inputValue, suggestions]);

  // Compute popper width
  const popperWidth = anchorElement?.clientWidth;

  // Determine if suggestions should be visible
  const shouldShowSuggestions = showSuggestions && filteredSuggestions.length > 0;

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        setInputValue(filteredSuggestions[selectedIndex]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } else {
        handleSend();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Tab' && shouldShowSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      // If no selection made, default to first suggestion
      const indexToUse = selectedIndex >= 0 ? selectedIndex : 0;
      setInputValue(filteredSuggestions[indexToUse]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <Box ref={setAnchorElement} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.95rem',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <TerminalIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={disabled || !inputValue.trim()}
                  color="primary"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Popper
        open={shouldShowSuggestions}
        anchorEl={anchorElement}
        placement="top-start"
        transition
        style={{ width: popperWidth, zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                mb: 1,
                maxHeight: 250,
                overflow: 'auto',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', bgcolor: 'action.hover' }}
              >
                💡 Suggestions (Tab to autocomplete)
              </Typography>
              <List dense disablePadding>
                {filteredSuggestions.map((suggestion, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      selected={index === selectedIndex}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        py: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <ListItemText
                        primary={suggestion}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontFamily: "'JetBrains Mono', monospace" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default CommandInput;
