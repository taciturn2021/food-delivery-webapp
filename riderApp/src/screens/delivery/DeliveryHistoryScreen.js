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
    fetchActiveDeliveries
  } = useDelivery();

  useEffect(() => {
    fetchActiveDeliveries();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderHistoryItem = ({ item: delivery }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => {}}
    >
      <View style={styles.deliveryHeader}>
        <Text style={styles.deliveryId}>Order #{delivery.id}</Text>
        <View style={styles.deliveredBadge}>
          <Text style={styles.statusText}>Delivered</Text>
        </View>
      </View>
      
      <Text style={styles.deliveryAddress} numberOfLines={2}>
        {delivery.delivery_address}
      </Text>
      
      <View style={styles.deliveryDates}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={16} color="#777" />
          <Text style={styles.dateText}>
            Assigned: {formatTime(delivery.assigned_at)}
          </Text>
        </View>
        
        <View style={styles.dateItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#28a745" />
          <Text style={styles.dateText}>
            Completed: {formatTime(delivery.completed_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          onRetry={fetchActiveDeliveries} 
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
    paddingTop: 12
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