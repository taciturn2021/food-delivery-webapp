import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Button,
    useTheme,
} from '@mui/material';
import {
    ShoppingCart as OrderIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as DeliveryIcon,
    Restaurant as MenuIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, subtext, icon, color }) => {
    const theme = useTheme();
    
    return (
        <Card 
            sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
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
                </Box>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="h4" sx={{ mb: 1 }}>
                    {value}
                </Typography>

                {subtext && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const OrderProgress = ({ title, value, total, color }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.primary">
                {value}
            </Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={value > 0 ? (value / (total || 1)) * 100 : 0}
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

const BranchOverview = ({ orders = [], onSectionChange }) => {
    // Filter orders for today's date only
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    });

    // Calculate statistics from today's orders
    const orderStats = todayOrders.reduce((acc, order) => {
        // Count orders by status
        acc[order.status] = (acc[order.status] || 0) + 1;
        
        // Sum up revenue only from today's orders
        if (!['cancelled'].includes(order.status)) {
            acc.totalRevenue += parseFloat(order.total || 0);
        }
        return acc;
    }, {
        pending: 0,
        preparing: 0,
        delivering: 0,
        totalRevenue: 0
    });

    const orderStatuses = [
        { 
            title: 'Orders Pending',
            value: orderStats.pending, 
            color: 'warning' 
        },
        { 
            title: 'Orders Preparing', 
            value: orderStats.preparing, 
            color: 'info' 
        },
        { 
            title: 'Orders Delivering', 
            value: orderStats.delivering, 
            color: 'success' 
        }
    ];

    const totalActiveOrders = orderStats.pending + orderStats.preparing + orderStats.delivering;

    return (
        <Box sx={{ py: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Branch Overview
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Orders"
                        value={totalActiveOrders}
                        subtext={`${orderStats.pending} pending approval`}
                        icon={<OrderIcon />}
                        color="primary"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Orders Preparing"
                        value={orderStats.preparing}
                        subtext="In kitchen"
                        icon={<TimeIcon />}
                        color="info"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Revenue"
                        value={`$${orderStats.totalRevenue.toFixed(2)}`}
                        subtext="From all orders"
                        icon={<MoneyIcon />}
                        color="warning"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Deliveries"
                        value={orderStats.delivering}
                        subtext="In transit"
                        icon={<DeliveryIcon />}
                        color="success"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">
                                    Order Status Overview
                                </Typography>
                                <Button 
                                    size="small" 
                                    onClick={() => onSectionChange('orders')}
                                >
                                    View All Orders
                                </Button>
                            </Box>
                            
                            {orderStatuses.map((status, index) => (
                                <OrderProgress
                                    key={index}
                                    title={status.title}
                                    value={status.value}
                                    total={Math.max(totalActiveOrders, 1)}
                                    color={status.color}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<OrderIcon />}
                                    onClick={() => onSectionChange('orders')}
                                >
                                    Manage Orders
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<MenuIcon />}
                                    onClick={() => onSectionChange('menu')}
                                >
                                    Update Menu
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<DeliveryIcon />}
                                    onClick={() => onSectionChange('riders')}
                                >
                                    Manage Delivery Staff
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BranchOverview;