import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocation } from '../../contexts/LocationContext';

const DeliveryMapScreen = ({ route, navigation }) => {
  const { latitude, longitude, address } = route.params || {};
  const { location: currentUserLocation } = useLocation();
  const [region, setRegion] = useState({
    latitude: latitude || 0,
    longitude: longitude || 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  useEffect(() => {
    // Update region if params change
    if (latitude && longitude) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [latitude, longitude]);

  const handleOpenMaps = () => {
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${region.latitude},${region.longitude}`;
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
        {/* Delivery Location Marker */}
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude
          }}
          title="Delivery Location"
          description={address || 'Customer Address'}
          pinColor="#0066cc"
        />

        {/* Current Location Marker (if available) */}
        {currentUserLocation && (
          <Marker
            coordinate={{
              latitude: currentUserLocation.coords.latitude,
              longitude: currentUserLocation.coords.longitude
            }}
            title="Your Location"
            description="Your current position"
            pinColor="#28a745"
          >
            <Ionicons name="location" size={32} color="#28a745" />
          </Marker>
        )}
      </MapView>

      {/* Header with address info */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{address || 'Location selected'}</Text>
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
});

export default DeliveryMapScreen;