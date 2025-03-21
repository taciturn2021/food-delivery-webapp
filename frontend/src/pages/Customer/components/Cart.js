import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { getCustomerAddresses } from '../../../services/api';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import CustomerHeader from '../../../components/customer/CustomerHeader';

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
                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="hover:bg-orange-100 p-2 rounded-full transition-colors text-orange-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-semibold text-orange-900">Shopping Cart</h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="md:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <Card key={item.id} className="bg-white/95 backdrop-blur-sm border-orange-100">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-orange-900">{item.name}</h3>
                                                <p className="text-orange-600">
                                                    ${formatPrice((item.branch_price || item.price) * item.quantity)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center text-orange-900">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-orange-900 mb-4">Order Summary</h2>
                                    <div className="flex justify-between mb-4">
                                        <span className="text-orange-700">Subtotal:</span>
                                        <span className="font-medium text-orange-900">${formatPrice(getTotal())}</span>
                                    </div>

                                    <div className="border-t border-orange-100 my-4" />

                                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Delivery Address</h3>
                                    
                                    {loading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : addresses.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-orange-700 mb-4">
                                                No addresses found for this branch
                                            </p>
                                            <Button onClick={() => navigate('/customer/addresses')} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Add New Address
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-3 mb-4">
                                                {addresses.map((address) => (
                                                    <div
                                                        key={address.id}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                            selectedAddress?.id === address.id
                                                                ? 'border-orange-500 bg-orange-50'
                                                                : 'border-orange-200 hover:border-orange-500'
                                                        }`}
                                                        onClick={() => setSelectedAddress(address)}
                                                    >
                                                        <p className="font-medium text-orange-900">{address.street}</p>
                                                        <p className="text-sm text-orange-700">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                                                onClick={() => navigate('/customer/addresses')}
                                            >
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Add New Address
                                            </Button>
                                        </>
                                    )}

                                    <div className="border-t border-orange-100 my-4" />

                                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Payment Method</h3>
                                    <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-orange-900">Cash on Delivery</span>
                                            <span className="text-sm text-orange-700">Pay when you receive</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                        size="lg"
                                        disabled={!selectedAddress || cart.items.length === 0}
                                    >
                                        Place Order
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