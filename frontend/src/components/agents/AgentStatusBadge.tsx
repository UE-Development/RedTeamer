/**
 * Agent Status Badge Component
 * Displays agent status with color-coded indicators
 */

import { Chip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { AgentStatus } from '../../types';

interface AgentStatusBadgeProps {
  status: AgentStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<AgentStatus, { color: 'success' | 'warning' | 'primary' | 'error'; label: string }> = {
  active: { color: 'success', label: 'Active' },
  standby: { color: 'warning', label: 'Standby' },
  busy: { color: 'primary', label: 'Busy' },
  error: { color: 'error', label: 'Error' },
};

const AgentStatusBadge = ({ status, size = 'small' }: AgentStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Chip
      icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
      label={config.label}
      size={size}
      color={config.color}
      variant="outlined"
      sx={{
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
    />
  );
};

export default AgentStatusBadge;
