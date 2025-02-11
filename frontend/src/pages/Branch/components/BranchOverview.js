import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    IconButton,
    Chip,
    useTheme,
    Button,
    Divider,
    MenuItem,
    Menu,
} from '@mui/material';
import {
    ShoppingCart as OrderIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as DeliveryIcon,
    MoreVert as MoreVertIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    Restaurant as MenuIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, subtext, icon, color, trend, percentChange }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    
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
                    <IconButton 
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={() => setAnchorEl(null)}>View Details</MenuItem>
                        <MenuItem onClick={() => setAnchorEl(null)}>Download Report</MenuItem>
                    </Menu>
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
                            vs last week
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

const OrderProgress = ({ title, value, total, color }) => (
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

const PerformanceMetric = ({ title, value, target, unit, icon, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
            }}
        >
            {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h6">
                    {value}{unit}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Target: {target}{unit}
                </Typography>
            </Box>
        </Box>
    </Box>
);

const BranchOverview = () => {
    const [stats, setStats] = useState({
        orders: 24,
        avgPrepTime: 18,
        revenue: 1284,
        activeDeliveries: 8
    });

    const orderStatuses = [
        { title: 'Orders in Queue', value: 5, total: 20, color: 'warning' },
        { title: 'Orders in Preparation', value: 8, total: 20, color: 'info' },
        { title: 'Orders out for Delivery', value: 8, total: 15, color: 'success' }
    ];

    const performanceMetrics = [
        { title: 'Average Preparation Time', value: 18, target: 20, unit: 'm', icon: <TimeIcon />, color: 'primary' },
        { title: 'Order Acceptance Rate', value: 95, target: 90, unit: '%', icon: <SpeedIcon />, color: 'success' },
        { title: 'Customer Satisfaction', value: 4.8, target: 4.5, unit: '/5', icon: <MenuIcon />, color: 'warning' }
    ];

    return (
        <Box sx={{ py: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Branch Overview
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Orders"
                        value={stats.orders}
                        subtext="+3 pending approval"
                        icon={<OrderIcon />}
                        color="primary"
                        trend="up"
                        percentChange={12}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Average Prep Time"
                        value={`${stats.avgPrepTime}m`}
                        subtext="2m faster than target"
                        icon={<TimeIcon />}
                        color="success"
                        trend="up"
                        percentChange={8}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Revenue"
                        value={`$${stats.revenue}`}
                        subtext="15% above target"
                        icon={<MoneyIcon />}
                        color="warning"
                        trend="up"
                        percentChange={15}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Deliveries"
                        value={stats.activeDeliveries}
                        subtext="All on schedule"
                        icon={<DeliveryIcon />}
                        color="info"
                        trend="down"
                        percentChange={5}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">
                                    Current Order Status
                                </Typography>
                                <Button size="small">View All Orders</Button>
                            </Box>
                            
                            {orderStatuses.map((status, index) => (
                                <OrderProgress
                                    key={index}
                                    title={status.title}
                                    value={status.value}
                                    total={status.total}
                                    color={status.color}
                                />
                            ))}

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Performance Metrics
                            </Typography>

                            {performanceMetrics.map((metric, index) => (
                                <PerformanceMetric
                                    key={index}
                                    title={metric.title}
                                    value={metric.value}
                                    target={metric.target}
                                    unit={metric.unit}
                                    icon={metric.icon}
                                    color={metric.color}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<OrderIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    View New Orders
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<MenuIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    Update Menu Status
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<DeliveryIcon />}
                                    onClick={() => {/* TODO */}}
                                >
                                    Manage Deliveries
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle2" gutterBottom>
                                Staff on Duty
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                <Chip label="John (Kitchen)" color="primary" size="small" />
                                <Chip label="Sarah (Counter)" color="primary" size="small" />
                                <Chip label="Mike (Delivery)" color="primary" size="small" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BranchOverview;