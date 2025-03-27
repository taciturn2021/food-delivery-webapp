import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrderHistory } from '../../../../services/api';
import { 
  ArrowLeft, 
  History, 
  Loader2, 
  AlertTriangle, 
  Clock,
  Store,
  MapPin,
  ArrowRight,
  Check,
  X,
  Search 
} from 'lucide-react';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

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
    icon: <Clock className="h-4 w-4" />
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

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const fetchOrderHistory = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await getCustomerOrderHistory(pageNumber);
      
      // Add debugging information
      
      // Check if orders array exists and is an array
      if (!response.data.orders || !Array.isArray(response.data.orders)) {
        console.error('Invalid orders data format:', response.data);
        setError('Invalid response format from server');
        setOrders([]);
        setFilteredOrders([]);
        return;
      }
      
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history. Please try again.');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory(page);
  }, [page]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = orders.filter(order => 
        order.id.toString().includes(term) || 
        order.branch_name.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term) ||
        order.delivery_address?.street.toLowerCase().includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term)) ||
        order.items.some(item => item.description.toLowerCase().includes(term))
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const handleViewOrder = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
              onClick={() => navigate('/customer/orders')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-orange-900">Order History</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrderHistory(page)}
              className="ml-auto border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Refresh
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by order number, restaurant, item, etc."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-orange-600">Loading your order history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-700 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
              <Button 
                onClick={() => fetchOrderHistory(page)} 
                variant="outline" 
                className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
              <CardContent className="p-8 flex flex-col items-center">
                <History className="h-12 w-12 text-orange-300 mb-4" />
                <h2 className="text-xl font-semibold text-orange-900 mb-2">No Orders Found</h2>
                <p className="text-orange-600 text-center mb-6">
                  {searchTerm ? 
                    'No orders match your search criteria.' : 
                    'You don\'t have any past orders yet.'
                  }
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
            <>
              <div className="grid gap-6">
                {filteredOrders.map(order => (
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
                        <p className="text-sm text-orange-600 mb-1">Delivered to:</p>
                        {order.delivery_address ? (
                          <>
                            <p className="font-medium text-orange-900">
                              {typeof order.delivery_address === 'string' 
                                ? JSON.parse(order.delivery_address).street 
                                : order.delivery_address.street}
                            </p>
                            <p className="text-sm text-orange-700">
                              {typeof order.delivery_address === 'string' 
                                ? `${JSON.parse(order.delivery_address).city}, ${JSON.parse(order.delivery_address).state} ${JSON.parse(order.delivery_address).zipCode}`
                                : `${order.delivery_address.city}, ${order.delivery_address.state} ${order.delivery_address.zipCode}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-orange-700">No address information available</p>
                        )}
                      </div>

                      <div className="flex items-center border-t border-orange-100 pt-4">
                        <Store className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-orange-900">{order.branch_name}</span>
                        <Button
                          variant="outline"
                          className="ml-auto border-orange-200 text-orange-700 hover:bg-orange-50"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="text-orange-900">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;