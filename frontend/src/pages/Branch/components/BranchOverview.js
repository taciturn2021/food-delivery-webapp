import { Grid, Paper, Typography, Box, LinearProgress } from '@mui/material';
import {
    ShoppingCart as OrderIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as DeliveryIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Paper
        sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: '100%'
        }}
        elevation={2}
    >
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}.light`,
                color: `${color}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
            <Typography color="textSecondary" variant="body2">
                {title}
            </Typography>
            <Typography variant="h5" component="div">
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="textSecondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Paper>
);

const OrderStatus = ({ title, value, total }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{title}</Typography>
            <Typography variant="body2">{value}/{total}</Typography>
        </Box>
        <LinearProgress 
            variant="determinate" 
            value={(value / total) * 100}
            sx={{ height: 8, borderRadius: 4 }}
        />
    </Box>
);

const BranchOverview = () => {
    // In a real app, these would come from an API
    const stats = [
        {
            title: 'Today\'s Orders',
            value: '24',
            subtitle: '+3 pending approval',
            icon: <OrderIcon />,
            color: 'primary'
        },
        {
            title: 'Average Prep Time',
            value: '18m',
            subtitle: '2m faster than target',
            icon: <TimeIcon />,
            color: 'success'
        },
        {
            title: 'Today\'s Revenue',
            value: '$1,284',
            subtitle: '15% above target',
            icon: <MoneyIcon />,
            color: 'warning'
        },
        {
            title: 'Active Deliveries',
            value: '8',
            subtitle: 'All on schedule',
            icon: <DeliveryIcon />,
            color: 'info'
        }
    ];

    const orderStatuses = [
        { title: 'Orders in Queue', value: 5, total: 20 },
        { title: 'Orders in Preparation', value: 8, total: 20 },
        { title: 'Orders out for Delivery', value: 8, total: 15 }
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Branch Overview
            </Typography>
            
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Current Order Status
                        </Typography>
                        {orderStatuses.map((status, index) => (
                            <OrderStatus key={index} {...status} />
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            • Mark orders as ready
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            • Update menu availability
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            • Manage delivery assignments
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BranchOverview;