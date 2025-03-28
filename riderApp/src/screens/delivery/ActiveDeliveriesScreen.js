import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../../contexts/DeliveryContext';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const ActiveDeliveriesScreen = ({ navigation }) => {
  const { 
    activeDeliveries, 
    isLoading, 
    error, 
    refreshing, 
    handleRefresh, 
    fetchDeliveries,
    updateOrderStatus
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
        formatted: `${address.street}, ${address.city}, ${address.state}`
      };
    }
    return { formatted: 'Address not available' };
  } catch (error) {
    console.error('Error parsing address:', error);
    return { formatted: addressJson || 'Address not available' };
  }
};

const truncateAddress = (addressText) => {
  if (!addressText) return 'No address provided';
  return addressText.length > 35 ? addressText.substring(0, 35) + '...' : addressText;
};

  const handleMarkAsDelivered = (orderId) => {
    Alert.alert(
      'Confirm Delivery',
      'Are you sure you want to mark this order as delivered?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            updateOrderStatus(orderId, 'delivered');
          }
        }
      ],
      { cancelable: true }
    );
  };

  
  const renderDeliveryItem = ({ item: order }) => {
    // Parse and format the address
    const parsedAddress = parseDeliveryAddress(order.delivery_address);
    // Truncate the formatted address
    const displayAddress = truncateAddress(parsedAddress.formatted);
    
    return (
      <TouchableOpacity
        style={styles.deliveryItem}
        onPress={() => navigation.navigate('DeliveryDetails', { order })}
      >
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryId}>Order #{order.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Delivering</Text>
          </View>
        </View>
        
        <Text style={styles.deliveryAddress} numberOfLines={2}>
          {displayAddress}
        </Text>
        
        <View style={styles.deliveryInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#777" />
            <Text style={styles.infoText}>
              Created: {new Date(order.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="restaurant-outline" size={16} color="#777" />
            <Text style={styles.infoText}>
              From: {order.branch_name || 'Restaurant'}
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('DeliveryMapScreen', { 
              latitude: order.branch_latitude,
              longitude: order.branch_longitude,
              address: order.delivery_address,
              orderId: order.id
            })}
          >
            <Ionicons name="map-outline" size={16} color="#0066cc" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deliverButton}
            onPress={() => handleMarkAsDelivered(order.id)}
          >
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bicycle" size={60} color="#cccccc" />
      <Text style={styles.emptyText}>No active deliveries</Text>
      <Text style={styles.emptySubText}>
        Assigned deliveries will appear here
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingIndicator message="Loading deliveries..." />;
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
        data={activeDeliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDeliveryItem}
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
  deliveryItem: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#cce5ff'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc'
  },
  deliveryAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12
  },
  deliveryInfo: {
    marginBottom: 16
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666'
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  mapButtonText: {
    marginLeft: 4,
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500'
  },
  deliverButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#28a745'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
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

export default ActiveDeliveriesScreen;