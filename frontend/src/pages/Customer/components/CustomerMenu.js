import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Box,
    CircularProgress,
    Alert,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Badge
} from '@mui/material';
import { getPublicBranchMenu } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomerMenu = () => {
    const { branchId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const { cart, addToCart, removeFromCart, updateQuantity, getTotal } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await getPublicBranchMenu(branchId);
                console.log('Menu items:', response.data); // Debug log
                const availableItems = response.data.filter(item => item.branch_availability !== false);
                // Ensure price values are numbers
                const processedItems = availableItems.map(item => ({
                    ...item,
                    price: parseFloat(item.price) || 0,
                    branch_price: item.branch_price ? parseFloat(item.branch_price) : null
                }));
                setMenuItems(processedItems);
                setError(null);
            } catch (error) {
                console.error('Error fetching menu:', error);
                setError('Unable to load menu items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        if (branchId) {
            fetchMenu();
        }
    }, [branchId]);

    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) return '0.00';
        return price.toFixed(2);
    };

    const handleAddToCart = (item) => {
        addToCart({
            ...item,
            branchId: parseInt(branchId)
        });
    };

    const CartDrawer = () => (
        <Drawer
            anchor="right"
            open={cartOpen}
            onClose={() => setCartOpen(false)}
        >
            <Box sx={{ width: 350, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Your Cart
                </Typography>
                {cart.items.length === 0 ? (
                    <Typography color="text.secondary">
                        Your cart is empty
                    </Typography>
                ) : (
                    <>
                        <List>
                            {cart.items.map((item) => (
                                <React.Fragment key={item.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={`$${formatPrice((item.branch_price || item.price) * item.quantity)}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                size="small"
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography 
                                                component="span" 
                                                sx={{ mx: 1 }}
                                            >
                                                {item.quantity}
                                            </Typography>
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                size="small"
                                            >
                                                <AddIcon />
                                            </IconButton>
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => removeFromCart(item.id)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                            <Typography variant="h6">
                                Total: ${formatPrice(getTotal())}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => {/* TODO: Implement checkout */}}
                            >
                                Proceed to Checkout
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const groupedItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <>
            <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
                <IconButton 
                    color="primary" 
                    onClick={() => setCartOpen(true)}
                    sx={{ 
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': { bgcolor: 'background.paper' }
                    }}
                >
                    <Badge badgeContent={cart.items.length} color="secondary">
                        <ShoppingCartIcon />
                    </Badge>
                </IconButton>
            </Box>
            
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {Object.entries(groupedItems).map(([category, items]) => (
                    <Box key={category} mb={6}>
                        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                            {category}
                        </Typography>
                        <Grid container spacing={3}>
                            {items.map((item) => (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.02)'
                                            }
                                        }}
                                    >
                                        {item.image_url && (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={item.image_url}
                                                alt={item.name}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        )}
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h6" component="h2">
                                                {item.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {item.description}
                                            </Typography>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Typography variant="h6" color="primary">
                                                    ${formatPrice(item.branch_price || item.price)}
                                                </Typography>
                                                <Button 
                                                    variant="contained" 
                                                    color="primary"
                                                    onClick={() => handleAddToCart(item)}
                                                    startIcon={<AddIcon />}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Container>
            <CartDrawer />
        </>
    );
};

export default CustomerMenu;