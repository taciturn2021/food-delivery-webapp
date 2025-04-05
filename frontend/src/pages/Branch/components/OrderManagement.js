import React, { useState, useEffect, useCallback } from 'react';
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
    InputAdornment,
    Tabs,
    Tab,
    CircularProgress,
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
    DeliveryDining as RiderIcon,
    MyLocation as TrackIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { 
    assignOrderToRider, 
    getBranchRiders,
    getBranchMenu,
    cancelOrder,
    updateDeliveryStatus,
    getOrderById,
    updateOrderStatus,
    getOrders
} from '../../../services/api';
import DeliveryTracker from './DeliveryTracker';
import { useAuth } from '../../../context/AuthContext';

const statusColors = {
    pending: 'warning',
    preparing: 'info',
    delivering: 'primary',
    delivered: 'success',
    cancelled: 'error',
};

const StatusBadge = ({ status }) => {
    const theme = useTheme();
    const color = statusColors[status] || 'default';
    
    const formatStatus = (status) => {
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    
    return (
        <Chip
            label={formatStatus(status)}
            color={color}
            size="small"
            sx={{
                minWidth: 90,
                fontWeight: 500,
            }}
        />
    );
};

const AssignRiderDialog = ({ open, onClose, order, riders, onAssign }) => {
    const [selectedRider, setSelectedRider] = useState('');

    const handleAssign = async () => {
        if (!selectedRider) return;
        await onAssign(selectedRider);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Assign Delivery Staff</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    fullWidth
                    label="Select Delivery Staff"
                    value={selectedRider}
                    onChange={(e) => setSelectedRider(e.target.value)}
                    sx={{ mt: 2 }}
                >
                    {riders.filter(r => r.status === 'active').map((rider) => (
                        <MenuItem key={rider.id} value={rider.id}>
                            {rider.full_name} - {rider.vehicle_type}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    variant="contained"
                    onClick={handleAssign}
                    disabled={!selectedRider}
                >
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const OrderCard = ({ order, onStatusChange, onView, onAssignRider }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [showTracker, setShowTracker] = useState(false);
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
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

                    {/* Order action buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                                onClick={() => onStatusChange(order.id, 'delivering')}
                                fullWidth
                            >
                                Start Delivery
                            </Button>
                        )}

                        {order.status === 'preparing' && !order.rider_id && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<RiderIcon />}
                                onClick={onAssignRider}
                                fullWidth
                            >
                                Assign Rider
                            </Button>
                        )}

                        {order.status === 'preparing' && order.rider_id && (
                            <Chip
                                icon={<DeliveryIcon />}
                                label="Rider Assigned"
                                color="success"
                                variant="outlined"
                            />
                        )}

                        {order.status === 'delivering' && order.assignment_id && (
                            <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                startIcon={<TrackIcon />}
                                onClick={() => setShowTracker(true)}
                                fullWidth
                            >
                                Track Delivery
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {showTracker && (
                <DeliveryTracker
                    assignmentId={order.assignment_id}
                    onClose={() => setShowTracker(false)}
                />
            )}
        </>
    );
};

const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    try {
        // Check if address is a string that needs to be parsed
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address);
            } catch (e) {
                // If it's not valid JSON, return as is
                return address;
            }
        }
        
        // Now handle it as an object
        if (typeof address === 'object') {
            return `${address.street || ''}, 
                    ${address.city || ''} 
                    ${address.state || ''} 
                    ${address.zipCode || ''}`.replace(/\s+/g, ' ').trim();
        }
        
        return String(address);
    } catch (error) {
        console.error('Error formatting address:', error);
        return 'Error displaying address';
    }
};

const OrderDetails = ({ order, onClose, onStatusChange, onAssignRider }) => {
    if (!order) return null;

    // Helper function to safely format price and parse string prices
    const formatPrice = (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return typeof numericPrice === 'number' && !isNaN(numericPrice) ? numericPrice.toFixed(2) : '0.00';
    };

    // Parse address if it's a string
    const parseAddress = (addressStr) => {
        try {
            return typeof addressStr === 'string' ? JSON.parse(addressStr) : addressStr;
        } catch (e) {
            return null;
        }
    };

    const address = parseAddress(order.address);

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
                        <Typography variant="body2" color="text.secondary">{formatAddress(order.address)}</Typography>
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
                        
                        {!order.rider_id && (order.status === 'preparing') && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<RiderIcon />}
                                onClick={onAssignRider}
                                sx={{ mt: 2 }}
                                fullWidth
                            >
                                Assign Rider
                            </Button>
                        )}

                        {order.rider_id && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Assigned Rider
                                </Typography>
                                <Typography variant="body1">
                                ID: {order.rider_id}  Name: {order.rider_name} 
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Phone: {order.rider_phone}
                                </Typography>
                            </Box>
                        )}
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
                                    {order.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">
                                                ${formatPrice(item.price_at_time)}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${formatPrice(parseFloat(item.price_at_time) * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} align="right">
                                            <strong>Total</strong>
                                        </TableCell>
                                        <TableCell align="right">
                                            <strong>${formatPrice(order.total)}</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
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
                {order.status === 'preparing' && (order.rider_id !== null)  && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DeliveryIcon />}
                        onClick={() => {
                            onStatusChange(order.id, 'delivering');
                            onClose();
                        }}
                    >
                        Start Delivery
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState(null);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('id');
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    // Get branch ID from authenticated user
    const branchId = user?.branchId;

    const loadOrders = useCallback(async () => {
        try {
            setRefreshing(true);
            // Use the getOrders API endpoint with branch_id filter
            const response = await getOrders({ branch_id: branchId });
            
            if (response && response.data) {
                // For each order, fetch complete details including items
                const ordersWithDetails = await Promise.all(
                    response.data.map(async (order) => {
                        try {
                            // Fetch detailed order info including items
                            const detailedOrder = await getOrderById(order.id);
                            
                            return {
                                id: order.id,
                                customerName: order.customer_name,
                                status: order.status,
                                total: parseFloat(order.total_amount),
                                items: detailedOrder.data.items || [],
                                time: new Date(order.created_at).toLocaleString(),
                                address: order.delivery_address,
                                phone: detailedOrder.data.phone,
                                rider_id: order.rider_id,
                                rider_name: detailedOrder.data.rider_first_name,
                                rider_phone: detailedOrder.data.rider_phone,
                                assignment_id: order.assignment_id
                            };
                        } catch (err) {
                            console.error(`Error fetching details for order ${order.id}:`, err);
                            return null;
                        }
                    })
                ).then(results => results.filter(Boolean)); // Remove any null results
                
                setOrders(ordersWithDetails);
                setError(null);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
            setError('Failed to load orders: ' + (error.response?.data?.message || error.message));
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [branchId]);

    const loadRiders = async () => {
        try {
            const response = await getBranchRiders(branchId);
            if (response && response.data) {
                setRiders(response.data);
            }
        } catch (error) {
            console.error("Error loading riders:", error);
            setError('Failed to load riders: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (branchId) {
            loadOrders();
            loadRiders();
            
            // Set up auto-refresh interval for 20 seconds
            const interval = setInterval(() => {
                loadOrders();
            }, 20000);
            
            setAutoRefreshInterval(interval);
            
            // Clean up interval on component unmount
            return () => {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                }
            };
        }
    }, [branchId, loadOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Pass the status as an object with the status property, as expected by the API
            await updateOrderStatus(orderId, { status: newStatus });
            
            // Update the order in local state
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus }
                    : order
            ));
            
            setSuccessMessage(`Order #${orderId} status updated to ${newStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error updating order status:", error);
            setError('Failed to update order status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAssignRider = async (riderId) => {
        try {
            // Use the updated API function with corrected parameters
            await assignOrderToRider(selectedOrderForAssignment.id, riderId);
            
            // Refresh data after assignment
            await loadOrders();
            
            setSuccessMessage(`Order assigned to rider successfully`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error assigning rider:", error);
            setError('Failed to assign rider: ' + (error.response?.data?.message || error.message));
        } finally {
            setAssignDialogOpen(false);
            setSelectedOrderForAssignment(null);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchFieldChange = (event) => {
        setSearchField(event.target.value);
    };

    // Filter orders based on status and search query
    const filteredOrders = orders.filter(order => {
        // First filter by status
        const statusMatches = statusFilter === 'all' || order.status === statusFilter;
        
        // Then apply search filter if there's a search query
        if (!searchQuery) return statusMatches;
        
        const query = searchQuery.toLowerCase().trim();
        
        switch (searchField) {
            case 'id':
                return statusMatches && order.id.toString().includes(query);
            case 'phone':
                return statusMatches && order.phone && order.phone.toLowerCase().includes(query);
            case 'name':
                return statusMatches && order.customerName && order.customerName.toLowerCase().includes(query);
            default:
                return statusMatches;
        }
    });

    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    if (loading && orders.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading orders...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            {/* Show success/error messages */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Search and refresh area */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4">
                    Order Management
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, maxWidth: { xs: '100%', md: '50%' }, ml: { xs: 0, md: 2 } }}>
                    <TextField
                        placeholder="Search orders..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        value={searchField}
                        onChange={handleSearchFieldChange}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="id">Order ID</MenuItem>
                        <MenuItem value="phone">Phone</MenuItem>
                        <MenuItem value="name">Customer Name</MenuItem>
                    </TextField>
                    <Button 
                        variant="outlined" 
                        onClick={loadOrders}
                        disabled={refreshing}
                        startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Box>
            </Box>

            {/* Status filter tabs */}
            <Paper sx={{ mb: 4, boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
                <Tabs 
                    value={statusFilter === 'all' ? 0 : ['pending', 'preparing', 'delivering', 'delivered', 'cancelled'].indexOf(statusFilter) + 1}
                    onChange={(e, newValue) => {
                        const statuses = ['all', 'pending', 'preparing', 'delivering', 'delivered', 'cancelled'];
                        setStatusFilter(statuses[newValue]);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: 120,
                            py: 2
                        }
                    }}
                >
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>All Orders</span>
                            </Box>
                        } 
                    />
                    {['pending', 'preparing', 'delivering', 'delivered', 'cancelled'].map((status) => (
                        <Tab 
                            key={status}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {status === 'pending' && <TimerIcon fontSize="small" />}
                                    {status === 'preparing' && <DiningIcon fontSize="small" />}
                                    {status === 'delivering' && <DeliveryIcon fontSize="small" />}
                                    {status === 'delivered' && <AcceptIcon fontSize="small" />}
                                    {status === 'cancelled' && <RejectIcon fontSize="small" />}
                                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                    {status === 'pending' && statusCounts[status] > 0 && (
                                        <Badge 
                                            color={statusColors[status]} 
                                            badgeContent={statusCounts[status]} 
                                            max={99}
                                        />
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Orders grid */}
            {filteredOrders.length === 0 ? (
                <Alert severity="info">
                    No orders found in "{statusFilter === 'all' ? 'any' : statusFilter}" status
                    {searchQuery && ` matching search "${searchQuery}"`}
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredOrders.map((order) => (
                        <Grid item xs={12} sm={6} md={4} key={order.id}>
                            <OrderCard
                                order={order}
                                onStatusChange={handleStatusChange}
                                onView={() => setSelectedOrder(order)}
                                onAssignRider={() => {
                                    setSelectedOrderForAssignment(order);
                                    setAssignDialogOpen(true);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Order details dialog */}
            <OrderDetails
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusChange={handleStatusChange}
                onAssignRider={() => {
                    setSelectedOrderForAssignment(selectedOrder);
                    setAssignDialogOpen(true);
                }}
            />

            {/* Rider assignment dialog */}
            <AssignRiderDialog
                open={assignDialogOpen}
                onClose={() => {
                    setAssignDialogOpen(false);
                    setSelectedOrderForAssignment(null);
                }}
                order={selectedOrderForAssignment}
                riders={riders}
                onAssign={handleAssignRider}
            />
        </Box>
    );
};

export default OrderManagement;