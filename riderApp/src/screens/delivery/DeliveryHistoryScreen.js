import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../../contexts/DeliveryContext';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const DeliveryHistoryScreen = ({ navigation }) => {
  const { 
    deliveryHistory, 
    isLoading, 
    error, 
    refreshing, 
    handleRefresh, 
    fetchDeliveries
  } = useDelivery();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Helper function to parse address JSON
  const parseDeliveryAddress = (addressJson) => {
    try {
      if (typeof addressJson === 'string') {
        const address = JSON.parse(addressJson);
        return {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          formatted: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
        };
      }
      return { formatted: 'Address not available' };
    } catch (error) {
      console.error('Error parsing address:', error);
      return { formatted: addressJson || 'Address not available' };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (addressJson) => {
    const address = parseDeliveryAddress(addressJson);
    return address.formatted;
  };

  const renderHistoryItem = ({ item: order }) => {
    // Get the formatted address
    const formattedAddress = formatAddress(order.delivery_address);
    
    // Choose badge color based on status
    const badgeStyle = order.status === 'delivered' 
      ? [styles.deliveredBadge, { backgroundColor: '#d4edda' }]
      : [styles.deliveredBadge, { backgroundColor: '#f8d7da' }];
      
    const statusTextStyle = order.status === 'delivered'
      ? [styles.statusText, { color: '#155724' }]
      : [styles.statusText, { color: '#721c24' }];

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => {
          // Add logging to debug the orderId
          
          console.log('Navigating to DeliveryDetails with orderId:', order.id);
          navigation.navigate('DeliveryDetails', { order });
        }}
      >
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryId}>Order #{order.id}</Text>
          <View style={badgeStyle}>
            <Text style={statusTextStyle}>
              {order.status === 'delivered' ? 'Delivered' : 'Cancelled'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.deliveryAddress} numberOfLines={2}>
          {formattedAddress}
        </Text>
        
        <View style={styles.deliveryDates}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={16} color="#777" />
            <Text style={styles.dateText}>
              Created: {formatTime(order.created_at)}
            </Text>
          </View>
          
          <View style={styles.dateItem}>
            <Ionicons 
              name={order.status === 'delivered' ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={16} 
              color={order.status === 'delivered' ? "#28a745" : "#dc3545"} 
            />
            <Text style={styles.dateText}>
              {order.status === 'delivered' ? 'Completed: ' : 'Cancelled: '}
              {formatTime(order.completed_at)}
            </Text>
          </View>
        </View>
        
        {order.branch_name && (
          <View style={styles.branchInfo}>
            <Ionicons name="restaurant-outline" size={16} color="#777" />
            <Text style={styles.branchText}>{order.branch_name}</Text>
            <Text style={styles.priceText}>${parseFloat(order.total_amount).toFixed(2)}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time" size={60} color="#cccccc" />
      <Text style={styles.emptyText}>No delivery history</Text>
      <Text style={styles.emptySubText}>
        Completed deliveries will appear here
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingIndicator message="Loading delivery history..." />;
  }

  return (
    <View style={styles.container}>
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchDeliveries} 
        />
      )}
      
      <FlatList
        data={deliveryHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  deliveredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#d4edda'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724'
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12
  },
  deliveryDates: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 8
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666'
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  branchText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    textAlign: 'center'
  }
});

export default DeliveryHistoryScreen;