import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DeliveryContext = createContext();

export const useDelivery = () => useContext(DeliveryContext);

export const DeliveryProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get all active and completed deliveries for the rider
  const fetchDeliveries = useCallback(async () => {
    if (!user) {
      console.log('No user available, skipping deliveries fetch');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching assigned orders for the rider');
      const response = await api.getRiderOrders();
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const allDeliveries = response.data || [];
      
      // Filter orders based on status
      const active = allDeliveries.filter(order => 
        order.status === 'delivering'
      );
      
      const history = allDeliveries.filter(order => 
        order.status === 'delivered' || order.status === 'cancelled'
      );
      
      setActiveDeliveries(active);
      setDeliveryHistory(history);
      console.log(`Fetched ${active.length} active deliveries and ${history.length} completed deliveries`);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);
  
  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeliveries();
  }, [fetchDeliveries]);
  
  // Get detailed information for a specific order
  const getOrderDetails = useCallback(async (orderId) => {
    if (!user || !orderId) {
      console.log('No user or order ID available, cannot fetch order details');
      return null;
    }
    
    try {
      console.log(`Fetching details for order ${orderId}`);
      const response = await api.getDeliveryInformation(orderId);
      
      if (!response.data) {
        throw new Error('No order data received');
      }
      console.log(`Fetched details for order ${orderId}`, response.data);

      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order details for order ${orderId}:`, error);
      throw error;
    }
  }, [user]);
  
  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (!user || !orderId) {
      console.log('No user or order ID available, cannot update order status');
      return false;
    }
    
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      await api.updateOrderStatus(orderId, status);
      
      // Update local state based on new status
      if (status === 'delivered') {
        // Find the order that was delivered
        const deliveredOrder = activeDeliveries.find(order => order.id === orderId);
        
        if (deliveredOrder) {
          // Remove from active deliveries
          setActiveDeliveries(prev => prev.filter(order => order.id !== orderId));
          
          // Add to history with updated status
          setDeliveryHistory(prev => [
            { ...deliveredOrder, status: 'delivered', completed_at: new Date().toISOString() },
            ...prev
          ]);
        }
      }
      
      // Refresh the deliveries list to ensure everything is updated
      fetchDeliveries();
      return true;
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error);
      Alert.alert('Error', 'Failed to update order status');
      return false;
    }
  }, [user, activeDeliveries, fetchDeliveries]);
  
  // Fetch deliveries when the context is initialized or when user changes
  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user, fetchDeliveries]);
  
  const value = {
    activeDeliveries,
    deliveryHistory,
    isLoading,
    error,
    refreshing,
    fetchDeliveries,
    handleRefresh,
    getOrderDetails,
    updateOrderStatus
  };
  
  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};

export default DeliveryContext;