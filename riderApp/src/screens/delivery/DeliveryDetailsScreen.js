import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../../contexts/DeliveryContext';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const DeliveryDetailsScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    activeDeliveries,
    fetchActiveDeliveries,
    setDeliveryAsPicked,
    setDeliveryAsDelivered
  } = useDelivery();
  
  const [delivery, setDelivery] = useState(null);

  useEffect(() => {
    loadDeliveryDetails();
  }, [deliveryId, activeDeliveries]);

  const loadDeliveryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if we need to refresh the deliveries
      if (activeDeliveries.length === 0) {
        await fetchActiveDeliveries();
      }
      
      // Find the delivery in the activeDeliveries list
      const foundDelivery = activeDeliveries.find(d => d.id === deliveryId);
      
      if (!foundDelivery) {
        setError('Delivery not found. It may have been completed or canceled.');
        setLoading(false);
        return;
      }
      
      setDelivery(foundDelivery);
    } catch (err) {
      setError('Failed to load delivery details.');
      console.error('Error loading delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!delivery) return;
    
    if (delivery.delivery_status === 'assigned') {
      Alert.alert(
        'Update Status',
        'Are you ready to pick up this order?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark as Picked Up',
            onPress: async () => {
              const success = await setDeliveryAsPicked(delivery.id, delivery.assignment_id);
              if (success) {
                loadDeliveryDetails();
              }
            }
          }
        ]
      );
    } else if (delivery.delivery_status === 'picked') {
      Alert.alert(
        'Update Status',
        'Confirm delivery completion?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Delivery',
            style: 'default',
            onPress: async () => {
              const success = await setDeliveryAsDelivered(delivery.id, delivery.assignment_id);
              if (success) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    }
  };

  const openMapsApp = () => {
    if (!delivery || !delivery.delivery_address) return;
    
    const encodedAddress = encodeURIComponent(delivery.delivery_address);
    const mapsUrl = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });
    
    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapsUrl);
        } else {
          const webUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
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

  if (loading) {
    return <LoadingIndicator message="Loading delivery details..." />;
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

  if (!delivery) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Delivery information not available" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>Order #{delivery.id}</Text>
          <View style={[
            styles.statusBadge, 
            delivery.delivery_status === 'picked' ? styles.pickedBadge : styles.assignedBadge
          ]}>
            <Text style={styles.statusText}>
              {delivery.delivery_status === 'picked' ? 'In Transit' : 'Ready for Pickup'}
            </Text>
          </View>
        </View>
        
        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color="#777" />
            <Text style={styles.timeText}>
              Assigned: {formatTime(delivery.assigned_at)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={20} color="#dc3545" />
          <Text style={styles.addressText}>{delivery.delivery_address}</Text>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={openMapsApp}
          >
            <Text style={styles.mapButtonText}>Open in Maps</Text>
            <Ionicons name="open-outline" size={16} color="#0066cc" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            delivery.delivery_status === 'picked' ? styles.deliverButton : styles.pickupButton
          ]}
          onPress={handleStatusUpdate}
        >
          <Text style={styles.actionButtonText}>
            {delivery.delivery_status === 'picked' ? 'Mark as Delivered' : 'Mark as Picked'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  headerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
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
  sectionContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12
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
    flexWrap: 'wrap'
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
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  mapButtonText: {
    color: '#0066cc',
    marginRight: 4,
    fontWeight: '500'
  },
  actionContainer: {
    padding: 16,
    marginTop: 16,
    marginBottom: 30
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickupButton: {
    backgroundColor: '#ffc107'
  },
  deliverButton: {
    backgroundColor: '#28a745'
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
  }
});

export default DeliveryDetailsScreen;