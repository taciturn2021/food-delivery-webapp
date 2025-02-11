import { Grid, Paper, Typography, Box } from '@mui/material';
import {
    TrendingUp,
    People,
    Store,
    LocalDining,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
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
        <Box>
            <Typography color="textSecondary" variant="body2">
                {title}
            </Typography>
            <Typography variant="h5" component="div">
                {value}
            </Typography>
        </Box>
    </Paper>
);

const AdminOverview = () => {
    // In a real app, these would come from an API
    const stats = [
        {
            title: 'Total Orders',
            value: '1,284',
            icon: <TrendingUp />,
            color: 'primary'
        },
        {
            title: 'Active Customers',
            value: '856',
            icon: <People />,
            color: 'success'
        },
        {
            title: 'Total Branches',
            value: '12',
            icon: <Store />,
            color: 'warning'
        },
        {
            title: 'Menu Items',
            value: '156',
            icon: <LocalDining />,
            color: 'info'
        }
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
                
                {/* Charts and additional metrics can be added here */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Orders
                        </Typography>
                        {/* Order table or chart will go here */}
                        <Typography color="textSecondary">
                            Coming soon: Order history and analytics
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminOverview;