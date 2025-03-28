import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../../contexts/DeliveryContext';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const DeliveryDetailsScreen = ({ route, navigation }) => {
  // Make sure we're safely extracting the orderId from route params

  const orderId = route.params.order.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const { 
    activeDeliveries,
    getOrderDetails,
    updateOrderStatus
  } = useDelivery();

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided. Please go back and try again.');
      setLoading(false);
      return;
    }
    loadDeliveryDetails();
  }, [orderId]);

  const loadDeliveryDetails = async () => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Get full order details from API
      const details = await getOrderDetails(orderId);
      setOrderDetails(details);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Failed to load order details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

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
          latitude: address.latitude || 0,
          longitude: address.longitude || 0,
          formatted: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
        };
      }
      return { formatted: 'Address not available' };
    } catch (error) {
      console.error('Error parsing address:', error);
      return { formatted: addressJson || 'Address not available' };
    }
  };

  const handleMarkAsDelivered = () => {
    if (!orderId) {
      Alert.alert('Error', 'Cannot identify order');
      return;
    }
    
    Alert.alert(
      'Confirm Delivery',
      'Are you sure you want to mark this order as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              const success = await updateOrderStatus(orderId, 'delivered');
              if (success) {
                Alert.alert('Success', 'Order marked as delivered');
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status: ' + (error.message || 'Unknown error'));
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const openMapsApp = () => {
    if (!orderDetails) return;

    try {
      // Parse delivery address to get coordinates
      const address = parseDeliveryAddress(orderDetails.delivery_address);
      
      // Use latitude and longitude from parsed address or fallback to order details
      const latitude = address.latitude || orderDetails.latitude || 0;
      const longitude = address.longitude || orderDetails.longitude || 0;
      const hasCoordinates = latitude !== 0 && longitude !== 0;
      
      const encodedAddress = encodeURIComponent(address.formatted);
      let mapsUrl;
      
      if (hasCoordinates) {
        // Use coordinates if available
        mapsUrl = Platform.select({
          ios: `maps:0,0?q=${latitude},${longitude}`,
          android: `geo:0,0?q=${latitude},${longitude}`,
        });
      } else {
        // Fall back to address
        mapsUrl = Platform.select({
          ios: `maps:0,0?q=${encodedAddress}`,
          android: `geo:0,0?q=${encodedAddress}`,
        });
      }
      
      Linking.canOpenURL(mapsUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(mapsUrl);
          } else {
            // Fallback to web maps
            const webUrl = hasCoordinates 
              ? `https://maps.google.com/maps?q=${latitude},${longitude}`
              : `https://maps.google.com/maps?q=${encodedAddress}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch(err => {
          console.error('Error opening maps:', err);
          Alert.alert('Error', 'Could not open maps application');
        });
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Could not parse address information');
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
    return parseDeliveryAddress(addressJson).formatted;
  };

  if (loading) {
    return <LoadingIndicator message="Loading order details..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={loadDeliveryDetails} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Order information not available" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse address for display
  const addressData = parseDeliveryAddress(orderDetails.delivery_address);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>Order #{orderDetails.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {orderDetails.status === 'delivering' ? 'Delivering' : orderDetails.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Ionicons name="time-outline" size={16} color="#777" />
              <Text style={styles.timeText}>
                Created: {formatTime(orderDetails.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Location</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={20} color="#dc3545" />
          <Text style={styles.addressText}>{addressData.formatted}</Text>
        </View>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={openMapsApp}
        >
          <Text style={styles.mapButtonText}>Open in Maps</Text>
          <Ionicons name="open-outline" size={16} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        {orderDetails.customer && (
          <>
            <View style={styles.customerInfo}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <Text style={styles.infoText}>
                {orderDetails.customer.first_name} {orderDetails.customer.last_name}
              </Text>
            </View>
            {orderDetails.customer.phone && (
              <TouchableOpacity 
                style={styles.customerInfo}
                onPress={() => Linking.openURL(`tel:${orderDetails.customer.phone}`)}
              >
                <Ionicons name="call-outline" size={20} color="#28a745" style={styles.icon} />
                <Text style={[styles.infoText, styles.phoneText]}>
                  {orderDetails.customer.phone}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {!orderDetails.customer && (
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <Text style={styles.infoText}>{orderDetails.customer_name || 'Customer'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {orderDetails.items && orderDetails.items.length > 0 ? (
          orderDetails.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemPrice}>
                  ${parseFloat(item.price_at_time).toFixed(2)}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              {item.special_instructions && (
                <Text style={styles.itemNotes}>Note: {item.special_instructions}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>No items information available</Text>
        )}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>
            ${parseFloat(orderDetails.total_amount).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restaurant Information</Text>
        <View style={styles.branchInfo}>
          <Ionicons name="restaurant-outline" size={20} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>{orderDetails.branch_name || 'Restaurant'}</Text>
        </View>
      </View>

      

      {orderDetails.status === 'delivering' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.deliverButton}
            onPress={handleMarkAsDelivered}
          >
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  headerContainer: {
    marginBottom: 8
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  orderId: {
    fontSize: 18,
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
  timeContainer: {
    marginBottom: 8
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 4
  },
  mapButtonText: {
    color: '#0066cc',
    marginRight: 4,
    fontWeight: '500'
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  icon: {
    marginRight: 8
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  phoneText: {
    color: '#28a745',
    textDecorationLine: 'underline'
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4
  },
  noItems: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745'
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 30
  },
  deliverButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  itemPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500'
  },
  itemCategory: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic'
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  }
});

export default DeliveryDetailsScreen;