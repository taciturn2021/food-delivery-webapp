import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicBranchMenu } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomerMenu = ({ branchId: propBranchId }) => {
    const navigate = useNavigate();
    const params = useParams();
    const branchId = propBranchId || params.branchId; // use prop if available, fallback to route param
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

    const [addedItems, setAddedItems] = useState({});

    const handleAddToCart = (item) => {
        addToCart({
            ...item,
            branchId: parseInt(branchId)
        });
        setAddedItems(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => {
            setAddedItems(prev => ({ ...prev, [item.id]: false }));
        }, 1000);
        setCartOpen(true);
    };

    const CartDrawer = () => (
        <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
            <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Your Cart</h2>
                    <button 
                        onClick={() => setCartOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {cart.items.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        Your cart is empty
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-gray-600">${formatPrice((item.branch_price || item.price) * item.quantity)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <RemoveIcon />
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <AddIcon />
                                        </button>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {cart.items.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold">${formatPrice(getTotal())}</span>
                        </div>
                        <button 
                            onClick={() => {
                                setCartOpen(false);
                                navigate('/cart');
                            }}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 mt-16">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    {error}
                </div>
            </div>
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
            <button 
                onClick={() => setCartOpen(true)}
                className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
                <div className="relative">
                    <ShoppingCartIcon className="text-blue-600 w-6 h-6" />
                    {cart.items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cart.items.length}
                        </span>
                    )}
                </div>
            </button>
            
            <div className="container mx-auto px-4 py-8">
                <AnimatePresence>
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <motion.div 
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl font-bold mb-6">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                                    >
                                        {item.image_url && (
                                            <div className="relative h-48">
                                                <img 
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                            <p className="text-gray-600 mb-4">{item.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ${formatPrice(item.branch_price || item.price)}
                                                </span>
                                                <button 
                                                    onClick={() => handleAddToCart(item)}
                                                    className={`flex items-center space-x-2 ${addedItems[item.id] ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors`}
                                                >
                                                    <AddIcon />
                                                    <span>{addedItems[item.id] ? 'Added!' : 'Add to Cart'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <CartDrawer />
        </>
    );
};

export default CustomerMenu;