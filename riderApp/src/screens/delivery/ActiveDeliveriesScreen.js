import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
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
    fetchActiveDeliveries,
    setDeliveryAsPicked,
    setDeliveryAsDelivered
  } = useDelivery();

  useEffect(() => {
    fetchActiveDeliveries();
  }, []);

  const handleStatusUpdate = async (delivery) => {
    if (delivery.delivery_status === 'assigned') {
      Alert.alert(
        'Update Status',
        'Are you ready to pick up this order?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Mark as Picked Up',
            onPress: () => setDeliveryAsPicked(delivery.id, delivery.assignment_id)
          }
        ]
      );
    } else if (delivery.delivery_status === 'picked') {
      Alert.alert(
        'Update Status',
        'Confirm delivery completion?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Confirm Delivery',
            style: 'default',
            onPress: () => setDeliveryAsDelivered(delivery.id, delivery.assignment_id)
          }
        ]
      );
    }
  };

  const renderDeliveryItem = ({ item: delivery }) => (
    <TouchableOpacity
      style={styles.deliveryItem}
      onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: delivery.id })}
    >
      <View style={styles.deliveryHeader}>
        <Text style={styles.deliveryId}>Order #{delivery.id}</Text>
        <View style={[
          styles.statusBadge, 
          delivery.delivery_status === 'picked' ? styles.pickedBadge : styles.assignedBadge
        ]}>
          <Text style={styles.statusText}>
            {delivery.delivery_status === 'picked' ? 'In Transit' : 'Pickup'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.deliveryAddress} numberOfLines={2}>
        {delivery.delivery_address}
      </Text>
      
      <View style={styles.deliveryInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#777" />
          <Text style={styles.infoText}>
            Assigned: {new Date(delivery.assigned_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('DeliveryMapScreen', { 
            latitude: delivery.latitude,
            longitude: delivery.longitude,
            address: delivery.delivery_address
          })}
        >
          <Ionicons name="map-outline" size={16} color="#0066cc" />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            delivery.delivery_status === 'picked' ? styles.deliverButton : styles.pickupButton
          ]}
          onPress={() => handleStatusUpdate(delivery)}
        >
          <Text style={styles.actionButtonText}>
            {delivery.delivery_status === 'picked' ? 'Mark as Delivered' : 'Mark as Picked'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
          onRetry={fetchActiveDeliveries} 
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
    borderRadius: 4
  },
  assignedBadge: {
    backgroundColor: '#fff3cd'
  },
  pickedBadge: {
    backgroundColor: '#cce5ff'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
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
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  pickupButton: {
    backgroundColor: '#ffc107'
  },
  deliverButton: {
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