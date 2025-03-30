import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicBranchMenu } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            <Button 
                onClick={() => setCartOpen(true)}
                className="fixed top-20 right-4 z-30 h-12 w-12 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
                <div className="relative">
                    <ShoppingCart className="h-6 w-6 text-white" />
                    {cart.items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-500">
                            {cart.items.length}
                        </span>
                    )}
                </div>
            </Button>
            
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <AnimatePresence>
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <motion.div 
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-8 sm:mb-12"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-4 sm:mb-6">{category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {items.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Card className="h-full overflow-hidden bg-white/95 backdrop-blur-sm border-orange-100">
                                            {item.image_url && (
                                                <div className="relative h-40 sm:h-48 w-full">
                                                    <img 
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-4 sm:p-6">
                                                <h3 className="text-lg sm:text-xl font-semibold text-orange-900 mb-1 sm:mb-2">{item.name}</h3>
                                                <p className="text-sm sm:text-base text-orange-700/80 mb-3 sm:mb-4 line-clamp-2">{item.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl sm:text-2xl font-bold text-orange-600">
                                                        ${formatPrice(item.branch_price || item.price)}
                                                    </span>
                                                    <Button 
                                                        variant={addedItems[item.id] ? "outline" : "default"}
                                                        size="sm"
                                                        onClick={() => handleAddToCart(item)}
                                                        className={`text-xs sm:text-sm ${addedItems[item.id] 
                                                            ? "border-green-600 text-green-600 hover:bg-green-50" 
                                                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"}`}
                                                    >
                                                        <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                        {addedItems[item.id] ? 'Added!' : 'Add to Cart'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Cart Drawer Overlay */}
            {cartOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={() => setCartOpen(false)}
                ></div>
            )}

            {/* Cart Drawer */}
            <div 
                className={`fixed inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-white/95 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out z-50 border-l border-orange-100 ${
                    cartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 sm:p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-orange-900">Your Cart</h2>
                        <button 
                            onClick={() => setCartOpen(false)}
                            className="text-orange-600 hover:text-orange-700 p-1"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                    
                    {cart.items.length === 0 ? (
                        <div className="text-orange-600/70 text-center py-8">
                            Your cart is empty
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-3 sm:space-y-4">
                                {cart.items.map((item) => (
                                    <Card key={item.id} className="overflow-hidden border-orange-100">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                                <div>
                                                    <h3 className="font-medium text-orange-900 text-sm sm:text-base">{item.name}</h3>
                                                    <p className="text-orange-600 text-sm sm:text-base">${formatPrice((item.branch_price || item.price) * item.quantity)}</p>
                                                </div>
                                                <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2">
                                                    <Button 
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-8 sm:w-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <span className="w-6 sm:w-8 text-center text-orange-900 text-sm sm:text-base">{item.quantity}</span>
                                                    <Button 
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-8 sm:w-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {cart.items.length > 0 && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-orange-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-base sm:text-lg font-semibold text-orange-900">Total</span>
                                <span className="text-xl sm:text-2xl font-bold text-orange-600">${formatPrice(getTotal())}</span>
                            </div>
                            <Button 
                                className="w-full py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                onClick={() => {
                                    setCartOpen(false);
                                    navigate('/cart');
                                }}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomerMenu;