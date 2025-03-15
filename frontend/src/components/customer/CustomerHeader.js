import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Dialog,
    IconButton,
    Box,
    useTheme,
    Menu,
    MenuItem,
    Avatar,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
    Menu as MenuIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    ShoppingBag as OrdersIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import BranchSelector from '../../pages/Customer/components/BranchSelector';
import { useAuth } from '../../context/AuthContext';
import { getPublicBranches } from '../../services/api';

const CustomerHeader = ({ onBranchSelect }) => {
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    const handleBranchSelect = (branchId) => {
        if (onBranchSelect) {
            onBranchSelect(branchId);
        }
        setBranchDialogOpen(false);
    };

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

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            size="large"
                            edge="start"
                            color="primary"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/')}
                        >
                            FoodDelivery
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setBranchDialogOpen(true)}
                                startIcon={<LocationIcon />}
                            >
                                Select Branch
                            </Button>
                            
                            {user ? (
                                <>
                                    <IconButton
                                        onClick={handleMenu}
                                        sx={{ 
                                            ml: 2,
                                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                                        }}
                                    >
                                        <Avatar 
                                            sx={{ 
                                                width: 35, 
                                                height: 35,
                                                bgcolor: theme.palette.primary.main
                                            }}
                                        >
                                            {user.username?.[0]?.toUpperCase()}
                                        </Avatar>
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        PaperProps={{
                                            elevation: 3,
                                            sx: { minWidth: 200 }
                                        }}
                                    >
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                {user.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <MenuItem onClick={() => { 
                                            handleClose(); 
                                            navigate('/customer/profile/edit');
                                        }}>
                                            <PersonIcon sx={{ mr: 2 }} /> Edit Profile
                                        </MenuItem>
                                        <MenuItem onClick={() => { 
                                            handleClose(); 
                                            navigate('/customer/addresses');
                                        }}>
                                            <LocationIcon sx={{ mr: 2 }} /> Manage Addresses
                                        </MenuItem>
                                        <MenuItem onClick={() => { handleClose(); }}>
                                            <OrdersIcon sx={{ mr: 2 }} /> View Orders
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout}>
                                            <LogoutIcon sx={{ mr: 2 }} /> Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={() => navigate('/login')}
                                        sx={{ color: theme.palette.primary.main }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate('/register')}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Dialog
                open={branchDialogOpen}
                onClose={() => setBranchDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <BranchSelector
                    branches={branches}
                    onBranchSelect={handleBranchSelect}
                    isDialog={true}
                />
            </Dialog>
        </>
    );
};

export default CustomerHeader;