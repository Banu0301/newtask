import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Bookmarks,
  Person,
  Logout
} from '@mui/icons-material';

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          News App
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => handleNavigation('/dashboard')}
            sx={{
              backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<Bookmarks />}
            onClick={() => handleNavigation('/bookmarks')}
            sx={{
              backgroundColor: isActive('/bookmarks') ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Bookmarks
          </Button>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase() || <AccountCircle />}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
