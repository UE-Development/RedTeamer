import { Box, Typography } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

const VulnerabilitiesPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Vulnerabilities
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Vulnerability management coming soon...
      </Typography>
    </Box>
  );
};

export default VulnerabilitiesPage;
