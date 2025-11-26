import { Box, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

const ToolsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Security Tools
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Tool library coming soon...
      </Typography>
    </Box>
  );
};

export default ToolsPage;
