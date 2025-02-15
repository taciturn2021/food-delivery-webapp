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
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from '@mui/material';
import {
    LocalShipping as DeliveryIcon,
    AccessTime as TimeIcon,
    CheckCircle as CompletedIcon,
    PendingActions as PendingIcon,
} from '@mui/icons-material';
import { getRiderOrders, updateDeliveryStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LocationTracker from './components/LocationTracker';

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
    const { user } = useAuth();

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

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const activeOrders = orders.filter(o => ['assigned', 'picked'].includes(o.delivery_status));
    const completedOrders = orders.filter(o => o.delivery_status === 'delivered');

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <LocationTracker />
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Delivery Dashboard
                </Typography>

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {successMessage}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
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
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Completed Deliveries
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
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default RiderDashboard;