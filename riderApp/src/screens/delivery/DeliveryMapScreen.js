import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocation } from '../../contexts/LocationContext';

const DeliveryMapScreen = ({ route, navigation }) => {
  // Extract all location parameters from route params
  const { 
    orderId,
    latitude, 
    longitude, 
    address,
    branchLatitude,
    branchLongitude,
    deliveryLatitude,
    deliveryLongitude
  } = route.params || {};
  
  const { location: currentUserLocation } = useLocation();
  
  // Use rider location from params if available, otherwise use rider's current location
  const riderLat = latitude || (currentUserLocation?.coords.latitude || 0);
  const riderLng = longitude || (currentUserLocation?.coords.longitude || 0);
  
  // Calculate center of map based on all points
  const calculateRegionCenter = () => {
    const points = [
      { lat: riderLat, lng: riderLng },
      { lat: parseFloat(branchLatitude || 0), lng: parseFloat(branchLongitude || 0) },
      { lat: parseFloat(deliveryLatitude || 0), lng: parseFloat(deliveryLongitude || 0) }
    ].filter(point => point.lat !== 0 && point.lng !== 0);
    
    if (points.length === 0) return { latitude: riderLat, longitude: riderLng };
    
    const totalLat = points.reduce((sum, point) => sum + point.lat, 0);
    const totalLng = points.reduce((sum, point) => sum + point.lng, 0);
    
    return {
      latitude: totalLat / points.length,
      longitude: totalLng / points.length,
      latitudeDelta: 0.02,  // Wider view to show all points
      longitudeDelta: 0.02
    };
  };

  const [region, setRegion] = useState(calculateRegionCenter());

  useEffect(() => {
    // Update region when locations change
    setRegion(calculateRegionCenter());
  }, [latitude, longitude, branchLatitude, branchLongitude, deliveryLatitude, deliveryLongitude]);

  const handleOpenMaps = () => {
    // Default to the delivery address coordinates
    const targetLat = deliveryLatitude || latitude || 0;
    const targetLng = deliveryLongitude || longitude || 0;
    
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${targetLat},${targetLng}`;
    const label = address || 'Delivery Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url).catch(err => {
      console.error('Error opening maps app:', err);
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* Rider's Current Location Marker */}
        {(riderLat !== 0 && riderLng !== 0) && (
          <Marker
            coordinate={{
              latitude: riderLat,
              longitude: riderLng
            }}
            title="Rider Location"
            description="Current rider position"
            pinColor="#28a745"
          >
            <View style={styles.riderMarker}>
              <Ionicons name="bicycle" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Restaurant Location Marker */}
        {(branchLatitude && branchLongitude) && (
          <Marker
            coordinate={{
              latitude: parseFloat(branchLatitude),
              longitude: parseFloat(branchLongitude)
            }}
            title="Restaurant Location"
            description="Pickup location"
            pinColor="#FB8C00"
          >
            <View style={[styles.markerContainer, { backgroundColor: '#FB8C00' }]}>
              <Ionicons name="restaurant" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Delivery Location Marker */}
        {(deliveryLatitude && deliveryLongitude) && (
          <Marker
            coordinate={{
              latitude: parseFloat(deliveryLatitude),
              longitude: parseFloat(deliveryLongitude)
            }}
            title="Delivery Location"
            description={address || "Customer's address"}
            pinColor="#0066cc"
          >
            <View style={[styles.markerContainer, { backgroundColor: '#0066cc' }]}>
              <Ionicons name="location" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Draw route line from rider to delivery if both coordinates are available */}
        {(riderLat !== 0 && riderLng !== 0 && deliveryLatitude && deliveryLongitude) && (
          <Polyline
            coordinates={[
              { latitude: riderLat, longitude: riderLng },
              { latitude: parseFloat(deliveryLatitude), longitude: parseFloat(deliveryLongitude) }
            ]}
            strokeColor="#0066cc"
            strokeWidth={3}
            lineDashPattern={[1,3]}
          />
        )}
      </MapView>

      {/* Header with address info */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{address || 'Location selected'}</Text>
        {orderId && <Text style={styles.orderIdText}>Order #{orderId}</Text>}
      </View>

      {/* Actions container */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navigateButton}
          onPress={handleOpenMaps}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.navigateText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  addressContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigateButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  riderMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default DeliveryMapScreen;