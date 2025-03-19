import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useCart } from '../../../context/CartContext';
import { getCustomerAddresses } from '../../../services/api';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getTotal } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await getCustomerAddresses();
                // Filter addresses based on the current branch
                const branchAddresses = response.data.filter(
                    address => address.branchId === cart.branchId
                );
                setAddresses(branchAddresses);
                setError(null);
            } catch (err) {
                setError('Failed to load addresses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [cart.branchId]);

    const formatPrice = (price) => {
        return typeof price === 'number' ? price.toFixed(2) : '0.00';
    };

    if (cart.items.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Typography variant="h5">Your cart is empty</Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                    >
                        Continue Shopping
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Shopping Cart
                </Typography>
            </Box>
            <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Shopping Cart
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {cart.items.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ${formatPrice((item.branch_price || item.price) * item.quantity)}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <IconButton
                                            size="small"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography>{item.quantity}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Summary and Address Selection */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Subtotal:</Typography>
                                <Typography>${formatPrice(getTotal())}</Typography>
                            </Box>

                            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                                Delivery Address
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {loading ? (
                                <Box display="flex" justifyContent="center" my={2}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            ) : addresses.length === 0 ? (
                                <Box textAlign="center" my={2}>
                                    <Typography color="text.secondary" gutterBottom>
                                        No addresses found for this branch
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<LocationIcon />}
                                        onClick={() => navigate('/customer/addresses')}
                                        sx={{ mt: 1 }}
                                    >
                                        Add New Address
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <Grid container spacing={2}>
                                        {addresses.map((address) => (
                                            <Grid item xs={12} key={address.id}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        cursor: 'pointer',
                                                        bgcolor: selectedAddress?.id === address.id
                                                            ? 'action.selected'
                                                            : 'background.paper',
                                                    }}
                                                    onClick={() => setSelectedAddress(address)}
                                                >
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {address.street}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<LocationIcon />}
                                        onClick={() => navigate('/customer/addresses')}
                                        sx={{ mt: 2 }}
                                    >
                                        Add New Address
                                    </Button>
                                </>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                                Payment Method
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2
                                }}
                            >
                                <Typography variant="body1">
                                    Cash on Delivery
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                    Pay when you receive
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={!selectedAddress || cart.items.length === 0}
                                sx={{ mt: 2 }}
                                onClick={() => {
                                    // Place order logic will be implemented later
                                    console.log('Order placed with address:', selectedAddress);
                                }}
                            >
                                Place Order
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;