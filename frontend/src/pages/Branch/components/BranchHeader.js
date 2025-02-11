import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Box,
    Avatar,
    Badge,
} from '@mui/material';
import {
    Menu as MenuIcon,
    AccountCircle,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BranchHeader = ({ sidebarOpen, onSidebarToggle }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationsAnchor, setNotificationsAnchor] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationsMenu = (event) => {
        setNotificationsAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchor(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
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
                    Branch Dashboard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={handleNotificationsMenu}
                    >
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32 }}>
                            <AccountCircle />
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationsAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(notificationsAnchor)}
                    onClose={handleNotificationsClose}
                >
                    <MenuItem onClick={handleNotificationsClose}>New Order #1234</MenuItem>
                    <MenuItem onClick={handleNotificationsClose}>Order #1233 Updated</MenuItem>
                    <MenuItem onClick={handleNotificationsClose}>Menu Item Stock Low</MenuItem>
                </Menu>

                {/* Profile Menu */}
                <Menu
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
                    <MenuItem onClick={handleClose}>Branch Profile</MenuItem>
                    <MenuItem onClick={handleClose}>Change Password</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default BranchHeader;