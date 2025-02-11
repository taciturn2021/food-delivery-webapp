import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    styled,
    Divider,
    Box,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Store as StoreIcon,
    Restaurant as MenuIcon,
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
        height: '100vh',
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

const mainListItems = [
    { id: 'overview', text: 'Overview', icon: <DashboardIcon /> },
    { id: 'branches', text: 'Branches', icon: <StoreIcon /> },
    { id: 'menu', text: 'Menu Items', icon: <MenuIcon /> },
];

const secondaryListItems = [
    { id: 'settings', text: 'Settings', icon: <SettingsIcon /> },
];

const AdminSidebar = ({ open, selectedSection, onSectionChange }) => {
    return (
        <StyledDrawer variant="permanent" open={open}>
            <Box sx={{ height: 64 }} /> {/* Spacer for header */}
            <List component="nav" sx={{ height: '100%', pt: 0 }}>
                {mainListItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            selected={selectedSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                {secondaryListItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            selected={selectedSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </StyledDrawer>
    );
};

export default AdminSidebar;