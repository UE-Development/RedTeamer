import { Box, Typography } from '@mui/material';
import RadarIcon from '@mui/icons-material/Radar';

const ScansPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <RadarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Security Scans
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Scan management coming soon...
      </Typography>
    </Box>
  );
};

export default ScansPage;
