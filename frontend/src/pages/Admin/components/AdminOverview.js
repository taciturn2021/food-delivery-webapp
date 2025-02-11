import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    LinearProgress,
    Card,
    CardContent,
    Divider,
    IconButton,
    Button,
    useTheme
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    AttachMoney as MoneyIcon,
    Store as StoreIcon,
    Restaurant as MenuIcon,
    ShoppingCart as OrderIcon,
    MoreVert as MoreVertIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { getAllBranches, getAllMenuItems } from '../../../services/api';

const StatCard = ({ title, value, subtext, icon, color, trend, percentChange }) => {
    const theme = useTheme();
    
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${color}.lighter`,
                            color: `${color}.main`,
                        }}
                    >
                        {icon}
                    </Box>
                    <IconButton size="small">
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="h4" sx={{ mb: 1 }}>
                    {value}
                </Typography>

                {(trend || percentChange) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {trend === 'up' ? (
                            <ArrowUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                            <ArrowDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                        <Typography 
                            variant="body2" 
                            color={trend === 'up' ? 'success.main' : 'error.main'}
                            sx={{ fontWeight: 500 }}
                        >
                            {percentChange}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}

                {subtext && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const ProgressSection = ({ title, value, total, color }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.primary">
                {value}/{total}
            </Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={(value / total) * 100}
            sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${color}.lighter`,
                '& .MuiLinearProgress-bar': {
                    bgcolor: `${color}.main`,
                    borderRadius: 4,
                },
            }}
        />
    </Box>
);

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalBranches: 0,
        activeBranches: 0,
        totalMenuItems: 0,
        availableMenuItems: 0,
        recentOrders: 24,
        revenue: 1284,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOverviewData();
    }, []);

    const loadOverviewData = async () => {
        try {
            const [branchesRes, menuItemsRes] = await Promise.all([
                getAllBranches(),
                getAllMenuItems()
            ]);

            const branches = branchesRes.data;
            const menuItems = menuItemsRes.data;

            setStats({
                ...stats,
                totalBranches: branches.length,
                activeBranches: branches.filter(b => b.status === 'active').length,
                totalMenuItems: menuItems.length,
                availableMenuItems: menuItems.filter(m => m.is_available).length,
            });
        } catch (error) {
            setError('Failed to load overview data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 400
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                {error}
            </Paper>
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Dashboard Overview
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Branches"
                        value={stats.totalBranches}
                        subtext={`${stats.activeBranches} branches active`}
                        icon={<StoreIcon />}
                        color="primary"
                        trend="up"
                        percentChange={8.5}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Menu Items"
                        value={stats.totalMenuItems}
                        subtext={`${stats.availableMenuItems} items available`}
                        icon={<MenuIcon />}
                        color="warning"
                        trend="up"
                        percentChange={12.3}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Recent Orders"
                        value={stats.recentOrders}
                        subtext="Last 24 hours"
                        icon={<OrderIcon />}
                        color="success"
                        trend="down"
                        percentChange={4.2}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Revenue"
                        value={`$${stats.revenue}`}
                        subtext="15% above target"
                        icon={<MoneyIcon />}
                        color="info"
                        trend="up"
                        percentChange={15}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Order Status Overview
                            </Typography>
                            <Box sx={{ mt: 3 }}>
                                <ProgressSection
                                    title="Orders in Queue"
                                    value={5}
                                    total={20}
                                    color="warning"
                                />
                                <ProgressSection
                                    title="Orders in Preparation"
                                    value={8}
                                    total={20}
                                    color="info"
                                />
                                <ProgressSection
                                    title="Orders out for Delivery"
                                    value={12}
                                    total={15}
                                    color="success"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<StoreIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    Add New Branch
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<MenuIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    Create Menu Item
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<TrendingUpIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    View Analytics
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminOverview;