import { Box, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

const ReportsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reports
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Report generation coming soon...
      </Typography>
    </Box>
  );
};

export default ReportsPage;
