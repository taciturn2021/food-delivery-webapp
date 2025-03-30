import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../../components/ui/use-toast';
import { getOrderById, cancelOrder } from '../../../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, 
  MapPin, 
  ShoppingBag, 
  Clock, 
  Store, 
  AlertTriangle, 
  Check, 
  Loader2,
  X,
  Home,
  Utensils,
  Bike
} from 'lucide-react';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import 'leaflet/dist/leaflet.css';

// Status display configuration
const orderStatusConfig = {
  'pending': { 
    label: 'Pending Confirmation', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: <Clock className="h-5 w-5" />
  },
  'preparing': { 
    label: 'Preparing', 
    color: 'bg-indigo-500',
    textColor: 'text-indigo-500',
    icon: <ShoppingBag className="h-5 w-5" />
  },
  'delivering': { 
    label: 'Out for Delivery', 
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: <MapPin className="h-5 w-5" />
  },
  'delivered': { 
    label: 'Delivered', 
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: <Check className="h-5 w-5" />
  },
  'cancelled': { 
    label: 'Cancelled', 
    color: 'bg-red-500',
    textColor: 'text-red-500',
    icon: <X className="h-5 w-5" />
  }
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const formatPrice = (price) => {
    return typeof price === 'string' ? parseFloat(price).toFixed(2) : '0.00';
  };

  const fetchOrder = useCallback(async () => {
    try {
      const response = await getOrderById(id);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]); // Remove refreshInterval from dependency array

  useEffect(() => {
    fetchOrder();
    
    // Create 30-second refresh interval for real-time updates
    const interval = setInterval(fetchOrder, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await cancelOrder(id);
      fetchOrder(); // Refresh after cancellation
      setCancelDialogOpen(false);
      
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Failed to cancel order",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancel = order && ['pending', 'preparing'].includes(order.status);

  return (
    <>
      <CustomerHeader />
      <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => navigate('/customer/orders')}
              className="hover:bg-orange-100 p-2 rounded-full transition-colors text-orange-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-orange-900">Order #{id}</h1>
            
            {order && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Badge 
                className={`ml-auto ${orderStatusConfig[order.status]?.color} text-white px-3 py-1 text-sm`}
              >
                <span className="flex items-center">
                  {orderStatusConfig[order.status]?.icon}
                  <span className="ml-1">{orderStatusConfig[order.status]?.label}</span>
                </span>
              </Badge>
            )}
            
            {order && (order.status === 'cancelled' || order.status === 'delivered') && (
              <Badge 
                className={`ml-auto ${orderStatusConfig[order.status]?.color} text-white px-3 py-1 text-sm`}
              >
                <span className="flex items-center">
                  {orderStatusConfig[order.status]?.icon}
                  <span className="ml-1">{orderStatusConfig[order.status]?.label}</span>
                </span>
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-orange-600">Loading order details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-700 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
              <Button 
                onClick={fetchOrder} 
                variant="outline" 
                className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : order ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Order Status Timeline */}
                <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-orange-900 mb-4">Order Status</h2>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-100"></div>
                      {['pending', 'preparing', 'delivering', 'delivered'].map((status, index) => {
                        const isCompleted = order.status === 'delivered' 
                          ? ['pending', 'preparing', 'delivering', 'delivered'].indexOf(status) <= ['pending', 'preparing', 'delivering', 'delivered'].indexOf(order.status)
                          : ['pending', 'preparing', 'delivering'].indexOf(status) <= ['pending', 'preparing', 'delivering'].indexOf(order.status);
                        
                        const isCurrent = order.status === status;
                        return (
                          <div key={status} className="flex mb-6 items-center relative">
                            <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full 
                              ${isCompleted 
                                ? orderStatusConfig[isCurrent ? status : status === 'delivered' ? 'delivered' : 'delivered'].color
                                : 'bg-gray-200'} 
                              ${isCompleted ? 'text-white' : 'text-gray-500'}`}
                            >
                              {isCompleted ? orderStatusConfig[isCurrent ? status : status === 'delivered' ? 'delivered' : 'delivered'].icon : index + 1}
                            </div>
                            <div className="ml-4">
                              <p className={`font-medium ${isCompleted && isCurrent ? orderStatusConfig[status].textColor : !isCompleted ? 'text-gray-500' : 'text-orange-600'}`}>
                                {orderStatusConfig[status].label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-orange-600">
                                  {status === 'pending' && 'Waiting for restaurant to confirm your order'}
                                  {status === 'preparing' && 'The restaurant is preparing your food'}
                                  {status === 'delivering' && 'Your food is on the way!'}
                                  {status === 'delivered' && 'Enjoy your meal!'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {order.status === 'cancelled' && (
                        <div className="flex mt-6 items-center">
                          <div className="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white">
                            <X className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-red-500">Order Cancelled</p>
                            <p className="text-sm text-red-600">This order has been cancelled</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-orange-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border-b border-orange-100 last:border-0">
                          <div>
                            <p className="font-medium text-orange-900">{item.name}</p>
                            <p className="text-sm text-orange-600">${formatPrice(item.price_at_time)} × {item.quantity}</p>
                            {item.special_instructions && (
                              <p className="text-xs text-gray-500 mt-1">Note: {item.special_instructions}</p>
                            )}
                          </div>
                          <p className="font-medium text-orange-900">${formatPrice(item.price_at_time) * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-orange-100">
                      <div className="flex justify-between">
                        <span className="font-medium text-orange-900">Total</span>
                        <span className="font-bold text-orange-900">${formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Delivery Information */}
                <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-orange-900 mb-4">Delivery Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Delivery Address</p>
                        <p className="font-medium text-orange-900">
                          {typeof order.delivery_address === 'string'
                            ? JSON.parse(order.delivery_address).street
                            : order.delivery_address?.street}
                        </p>
                        <p className="text-sm text-orange-700">
                          {typeof order.delivery_address === 'string'
                            ? `${JSON.parse(order.delivery_address).city}, ${JSON.parse(order.delivery_address).state} ${JSON.parse(order.delivery_address).zipCode}`
                            : `${order.delivery_address?.city}, ${order.delivery_address?.state} ${order.delivery_address?.zipCode}`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Restaurant</p>
                        <p className="font-medium text-orange-900">{order.branch_name}</p>
                      </div>

                      {order.rider_first_name && (
                        <div>
                          <p className="text-sm text-orange-600 mb-1">Delivery Rider</p>
                          <p className="font-medium text-orange-900">{order.rider_first_name} {order.rider_last_name}</p>
                          {order.rider_phone && <p className="text-sm text-orange-700">{order.rider_phone}</p>}
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Order Date</p>
                        <p className="font-medium text-orange-900">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {canCancel && (
                      <Button
                        variant="outline"
                        className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Map */}
                <Card className="bg-white/95 backdrop-blur-sm border-orange-100">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-orange-900 mb-4">Delivery Tracking</h2>
                    <div style={{ height: '300px', width: '100%' }}>
                      {(() => {
                        // Parse delivery address if it's a string
                        let deliveryAddress = order.delivery_address;
                        if (typeof deliveryAddress === 'string') {
                          try {
                            deliveryAddress = JSON.parse(deliveryAddress);
                          } catch (e) {
                            console.error('Error parsing delivery address:', e);
                          }
                        }
                        
                        // Check if we have valid location data
                        const hasCustomerLocation = deliveryAddress?.latitude && deliveryAddress?.longitude;
                        const hasBranchLocation = order.branch_latitude && order.branch_longitude;
                        const hasRiderLocation = order.rider_latitude && order.rider_longitude;
                        
                        // Determine center coordinates for the map
                        let center = [0, 0];
                        if (hasCustomerLocation) {
                          center = [parseFloat(deliveryAddress.latitude), parseFloat(deliveryAddress.longitude)];
                        } else if (hasBranchLocation) {
                          center = [parseFloat(order.branch_latitude), parseFloat(order.branch_longitude)];
                        } else if (hasRiderLocation) {
                          center = [parseFloat(order.rider_latitude), parseFloat(order.rider_longitude)];
                        }
                        
                        if (hasCustomerLocation || hasBranchLocation || hasRiderLocation) {
                          // Custom icon creation
                          const createCustomIcon = (IconComponent, color) => {
                            // Create a DOM element to render the SVG
                            const customIcon = L.divIcon({
                              html: `<div style="color: ${color}; background: white; border-radius: 50%; padding: 4px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  ${IconComponent === Home ? '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' : ''}
                                  ${IconComponent === Utensils ? '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18.5 15a2.5 2.5 0 0 0 0 5H23"/><path d="M21 22v-2"/>' : ''}
                                  ${IconComponent === Bike ? '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>' : ''}
                                </svg>
                              </div>`,
                              className: '',
                              iconSize: [30, 30],
                              iconAnchor: [15, 15]
                            });
                            return customIcon;
                          };

                          // Create the custom icons
                          const customerIcon = createCustomIcon(Home, '#1E40AF'); // Blue
                          const restaurantIcon = createCustomIcon(Utensils, '#9D174D'); // Pink/Purple
                          const riderIcon = createCustomIcon(Bike, '#047857'); // Green

                          return (
                            <MapContainer
                              center={center}
                              zoom={13}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              
                              {/* Customer location marker with custom icon */}
                              {hasCustomerLocation && (
                                <Marker 
                                  position={[parseFloat(deliveryAddress.latitude), parseFloat(deliveryAddress.longitude)]}
                                  icon={customerIcon}
                                >
                                  <Popup>Delivery Location</Popup>
                                </Marker>
                              )}
                              
                              {/* Branch location marker with custom icon */}
                              {hasBranchLocation && (
                                <Marker 
                                  position={[parseFloat(order.branch_latitude), parseFloat(order.branch_longitude)]}
                                  icon={restaurantIcon}
                                >
                                  <Popup>{order.branch_name}</Popup>
                                </Marker>
                              )}
                              
                              {/* Rider location marker with custom icon */}
                              {hasRiderLocation && order.status !== 'delivered' && (
                                <Marker 
                                  position={[parseFloat(order.rider_latitude), parseFloat(order.rider_longitude)]}
                                  icon={riderIcon}
                                >
                                  <Popup>{order.rider_first_name} {order.rider_last_name} (Rider)</Popup>
                                </Marker>
                              )}
                            </MapContainer>
                          );
                        } else {
                          return (
                            <div className="h-full flex flex-col items-center justify-center bg-orange-50 rounded border border-orange-200 p-4">
                              <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
                              <p className="text-orange-600 text-center">Location data unavailable</p>
                              <p className="text-orange-400 text-sm text-center mt-1">The delivery locations couldn't be loaded</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded text-orange-700 mb-6">
              <p>Order not found. It may have been cancelled or removed.</p>
              <Button 
                onClick={() => navigate('/customer/orders')} 
                variant="outline" 
                className="mt-4 text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Back to Orders
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Order?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              No, Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderTracking;