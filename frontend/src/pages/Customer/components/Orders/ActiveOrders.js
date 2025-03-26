import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerActiveOrders } from '../../../../services/api';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Loader2, 
  AlertTriangle, 
  Clock,
  Store,
  MapPin,
  ArrowRight,
  Check,
  X 
} from 'lucide-react';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';

// Status display configuration
const orderStatusConfig = {
  'pending': { 
    label: 'Pending', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: <Clock className="h-4 w-4" />
  },
  'confirmed': { 
    label: 'Confirmed', 
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: <Check className="h-4 w-4" />
  },
  'preparing': { 
    label: 'Preparing', 
    color: 'bg-indigo-500',
    textColor: 'text-indigo-500',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  'ready': { 
    label: 'Ready', 
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    icon: <Store className="h-4 w-4" />
  },
  'out_for_delivery': { 
    label: 'Out for Delivery', 
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: <MapPin className="h-4 w-4" />
  },
  'delivered': { 
    label: 'Delivered', 
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: <Check className="h-4 w-4" />
  },
  'cancelled': { 
    label: 'Cancelled', 
    color: 'bg-red-500',
    textColor: 'text-red-500',
    icon: <X className="h-4 w-4" />
  }
};

const ActiveOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const fetchActiveOrders = async () => {
    try {
      const response = await getCustomerActiveOrders();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      setError('Failed to load orders. Please try again.');
      
      // Clear interval if error
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    
    // Create 1-minute refresh interval for real-time updates
    const interval = setInterval(fetchActiveOrders, 60000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const handleViewOrder = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  return (
    <>
      <CustomerHeader />
      <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost"
              className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-orange-900">Active Orders</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActiveOrders}
              className="ml-auto border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Refresh
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              className="text-orange-600 hover:bg-orange-100 font-medium"
              onClick={() => navigate('/customer/orders/history')}
            >
              View Order History
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-orange-600">Loading your active orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-700 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
              <Button 
                onClick={fetchActiveOrders} 
                variant="outline" 
                className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
              <CardContent className="p-8 flex flex-col items-center">
                <ShoppingBag className="h-12 w-12 text-orange-300 mb-4" />
                <h2 className="text-xl font-semibold text-orange-900 mb-2">No Active Orders</h2>
                <p className="text-orange-600 text-center mb-6">
                  You don't have any active orders at the moment.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                >
                  Browse Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map(order => (
                <Card key={order.id} className="bg-white/95 backdrop-blur-sm border-orange-100">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-orange-900">Order #{order.id}</h3>
                          <Badge 
                            className={`${orderStatusConfig[order.status]?.color} text-white px-3 py-1 text-xs`}
                          >
                            <span className="flex items-center">
                              {orderStatusConfig[order.status]?.icon}
                              <span className="ml-1">{orderStatusConfig[order.status]?.label}</span>
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-600 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-900">
                          Total: ${formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm text-orange-600 mt-1">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-orange-600 mb-1">Delivering to:</p>
                      <p className="font-medium text-orange-900">
                        {order.delivery_address?.street}
                      </p>
                      <p className="text-sm text-orange-700">
                        {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.zipCode}
                      </p>
                    </div>

                    <div className="flex items-center border-t border-orange-100 pt-4">
                      <Store className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-orange-900">{order.branch_name}</span>
                      <Button
                        className="ml-auto"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        Track Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActiveOrders;