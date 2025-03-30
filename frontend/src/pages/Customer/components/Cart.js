import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { getCustomerAddresses, createOrder } from '../../../services/api';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useToast } from '../../../components/ui/use-toast';
import CustomerHeader from '../../../components/customer/CustomerHeader';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [placingOrder, setPlacingOrder] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await getCustomerAddresses();
                // Filter addresses based on the current branch
                const branchAddresses = response.data.filter(
                    address => address.branchId === cart.branchId
                );
                setAddresses(branchAddresses);
                
                // If there's only one address, select it automatically
                if (branchAddresses.length === 1) {
                    setSelectedAddress(branchAddresses[0]);
                }
                
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

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast({
                title: "No address selected",
                description: "Please select a delivery address",
                variant: "destructive"
            });
            return;
        }

        try {
            setPlacingOrder(true);

            // Create order payload
            const orderItems = cart.items.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                special_instructions: item.specialInstructions || ""
            }));

            const orderData = {
                branch_id: cart.branchId,
                items: orderItems,
                delivery_address: {
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude
                }
            };

            // Send order to API
            const response = await createOrder(orderData);
            
            // After successful order creation, clear the cart
            clearCart();
            
            // Show success toast
            toast({
                title: "Order placed successfully!",
                description: "Your order has been received and is being processed.",
                variant: "success"
            });
            
            // Navigate to the order tracking page
            navigate(`/customer/orders/${response.data.id}`);
            
        } catch (error) {
            console.error('Error placing order:', error);
            toast({
                title: "Failed to place order",
                description: error.response?.data?.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    if (cart.items.length === 0) {
        return (
            <>
                <CustomerHeader />
                <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                    <div className="container mx-auto px-4 py-8 relative z-10">
                        <div className="text-center">
                            <ShoppingCart className="mx-auto h-12 w-12 text-orange-600 mb-4" />
                            <h2 className="text-2xl font-semibold text-orange-900 mb-4">Your cart is empty</h2>
                            <Button onClick={() => navigate(-1)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <CustomerHeader />
            <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="hover:bg-orange-100 p-2 rounded-full transition-colors text-orange-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-semibold text-orange-900">Shopping Cart</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                            {cart.items.map((item) => (
                                <Card key={item.id} className="bg-white/95 backdrop-blur-sm border-orange-100">
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                            <div className="mb-2 sm:mb-0">
                                                <h3 className="text-base sm:text-lg font-medium text-orange-900">{item.name}</h3>
                                                <p className="text-orange-600 text-sm sm:text-base">
                                                    ${formatPrice((item.branch_price || item.price) * item.quantity)}
                                                </p>
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
                                                    className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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

                        {/* Order Summary */}
                        <div>
                            <Card className="bg-white/95 backdrop-blur-sm border-orange-100 sticky top-20">
                                <CardContent className="p-4 sm:p-6">
                                    <h2 className="text-lg font-semibold text-orange-900 mb-3 sm:mb-4">Order Summary</h2>
                                    <div className="flex justify-between mb-3 sm:mb-4">
                                        <span className="text-sm sm:text-base text-orange-700">Subtotal:</span>
                                        <span className="font-medium text-sm sm:text-base text-orange-900">${formatPrice(getTotal())}</span>
                                    </div>

                                    <div className="border-t border-orange-100 my-3 sm:my-4" />

                                    <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-3 sm:mb-4">Delivery Address</h3>
                                    
                                    {loading ? (
                                        <div className="flex justify-center py-3 sm:py-4">
                                            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-orange-600" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="destructive" className="mb-3 sm:mb-4 text-sm">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : addresses.length === 0 ? (
                                        <div className="text-center py-3 sm:py-4">
                                            <p className="text-orange-700 mb-3 sm:mb-4 text-sm sm:text-base">
                                                No addresses found for this branch
                                            </p>
                                            <Button 
                                                onClick={() => navigate('/customer/addresses')} 
                                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs sm:text-sm"
                                                size="sm"
                                            >
                                                <MapPin className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                Add New Address
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                                {addresses.map((address) => (
                                                    <div
                                                        key={address.id}
                                                        className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                                                            selectedAddress?.id === address.id
                                                                ? 'border-orange-500 bg-orange-50'
                                                                : 'border-orange-200 hover:border-orange-500'
                                                        }`}
                                                        onClick={() => setSelectedAddress(address)}
                                                    >
                                                        <p className="font-medium text-orange-900 text-sm sm:text-base">{address.street}</p>
                                                        <p className="text-xs sm:text-sm text-orange-700">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 text-xs sm:text-sm"
                                                onClick={() => navigate('/customer/addresses')}
                                            >
                                                <MapPin className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                Add New Address
                                            </Button>
                                        </>
                                    )}

                                    <div className="border-t border-orange-100 my-3 sm:my-4" />

                                    <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-3 sm:mb-4">Payment Method</h3>
                                    <div className="p-2 sm:p-3 border border-orange-200 rounded-lg bg-orange-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-orange-900 text-sm sm:text-base">Cash on Delivery</span>
                                            <span className="text-xs sm:text-sm text-orange-700">Pay when you receive</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                        size="lg"
                                        disabled={!selectedAddress || cart.items.length === 0 || placingOrder}
                                        onClick={handlePlaceOrder}
                                    >
                                        {placingOrder ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Cart;