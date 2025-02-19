import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Card, 
    Grid,
    CircularProgress,
    useTheme,
    alpha,
    Alert
} from '@mui/material';
import { getPublicBranches } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import BranchSelector from './components/BranchSelector';

const CustomerLanding = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                console.log('Fetched branches:', response.data); // Debug log
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
                setError(null);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setError('Unable to load branches. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const handleBranchSelect = (branchId) => {
        localStorage.setItem('selectedBranch', branchId);
        navigate(`/customer/menu/${branchId}`);
    };

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (branches.length === 0 && !error) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                    pt: 8,
                    pb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Alert severity="info">
                        No active branches available at the moment. Please try again later.
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                pt: 8,
                pb: 6
            }}
        >
            <Container maxWidth="lg">
                <Box textAlign="center" mb={8}>
                    <Typography
                        component="h1"
                        variant="h2"
                        color="text.primary"
                        gutterBottom
                        sx={{ 
                            fontWeight: 700,
                            mb: 2
                        }}
                    >
                        Welcome to FoodDelivery
                    </Typography>
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        paragraph
                        sx={{ mb: 4 }}
                    >
                        Choose your nearest branch to start ordering
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                <Card
                    sx={{
                        p: 4,
                        boxShadow: theme.shadows[20],
                        borderRadius: 2
                    }}
                >
                    <BranchSelector 
                        branches={branches}
                        onBranchSelect={handleBranchSelect}
                    />
                </Card>

                <Grid container spacing={4} sx={{ mt: 6 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Fast Delivery
                            </Typography>
                            <Typography color="text.secondary">
                                Get your food delivered quickly and efficiently
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Live Tracking
                            </Typography>
                            <Typography color="text.secondary">
                                Track your order in real-time
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Multiple Branches
                            </Typography>
                            <Typography color="text.secondary">
                                Choose from our various locations
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CustomerLanding;