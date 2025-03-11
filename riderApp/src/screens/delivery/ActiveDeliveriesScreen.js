import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, 
  Surface, 
  useTheme, 
  Button, 
  Chip,
  Title,
  Caption,
  Divider,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDelivery } from '../../contexts/DeliveryContext';

const ActiveDeliveriesScreen = ({ navigation }) => {
  const theme = useTheme();
  const { 
    activeDeliveries, 
    isLoading, 
    refreshing, 
    handleRefresh,
    updateDeliveryStatus 
  } = useDelivery();

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return { bg: '#FFF9C4', text: '#F57F17' };
      case 'picked':
        return { bg: '#E3F2FD', text: '#1976D2' };
      default:
        return { bg: '#EEEEEE', text: '#757575' };
    }
  };

  const handleStatusUpdate = async (orderId, assignmentId, currentStatus) => {
    // Determine next status based on current status
    const newStatus = currentStatus === 'assigned' ? 'picked' : 'delivered';
    await updateDeliveryStatus(orderId, assignmentId, newStatus);
  };

  const renderDeliveryItem = ({ item }) => {
    const statusStyle = getStatusColor(item.delivery_status);
    
    return (
      <Surface style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <View>
            <Title style={styles.orderNumber}>Order #{item.id}</Title>
            <Caption>{new Date(item.created_at).toLocaleString()}</Caption>
          </View>
          <Chip 
            mode="flat" 
            style={{ backgroundColor: statusStyle.bg }}
            textStyle={{ color: statusStyle.text, fontWeight: 'bold' }}
          >
            {item.delivery_status === 'assigned' ? 'New' : 
             item.delivery_status === 'picked' ? 'Picked Up' : 
             item.delivery_status}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.locationContainer}>
          {/* Restaurant location */}
          <View style={styles.locationItem}>
            <MaterialCommunityIcons 
              name="store" 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.locationText}>
              <Text numberOfLines={1} style={styles.locationName}>
                {item.branch_name}
              </Text>
              <Text numberOfLines={2} style={styles.address}>
                {item.branch_address}
              </Text>
            </View>
          </View>

          {/* Delivery location */}
          <View style={[styles.locationItem, { marginTop: 12 }]}>
            <MaterialCommunityIcons 
              name="map-marker" 
              size={24} 
              color={theme.colors.accent} 
            />
            <View style={styles.locationText}>
              <Text numberOfLines={1} style={styles.locationName}>
                {item.customer_name}
              </Text>
              <Text numberOfLines={2} style={styles.address}>
                {item.delivery_address}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button 
            mode="contained"
            onPress={() => handleStatusUpdate(
              item.id, 
              item.assignment_id, 
              item.delivery_status
            )}
            style={styles.actionButton}
          >
            {item.delivery_status === 'assigned' ? 'Mark as Picked Up' : 'Complete Delivery'}
          </Button>
          <Button 
            mode="outlined"
            onPress={() => navigation.navigate('DeliveryMap', { 
              deliveryId: item.id,
              destination: {
                latitude: item.delivery_latitude,
                longitude: item.delivery_longitude,
                address: item.delivery_address
              },
              origin: {
                latitude: item.branch_latitude,
                longitude: item.branch_longitude,
                address: item.branch_address
              }
            })}
            icon="map"
            style={styles.mapButton}
          >
            Navigate
          </Button>
        </View>
      </Surface>
    );
  };

  if (isLoading && !refreshing && activeDeliveries.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={activeDeliveries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderDeliveryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={80} 
              color={theme.colors.disabled} 
            />
            <Text style={styles.emptyText}>No active deliveries</Text>
            <Button 
              mode="contained" 
              onPress={handleRefresh}
              style={styles.refreshButton}
            >
              Refresh
            </Button>
          </View>
        }
      />
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="history"
        label="History"
        onPress={() => navigation.navigate('DeliveryHistory')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  deliveryCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 12,
  },
  locationContainer: {
    marginVertical: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  locationName: {
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  mapButton: {
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    marginVertical: 16,
  },
  refreshButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ActiveDeliveriesScreen;