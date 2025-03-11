import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Alert, 
  Platform 
} from 'react-native';
import { 
  Text, 
  Surface, 
  useTheme, 
  Button, 
  Title, 
  Subheading, 
  Caption, 
  Divider,
  Chip,
  List,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { DeliveryContext } from '../../contexts/DeliveryContext';
import api from '../../services/api';

const DeliveryDetailsScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const theme = useTheme();
  const { 
    activeDeliveries, 
    startDelivery, 
    completeDelivery,
    updateDeliveryStatus 
  } = useContext(DeliveryContext);
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  
  // Find the delivery in active deliveries
  useEffect(() => {
    const currentDelivery = activeDeliveries.find(d => d.order_id === deliveryId);
    
    if (currentDelivery) {
      setDelivery(currentDelivery);
      
      // Fetch order items
      fetchOrderItems(deliveryId);
    }
    
    setLoading(false);
  }, [deliveryId, activeDeliveries]);
  
  // Fetch order items details
  const fetchOrderItems = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/items`);
      setOrderItems(response.data);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };
  
  // Handle picking up the order
  const handlePickUp = async () => {
    Alert.alert(
      'Confirm Pick Up',
      'Have you picked up this order from the restaurant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Picked Up',
          onPress: async () => {
            const success = await updateDeliveryStatus(deliveryId, 'picked_up');
            if (success) {
              // Start delivery tracking
              await startDelivery(deliveryId);
            }
          }
        }
      ]
    );
  };
  
  // Handle completing the delivery
  const handleDeliveryComplete = () => {
    Alert.alert(
      'Confirm Delivery',
      'Has this order been delivered to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delivered',
          onPress: async () => {
            const success = await completeDelivery(deliveryId);
            
            if (success) {
              Alert.alert(
                'Delivery Completed',
                'Thank you for completing this delivery!',
                [{ text: 'OK', onPress: () => navigation.navigate('ActiveDeliveries') }]
              );
            }
          }
        }
      ]
    );
  };
  
  // Copy address to clipboard
  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Address copied to clipboard');
  };
  
  // Open phone dialer
  const callCustomer = (phoneNumber) => {
    if (!phoneNumber) return;
    
    const formattedNumber = `tel:${phoneNumber}`;
    Linking.canOpenURL(formattedNumber)
      .then(supported => {
        if (supported) {
          return Linking.openURL(formattedNumber);
        } else {
          Alert.alert('Error', 'Phone call not supported on this device');
        }
      })
      .catch(err => console.error('Error making phone call:', err));
  };
  
  // Open maps app with directions
  const openMapsWithDirections = (lat, lng, label) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios' 
      ? `${scheme}?q=${label}&ll=${lat},${lng}`
      : `${scheme}${lat},${lng}?q=${label}`;
      
    Linking.openURL(url).catch(err => 
      console.error('Error opening maps app:', err)
    );
  };
  
  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'assigned':
        return { label: 'New Order', color: '#F57F17', icon: 'package-variant' };
      case 'picked_up':
        return { label: 'Picked Up', color: '#1976D2', icon: 'package-up' };
      case 'in_progress':
        return { label: 'In Progress', color: '#2E7D32', icon: 'truck-delivery' };
      case 'completed':
        return { label: 'Delivered', color: '#43A047', icon: 'check-circle' };
      default:
        return { label: status, color: '#757575', icon: 'information' };
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading delivery details...</Text>
      </View>
    );
  }
  
  if (!delivery) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Delivery not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.goBackButton}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  const statusInfo = getStatusInfo(delivery.status);
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Order Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.orderHeader}>
          <Title style={styles.orderTitle}>Order #{delivery.order_id}</Title>
          <Chip 
            mode="flat" 
            style={{ backgroundColor: statusInfo.color + '20' }}
            textStyle={{ color: statusInfo.color }}
            icon={() => (
              <MaterialCommunityIcons name={statusInfo.icon} size={20} color={statusInfo.color} />
            )}
          >
            {statusInfo.label}
          </Chip>
        </View>
        
        <View style={styles.orderMeta}>
          <Caption>Order Time</Caption>
          <Text>{new Date(delivery.created_at).toLocaleString()}</Text>
        </View>
      </Surface>
      
      {/* Restaurant Info */}
      <Surface style={styles.infoCard}>
        <Title style={styles.sectionTitle}>Pickup from</Title>
        
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons name="store" size={28} color={theme.colors.primary} />
            <View style={styles.locationDetails}>
              <Subheading>{delivery.restaurant_name}</Subheading>
              <Caption>{delivery.restaurant_phone || 'No phone available'}</Caption>
            </View>
            
            {delivery.restaurant_phone && (
              <TouchableOpacity
                onPress={() => callCustomer(delivery.restaurant_phone)}
                style={styles.callButton}
              >
                <MaterialCommunityIcons name="phone" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => copyToClipboard(delivery.restaurant_address)}
            onLongPress={() => openMapsWithDirections(
              delivery.restaurant_lat, 
              delivery.restaurant_lng, 
              delivery.restaurant_name
            )}
          >
            <Text style={styles.address}>{delivery.restaurant_address}</Text>
            <Caption>Tap to copy, long press for directions</Caption>
          </TouchableOpacity>
        </View>
      </Surface>
      
      {/* Customer Info */}
      <Surface style={styles.infoCard}>
        <Title style={styles.sectionTitle}>Deliver to</Title>
        
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons name="account" size={28} color={theme.colors.primary} />
            <View style={styles.locationDetails}>
              <Subheading>{delivery.customer_name}</Subheading>
              <Caption>{delivery.customer_phone || 'No phone available'}</Caption>
            </View>
            
            {delivery.customer_phone && (
              <TouchableOpacity
                onPress={() => callCustomer(delivery.customer_phone)}
                style={styles.callButton}
              >
                <MaterialCommunityIcons name="phone" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => copyToClipboard(delivery.delivery_address)}
            onLongPress={() => openMapsWithDirections(
              delivery.delivery_lat, 
              delivery.delivery_lng, 
              'Delivery: ' + delivery.customer_name
            )}
          >
            <Text style={styles.address}>{delivery.delivery_address}</Text>
            <Caption>Tap to copy, long press for directions</Caption>
          </TouchableOpacity>
        </View>
      </Surface>
      
      {/* Order Items */}
      <Surface style={styles.infoCard}>
        <Title style={styles.sectionTitle}>Order Items</Title>
        
        {orderItems.length > 0 ? (
          orderItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.name}
                description={item.description}
                left={() => (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}×</Text>
                  </View>
                )}
                right={() => <Text>${item.price.toFixed(2)}</Text>}
              />
              {index < orderItems.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <Text style={styles.noItemsText}>No item details available</Text>
        )}
        
        <Divider style={styles.totalDivider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${delivery.total_amount ? delivery.total_amount.toFixed(2) : '0.00'}
          </Text>
        </View>
      </Surface>
      
      {/* Delivery Info */}
      <Surface style={styles.infoCard}>
        <Title style={styles.sectionTitle}>Delivery Information</Title>
        
        <View style={styles.deliveryDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text>{delivery.distance ? `${delivery.distance.toFixed(1)} km` : 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Time</Text>
            <Text>{delivery.estimated_delivery_time || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text>{delivery.payment_method || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rider Earnings</Text>
            <Text style={styles.earnings}>
              ${delivery.rider_fee ? delivery.rider_fee.toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
        
        {delivery.delivery_notes && (
          <>
            <Divider style={styles.notesDivider} />
            <View style={styles.notes}>
              <Caption>Delivery Notes</Caption>
              <Text style={styles.notesText}>{delivery.delivery_notes}</Text>
            </View>
          </>
        )}
      </Surface>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {delivery.status === 'assigned' && (
          <Button 
            mode="contained" 
            icon="package-up" 
            onPress={handlePickUp}
            style={[styles.actionButton, { backgroundColor: '#1976D2' }]}
            contentStyle={styles.buttonContent}
          >
            Picked Up from Restaurant
          </Button>
        )}
        
        {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
          <Button 
            mode="contained" 
            icon="check-circle" 
            onPress={handleDeliveryComplete}
            style={[styles.actionButton, { backgroundColor: '#43A047' }]}
            contentStyle={styles.buttonContent}
          >
            Mark as Delivered
          </Button>
        )}
        
        <Button 
          mode="outlined" 
          icon="map-marker" 
          onPress={() => navigation.navigate('DeliveryMap', { 
            deliveryId: delivery.order_id,
            destination: {
              latitude: delivery.delivery_lat,
              longitude: delivery.delivery_lng,
              name: delivery.customer_name,
              address: delivery.delivery_address
            },
            origin: {
              latitude: delivery.restaurant_lat,
              longitude: delivery.restaurant_lng,
              name: delivery.restaurant_name,
              address: delivery.restaurant_address
            }
          })}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
        >
          Navigate
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 24,
  },
  goBackButton: {
    minWidth: 120,
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 18,
  },
  orderMeta: {
    marginTop: 8,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  locationInfo: {
    marginTop: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  callButton: {
    padding: 8,
  },
  addressContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  address: {
    marginBottom: 4,
  },
  quantityBadge: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  noItemsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  totalDivider: {
    marginVertical: 12,
    height: 1.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  deliveryDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#616161',
  },
  earnings: {
    fontWeight: 'bold',
  },
  notesDivider: {
    marginVertical: 12,
  },
  notes: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 4,
  },
  notesText: {
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default DeliveryDetailsScreen;