/**
 * Top Navigation Bar
 */

import { AppBar, Toolbar, IconButton, Typography, Box, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAppSelector } from '../../store';

interface TopBarProps {
  onMenuClick: () => void;
  drawerWidth: number;
  open: boolean;
}

const TopBar = ({ onMenuClick, drawerWidth, open }: TopBarProps) => {
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const unreadCount = notifications.length;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { sm: open ? `${drawerWidth}px` : 0 },
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 0, fontWeight: 700, fontFamily: "'Roboto', sans-serif" }}
        >
          HexStrike AI
        </Typography>

        <Typography
          variant="body2"
          sx={{
            ml: 2,
            color: 'primary.light',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          v6.0
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
