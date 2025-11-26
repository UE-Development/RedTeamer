import { Box, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const AgentsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Agents
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Agent interface coming soon...
      </Typography>
    </Box>
  );
};

export default AgentsPage;
