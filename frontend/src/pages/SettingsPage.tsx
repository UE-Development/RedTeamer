import { Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Settings panel coming soon...
      </Typography>
    </Box>
  );
};

export default SettingsPage;
