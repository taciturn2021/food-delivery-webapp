import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DeliveryContext = createContext(null);

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

export const DeliveryProvider = ({ children }) => {
  const { user, riderId } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (riderId) {
      fetchActiveDeliveries();
    }
  }, [riderId]);

  const fetchActiveDeliveries = async () => {
    if (!riderId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getRiderOrders(riderId);
      const orders = response.data;
      
      // Filter active and completed orders
      setActiveDeliveries(orders.filter(order => 
        ['assigned', 'picked'].includes(order.delivery_status)
      ));
      setDeliveryHistory(orders.filter(order => 
        order.delivery_status === 'delivered'
      ));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to fetch deliveries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActiveDeliveries();
    setRefreshing(false);
  };

  const updateDeliveryStatus = async (orderId, assignmentId, newStatus) => {
    try {
      await api.updateDeliveryStatus(orderId, assignmentId, newStatus);
      
      // Update local state
      setActiveDeliveries(prev => prev.map(delivery => {
        if (delivery.order_id === orderId) {
          return { ...delivery, delivery_status: newStatus };
        }
        return delivery;
      }));

      // If delivery is completed, move it to history
      if (newStatus === 'delivered') {
        const completedDelivery = activeDeliveries.find(d => d.order_id === orderId);
        if (completedDelivery) {
          setActiveDeliveries(prev => prev.filter(d => d.order_id !== orderId));
          setDeliveryHistory(prev => [{ ...completedDelivery, delivery_status: 'delivered' }, ...prev]);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      Alert.alert('Error', 'Failed to update delivery status. Please try again.');
      return false;
    }
  };

  const startDelivery = async (orderId) => {
    try {
      await api.startDelivery(orderId);
      await fetchActiveDeliveries(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error starting delivery:', error);
      Alert.alert('Error', 'Failed to start delivery. Please try again.');
      return false;
    }
  };

  const completeDelivery = async (orderId) => {
    try {
      await api.completeDelivery(orderId);
      await fetchActiveDeliveries(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error completing delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
      return false;
    }
  };

  return (
    <DeliveryContext.Provider
      value={{
        activeDeliveries,
        deliveryHistory,
        isLoading,
        refreshing,
        error,
        fetchActiveDeliveries,
        handleRefresh,
        updateDeliveryStatus,
        startDelivery,
        completeDelivery
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};