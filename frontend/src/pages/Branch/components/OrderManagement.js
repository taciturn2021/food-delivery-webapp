import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Done as AcceptIcon,
    Clear as RejectIcon,
    LocalShipping as DeliveryIcon,
} from '@mui/icons-material';

const OrderManagement = () => {
    const [orders, setOrders] = useState([
        {
            id: '1234',
            customerName: 'John Doe',
            items: [
                { name: 'Chicken Burger', quantity: 2, price: 12.99 },
                { name: 'Fries', quantity: 1, price: 4.99 },
            ],
            total: 30.97,
            status: 'pending',
            time: '2024-02-10 14:30',
            address: '123 Main St, City',
            phone: '(555) 123-4567',
        },
        // Add more orders as needed
    ]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'preparing':
                return 'info';
            case 'ready':
                return 'success';
            case 'delivered':
                return 'default';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewDialogOpen(true);
    };

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus }
                : order
        ));
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Order Management
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.time}</TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    {order.status === 'pending' && (
                                        <>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleStatusChange(order.id, 'preparing')}
                                            >
                                                <AcceptIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                                            >
                                                <RejectIcon />
                                            </IconButton>
                                        </>
                                    )}
                                    {order.status === 'preparing' && (
                                        <IconButton
                                            size="small"
                                            color="info"
                                            onClick={() => handleStatusChange(order.id, 'ready')}
                                        >
                                            <DeliveryIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            Order Details #{selectedOrder.id}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Customer Information</Typography>
                                    <Typography>{selectedOrder.customerName}</Typography>
                                    <Typography>{selectedOrder.phone}</Typography>
                                    <Typography>{selectedOrder.address}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Order Information</Typography>
                                    <Typography>Time: {selectedOrder.time}</Typography>
                                    <Typography>Status: {selectedOrder.status}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                        Order Items
                                    </Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Item</TableCell>
                                                    <TableCell align="right">Quantity</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell align="right">Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedOrder.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell align="right">{item.quantity}</TableCell>
                                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                        <TableCell align="right">
                                                            ${(item.quantity * item.price).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell colSpan={3} align="right">
                                                        <strong>Total</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>${selectedOrder.total.toFixed(2)}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                {selectedOrder.status === 'preparing' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Estimated Preparation Time (minutes)"
                                            type="number"
                                            defaultValue={30}
                                            InputProps={{ inputProps: { min: 5 } }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                            {selectedOrder.status === 'preparing' && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        handleStatusChange(selectedOrder.id, 'ready');
                                        setViewDialogOpen(false);
                                    }}
                                >
                                    Mark as Ready
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default OrderManagement;