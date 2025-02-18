import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Tab,
    Tabs,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    LocalShipping as DeliveryIcon,
    Settings as SettingsIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { getRiderOrders, updateDeliveryStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LocationTracker from './components/LocationTracker';
import RiderSettings from './components/RiderSettings';
import { useNavigate } from 'react-router-dom';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const statusColors = {
    assigned: 'warning',
    picked: 'info',
    delivered: 'success',
    cancelled: 'error',
};

const RiderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    // TODO: Get actual rider ID from auth context
    const riderId = user?.id;

    useEffect(() => {
        if (riderId) {
            loadOrders();
        }
    }, [riderId]);

    const loadOrders = async () => {
        try {
            const response = await getRiderOrders(riderId);
            setOrders(response.data);
        } catch (error) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, assignmentId, newStatus) => {
        try {
            await updateDeliveryStatus(orderId, assignmentId, newStatus);
            setSuccessMessage(`Order #${orderId} marked as ${newStatus}`);
            await loadOrders(); // Refresh orders
            setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
        } catch (error) {
            setError('Failed to update order status');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const activeOrders = orders.filter(o => ['assigned', 'picked'].includes(o.delivery_status));
    const completedOrders = orders.filter(o => o.delivery_status === 'delivered');

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4">
                            Rider Dashboard
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Grid>

                    {successMessage && (
                        <Grid item xs={12}>
                            <Alert severity="success">
                                {successMessage}
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Card>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="fullWidth"
                            >
                                <Tab 
                                    icon={<DeliveryIcon />} 
                                    label="Active Deliveries" 
                                    iconPosition="start"
                                />
                                <Tab 
                                    icon={<HistoryIcon />} 
                                    label="Delivery History" 
                                    iconPosition="start"
                                />
                                <Tab 
                                    icon={<SettingsIcon />} 
                                    label="Settings" 
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Card>
                    </Grid>

                    {/* LocationTracker in its own Grid item */}
                    <Grid item xs={12}>
                        <LocationTracker />
                    </Grid>

                    <Grid item xs={12}>
                        <TabPanel value={activeTab} index={0}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Active Deliveries
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Order ID</TableCell>
                                                    <TableCell>Delivery Address</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Assigned Time</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {activeOrders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell>#{order.id}</TableCell>
                                                        <TableCell>{order.delivery_address}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={order.delivery_status}
                                                                color={statusColors[order.delivery_status]}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(order.assigned_at).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.delivery_status === 'assigned' && (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => handleStatusUpdate(order.id, order.assignment_id, 'picked')}
                                                                >
                                                                    Mark as Picked
                                                                </Button>
                                                            )}
                                                            {order.delivery_status === 'picked' && (
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => handleStatusUpdate(order.id, order.assignment_id, 'delivered')}
                                                                >
                                                                    Mark as Delivered
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {activeOrders.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center">
                                                            No active deliveries
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Delivery History
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Order ID</TableCell>
                                                    <TableCell>Delivery Address</TableCell>
                                                    <TableCell>Assigned Time</TableCell>
                                                    <TableCell>Completed Time</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {completedOrders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell>#{order.id}</TableCell>
                                                        <TableCell>{order.delivery_address}</TableCell>
                                                        <TableCell>
                                                            {new Date(order.assigned_at).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.completed_at && new Date(order.completed_at).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {completedOrders.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center">
                                                            No completed deliveries
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            <RiderSettings />
                        </TabPanel>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default RiderDashboard;