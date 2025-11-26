import { Box, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

const ProjectsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Projects
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Project management coming soon...
      </Typography>
    </Box>
  );
};

export default ProjectsPage;
