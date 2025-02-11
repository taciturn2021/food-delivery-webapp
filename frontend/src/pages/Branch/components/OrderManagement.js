import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
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
    TextField,
    Card,
    CardContent,
    Divider,
    Alert,
    Menu,
    MenuItem,
    Badge,
    useTheme,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Done as AcceptIcon,
    Clear as RejectIcon,
    LocalShipping as DeliveryIcon,
    MoreVert as MoreVertIcon,
    LocalDining as DiningIcon,
    Timer as TimerIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';

const statusColors = {
    pending: 'warning',
    preparing: 'info',
    ready: 'secondary',
    delivered: 'success',
    cancelled: 'error',
};

const StatusBadge = ({ status }) => {
    const theme = useTheme();
    const color = statusColors[status] || 'default';
    
    return (
        <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={color}
            size="small"
            sx={{
                minWidth: 90,
                fontWeight: 500,
            }}
        />
    );
};

const OrderCard = ({ order, onStatusChange, onView }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                        Order #{order.id}
                    </Typography>
                    <Box>
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => {
                                onView(order);
                                handleMenuClose();
                            }}>
                                View Details
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose}>Print Receipt</MenuItem>
                            {order.status === 'pending' && (
                                <MenuItem onClick={() => {
                                    onStatusChange(order.id, 'preparing');
                                    handleMenuClose();
                                }} sx={{ color: 'success.main' }}>
                                    Accept Order
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Customer
                    </Typography>
                    <Typography variant="subtitle1">
                        {order.customerName}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Items
                    </Typography>
                    {order.items.map((item, index) => (
                        <Typography key={index} variant="body2">
                            {item.quantity}x {item.name}
                        </Typography>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary.main">
                        ${order.total.toFixed(2)}
                    </Typography>
                    <StatusBadge status={order.status} />
                </Box>

                {order.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<AcceptIcon />}
                            onClick={() => onStatusChange(order.id, 'preparing')}
                            fullWidth
                        >
                            Accept
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<RejectIcon />}
                            onClick={() => onStatusChange(order.id, 'cancelled')}
                            fullWidth
                        >
                            Reject
                        </Button>
                    </Box>
                )}

                {order.status === 'preparing' && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<DiningIcon />}
                        onClick={() => onStatusChange(order.id, 'ready')}
                        fullWidth
                    >
                        Mark Ready
                    </Button>
                )}

                {order.status === 'ready' && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<DeliveryIcon />}
                        onClick={() => onStatusChange(order.id, 'delivered')}
                        fullWidth
                    >
                        Mark Delivered
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

const OrderDetails = ({ order, onClose, onStatusChange }) => {
    if (!order) return null;

    return (
        <Dialog
            open={Boolean(order)}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Order #{order.id}
                    <StatusBadge status={order.status} sx={{ ml: 2 }} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                    {order.time}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Customer Information
                        </Typography>
                        <Typography variant="body1">{order.customerName}</Typography>
                        <Typography variant="body2" color="text.secondary">{order.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">{order.address}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Delivery Details
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Estimated Time
                                </Typography>
                                <Typography variant="body1">
                                    30-45 minutes
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Distance
                                </Typography>
                                <Typography variant="body1">
                                    2.5 km
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Order Items
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">
                                                ${item.price.toFixed(2)}
                                            </TableCell>
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
                                            <strong>${order.total.toFixed(2)}</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {order.status === 'preparing' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Preparation Time (minutes)"
                                type="number"
                                defaultValue={30}
                                InputProps={{ inputProps: { min: 5 } }}
                            />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button 
                    startIcon={<ReceiptIcon />}
                    onClick={onClose}
                >
                    Print Receipt
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose}>Close</Button>
                {order.status === 'pending' && (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AcceptIcon />}
                            onClick={() => {
                                onStatusChange(order.id, 'preparing');
                                onClose();
                            }}
                        >
                            Accept Order
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={() => {
                                onStatusChange(order.id, 'cancelled');
                                onClose();
                            }}
                        >
                            Reject Order
                        </Button>
                    </>
                )}
                {order.status === 'preparing' && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DiningIcon />}
                        onClick={() => {
                            onStatusChange(order.id, 'ready');
                            onClose();
                        }}
                    >
                        Mark as Ready
                    </Button>
                )}
                {order.status === 'ready' && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DeliveryIcon />}
                        onClick={() => {
                            onStatusChange(order.id, 'delivered');
                            onClose();
                        }}
                    >
                        Mark as Delivered
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

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
        {
            id: '1235',
            customerName: 'Jane Smith',
            items: [
                { name: 'Veggie Pizza', quantity: 1, price: 14.99 },
                { name: 'Cola', quantity: 2, price: 2.99 },
            ],
            total: 20.97,
            status: 'preparing',
            time: '2024-02-10 14:25',
            address: '456 Oak St, City',
            phone: '(555) 987-6543',
        },
    ]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus }
                : order
        ));
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    return (
        <Box sx={{ py: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                    Order Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {['all', 'pending', 'preparing', 'ready', 'delivered'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setStatusFilter(status)}
                            startIcon={status === 'pending' ? <TimerIcon /> : null}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status === 'pending' && orders.filter(o => o.status === 'pending').length > 0 && (
                                <Badge
                                    color="error"
                                    badgeContent={orders.filter(o => o.status === 'pending').length}
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Button>
                    ))}
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredOrders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                        <OrderCard
                            order={order}
                            onStatusChange={handleStatusChange}
                            onView={() => setSelectedOrder(order)}
                        />
                    </Grid>
                ))}
            </Grid>

            <OrderDetails
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusChange={handleStatusChange}
            />
        </Box>
    );
};

export default OrderManagement;