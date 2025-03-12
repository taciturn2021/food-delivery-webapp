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
  const fetchActiveDeliveries = useCallback(async () => {
    if (!user || !user.id) {
      console.log('No user ID available, skipping deliveries fetch');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getRiderOrders(user.id);
      
      // Process deliveries into active and history
      const allDeliveries = response.data || [];
      const active = allDeliveries.filter(d => 
        ['assigned', 'picked'].includes(d.delivery_status)
      );
      const history = allDeliveries.filter(d => 
        ['delivered', 'cancelled'].includes(d.delivery_status)
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
    fetchActiveDeliveries();
  }, [fetchActiveDeliveries]);
  
  // Update delivery status: Assigned -> Picked -> Delivered
  const setDeliveryAsPicked = useCallback(async (orderId, assignmentId) => {
    if (!user) return false;
    
    try {
      await api.updateDeliveryStatus(orderId, assignmentId, 'picked');
      
      // Update local state
      setActiveDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === orderId 
            ? { ...delivery, delivery_status: 'picked' }
            : delivery
        )
      );
      
      console.log(`Delivery ${orderId} status updated to picked`);
      return true;
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      Alert.alert('Error', 'Failed to update delivery status');
      return false;
    }
  }, [user]);
  
  // Mark delivery as delivered
  const setDeliveryAsDelivered = useCallback(async (orderId, assignmentId) => {
    if (!user) return false;
    
    try {
      await api.updateDeliveryStatus(orderId, assignmentId, 'delivered');
      
      // Update local state - move to history
      const deliveredOrder = activeDeliveries.find(delivery => delivery.id === orderId);
      
      if (deliveredOrder) {
        // Remove from active deliveries
        setActiveDeliveries(prev => prev.filter(delivery => delivery.id !== orderId));
        
        // Add to history with updated status
        setDeliveryHistory(prev => [
          { ...deliveredOrder, delivery_status: 'delivered', completed_at: new Date().toISOString() },
          ...prev
        ]);
      }
      
      console.log(`Delivery ${orderId} marked as delivered`);
      return true;
    } catch (error) {
      console.error('Failed to mark delivery as delivered:', error);
      Alert.alert('Error', 'Failed to mark delivery as delivered');
      return false;
    }
  }, [user, activeDeliveries]);
  
  // Fetch deliveries when the context is initialized or when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchActiveDeliveries();
    }
  }, [user, fetchActiveDeliveries]);
  
  const value = {
    activeDeliveries,
    deliveryHistory,
    isLoading,
    error,
    refreshing,
    fetchActiveDeliveries,
    handleRefresh,
    setDeliveryAsPicked,
    setDeliveryAsDelivered
  };
  
  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};

export default DeliveryContext;