import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Text, FAB, Button, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LocationContext } from '../../contexts/LocationContext';
import { DeliveryContext } from '../../contexts/DeliveryContext';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

const DeliveryMapScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { deliveryId, origin, destination } = route.params;
  const { location: currentLocation } = useContext(LocationContext);
  const { updateDeliveryStatus } = useContext(DeliveryContext);
  
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [route2, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [currentStage, setCurrentStage] = useState('pickup'); // 'pickup' or 'delivery'
  
  // Initial map setup
  useEffect(() => {
    if (currentLocation && origin && destination) {
      setLoading(false);
      
      // Determine current stage based on user's position relative to pickup and delivery
      const userLoc = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      };
      
      const distToPickup = calculateDistance(
        userLoc.latitude, userLoc.longitude,
        origin.latitude, origin.longitude
      );
      
      const distToDelivery = calculateDistance(
        userLoc.latitude, userLoc.longitude,
        destination.latitude, destination.longitude
      );
      
      // If closer to delivery point than pickup, assume pickup is done
      if (distToDelivery < distToPickup) {
        setCurrentStage('delivery');
      }
      
      // Calculate route
      calculateRoute();
    }
  }, [currentLocation, origin, destination]);
  
  // Calculate route between points
  const calculateRoute = async () => {
    try {
      // For a real app, this would call a directions API like Google Directions API
      // Here we'll simulate a route with a direct line for simplicity
      
      // In a real implementation:
      // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=YOUR_API_KEY`);
      // const json = await response.json();
      // const points = decode(json.routes[0].overview_polyline.points);
      
      // Simulate route
      const directRoute = [
        { latitude: currentStage === 'pickup' ? currentLocation.coords.latitude : origin.latitude, 
          longitude: currentStage === 'pickup' ? currentLocation.coords.longitude : origin.longitude },
        { latitude: currentStage === 'pickup' ? origin.latitude : destination.latitude, 
          longitude: currentStage === 'pickup' ? origin.longitude : destination.longitude }
      ];
      
      setRoute(directRoute);
      
      // Calculate distance
      const routeDist = calculateDistance(
        directRoute[0].latitude, directRoute[0].longitude,
        directRoute[1].latitude, directRoute[1].longitude
      );
      
      setDistance(routeDist);
      
      // Estimate duration (assuming average speed of 30 km/h = 0.5 km/min)
      setDuration(Math.round(routeDist / 0.5));
      
      // Fit map to route
      fitMapToCoordinates(directRoute);
      
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Error', 'Failed to calculate route.');
    }
  };
  
  // Helper to calculate distance between coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Fit map to show all route coordinates
  const fitMapToCoordinates = (coordinates) => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
        animated: true
      });
    }
  };
  
  // Center map on user's location
  const centerOnUserLocation = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 1000);
    }
  };
  
  // Open external navigation app
  const openExternalNavigation = () => {
    const targetLat = currentStage === 'pickup' ? origin.latitude : destination.latitude;
    const targetLng = currentStage === 'pickup' ? origin.longitude : destination.longitude;
    const label = currentStage === 'pickup' ? origin.name : destination.name;
    
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios'
      ? `${scheme}?q=${label}&ll=${targetLat},${targetLng}`
      : `${scheme}${targetLat},${targetLng}?q=${label}`;
    
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open maps application.')
    );
  };
  
  // Update delivery stage
  const handleStageComplete = async () => {
    if (currentStage === 'pickup') {
      try {
        const success = await updateDeliveryStatus(deliveryId, 'picked_up');
        if (success) {
          setCurrentStage('delivery');
          calculateRoute();
          Alert.alert('Pickup Complete', 'Let\'s start delivery to the customer!');
        }
      } catch (error) {
        console.error('Failed to update delivery status:', error);
      }
    } else {
      navigation.navigate('DeliveryDetails', { deliveryId });
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: currentLocation?.coords.latitude || 0,
          longitude: currentLocation?.coords.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Origin marker */}
        {origin && (
          <Marker
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude
            }}
            title={origin.name}
            description={origin.address}
            pinColor={currentStage === 'pickup' ? 'red' : 'gray'}
          >
            <MaterialCommunityIcons 
              name="store" 
              size={30} 
              color={currentStage === 'pickup' ? '#E53935' : '#757575'} 
            />
          </Marker>
        )}
        
        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude
            }}
            title={destination.name}
            description={destination.address}
            pinColor={currentStage === 'delivery' ? 'green' : 'gray'}
          >
            <MaterialCommunityIcons 
              name="map-marker" 
              size={36} 
              color={currentStage === 'delivery' ? '#43A047' : '#757575'} 
            />
          </Marker>
        )}
        
        {/* Route line */}
        {route2 && (
          <Polyline
            coordinates={route2}
            strokeWidth={4}
            strokeColor={theme.colors.primary}
          />
        )}
      </MapView>
      
      {/* Location button */}
      <TouchableOpacity 
        style={[styles.locationButton, { backgroundColor: theme.colors.surface }]} 
        onPress={centerOnUserLocation}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      
      {/* Navigation info card */}
      <Surface style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>
            {currentStage === 'pickup' ? 'Navigate to Restaurant' : 'Navigate to Customer'}
          </Text>
          <Text style={styles.infoSubtitle}>
            {currentStage === 'pickup' ? origin.name : destination.name}
          </Text>
        </View>
        
        <View style={styles.infoDetails}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>{distance ? `${distance.toFixed(1)} km` : 'Calculating...'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>{duration ? `${duration} min` : 'Calculating...'}</Text>
          </View>
        </View>
        
        <View style={styles.infoAddress}>
          <Text numberOfLines={2} style={styles.addressText}>
            {currentStage === 'pickup' ? origin.address : destination.address}
          </Text>
        </View>
        
        <View style={styles.buttonRow}>
          <Button 
            mode="contained" 
            onPress={openExternalNavigation}
            icon="navigation"
            style={styles.navigationButton}
          >
            Navigate
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleStageComplete}
            icon={currentStage === 'pickup' ? "package-up" : "check-circle"}
            style={styles.actionButton}
          >
            {currentStage === 'pickup' ? 'Picked Up' : 'Arrived'}
          </Button>
        </View>
      </Surface>
      
      {/* Back button */}
      <FAB
        style={[styles.backFab, { backgroundColor: theme.colors.surface }]}
        icon="arrow-left"
        color={theme.colors.primary}
        onPress={() => navigation.goBack()}
        small
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  locationButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    padding: 12,
    borderRadius: 30,
    elevation: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
  },
  infoHeader: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    fontSize: 16,
  },
  infoDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 16,
  },
  infoAddress: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressText: {
    color: '#424242',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    flex: 1,
    marginLeft: 8,
  },
  backFab: {
    position: 'absolute',
    top: 16,
    left: 16,
    elevation: 4,
  },
});

export default DeliveryMapScreen;