import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Box,
    Avatar,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    AccountCircle
} from '@mui/icons-material';

const AdminHeader = ({ sidebarOpen, onSidebarToggle }) => {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleSettings = () => {
        navigate('/admin/settings');
        handleClose();
    };    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'white',
                color: 'primary.main',
                boxShadow: 1
            }}
        >
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="toggle sidebar"
                    onClick={onSidebarToggle}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Admin Dashboard
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                            {user?.username?.charAt(0)?.toUpperCase() || <AccountCircle />}
                        </Avatar>
                    </IconButton>
                </Box>                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
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
                    <MenuItem onClick={handleSettings}>Settings</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default AdminHeader;