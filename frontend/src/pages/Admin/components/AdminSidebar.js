import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    styled,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Restaurant as MenuIcon,
    Store as BranchIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const navItems = [
    { path: '/admin/menu', label: 'Menu Management', icon: <MenuIcon /> },
    { path: '/admin/branches', label: 'Branch Management', icon: <BranchIcon /> },
];

const secondaryItems = [
    { path: '/admin/settings', label: 'Settings', icon: <SettingsIcon /> },
];

const AdminSidebar = ({ open }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <StyledDrawer variant="permanent" open={open}>
            <Box sx={{ 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                px: 2,
                backgroundColor: 'primary.main',
                color: 'white'
            }}>
                <Typography variant="h6" noWrap component="div">
                    Food Delivery
                </Typography>
            </Box>

            <Box sx={{ overflow: 'auto', height: '100%' }}>
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.lighter',
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    minWidth: 0, 
                                    mr: open ? 3 : 'auto', 
                                    justifyContent: 'center',
                                    color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.label} 
                                    sx={{ 
                                        opacity: open ? 1 : 0,
                                        color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                <Divider sx={{ my: 1 }} />
                
                <List>
                    {secondaryItems.map((item) => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.lighter',
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    minWidth: 0, 
                                    mr: open ? 3 : 'auto', 
                                    justifyContent: 'center',
                                    color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.label} 
                                    sx={{ 
                                        opacity: open ? 1 : 0,
                                        color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </StyledDrawer>
    );
};

export default AdminSidebar;