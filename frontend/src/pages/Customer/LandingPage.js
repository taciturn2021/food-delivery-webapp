import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Dialog,
    Box,
    CircularProgress,
    useTheme,
    alpha,
    IconButton,
    Card,
    CardContent,
    Grid,
    Alert,
    CardMedia,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, LocationOn, Search, ShoppingCart } from '@mui/icons-material';
import BranchSelector from './components/BranchSelector';
import { getPublicBranches, getPublicBranchMenu } from '../../services/api';

const IntegratedLanding = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [branchDialogOpen, setBranchDialogOpen] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
                setError(null);

                // Check for previously selected branch
                const savedBranchId = localStorage.getItem('selectedBranch');
                if (savedBranchId) {
                    const savedBranch = activeBranches.find(branch => branch.id === parseInt(savedBranchId));
                    if (savedBranch) {
                        setSelectedBranch(savedBranch);
                        setBranchDialogOpen(false);
                        loadBranchMenu(savedBranchId);
                    }
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                setError('Unable to load branches. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const loadBranchMenu = async (branchId) => {
        setMenuLoading(true);
        try {
            const response = await getPublicBranchMenu(branchId);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error loading menu:', error);
            setError('Unable to load menu items. Please try again later.');
        } finally {
            setMenuLoading(false);
        }
    };

    const handleBranchSelect = (branchId) => {
        const selected = branches.find(branch => branch.id === branchId);
        setSelectedBranch(selected);
        localStorage.setItem('selectedBranch', branchId);
        setBranchDialogOpen(false);
        loadBranchMenu(branchId);
    };

    const renderMenu = () => (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Menu at {selectedBranch?.name}
            </Typography>
            {menuLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {menuItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={item.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" color="primary">
                                            ${Number(item.branch_price).toFixed(2)}
                                        </Typography>
                                        <Chip
                                            label={item.category}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<ShoppingCart />}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            size="large"
                            edge="start"
                            color="primary"
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

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {selectedBranch && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setBranchDialogOpen(true)}
                                    startIcon={<LocationOn />}
                                >
                                    {selectedBranch.name}
                                </Button>
                            )}
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
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Toolbar /> {/* Spacer for fixed AppBar */}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            ) : (
                <>
                    {selectedBranch ? renderMenu() : null}
                </>
            )}

            <Dialog
                open={branchDialogOpen}
                onClose={() => {
                    if (selectedBranch) setBranchDialogOpen(false);
                }}
                maxWidth="md"
                fullWidth
                disableEscapeKeyDown={!selectedBranch}
                disableBackdropClick={!selectedBranch}
            >
                <BranchSelector
                    branches={branches}
                    onBranchSelect={handleBranchSelect}
                    isDialog={true}
                />
            </Dialog>
        </Box>
    );
};

export default IntegratedLanding;