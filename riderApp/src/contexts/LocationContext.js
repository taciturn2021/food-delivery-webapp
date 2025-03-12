import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const { user, riderId } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  // Load initial online status
  useEffect(() => {
    if (riderId) {
      loadOnlineStatus();
    }
  }, [riderId]);

  const loadOnlineStatus = async () => {
    try {
      const response = await api.getRiderStatus(riderId);
      setIsOnline(response.data.status === 'active');
    } catch (error) {
      console.error('Error loading online status:', error);
    }
  };

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setErrorMsg('Failed to request location permissions');
      return false;
    }
  };

  const markAsOnline = async () => {
    try {
      await api.updateRiderAvailability(riderId, true);
      setIsOnline(true);
      startLocationTracking();
    } catch (error) {
      console.error('Error marking as online:', error);
      Alert.alert('Error', 'Failed to update availability status');
    }
  };

  const markAsOffline = async () => {
    try {
      await api.updateRiderAvailability(riderId, false);
      setIsOnline(false);
      stopLocationTracking();
    } catch (error) {
      console.error('Error marking as offline:', error);
      Alert.alert('Error', 'Failed to update availability status');
    }
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission || !riderId) return;

    try {
      await Location.enableNetworkProviderAsync();
      
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          setLocation(newLocation);
          
          try {
            await api.updateLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            });
          } catch (error) {
            console.error('Failed to update location on server:', error);
          }
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Failed to start location tracking');
      setIsTracking(false);
    }
  };

  const stopLocationTracking = async () => {
    try {
      if (locationSubscription) {
        await locationSubscription.remove();
      }
      setLocationSubscription(null);
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      Alert.alert('Error', 'Failed to stop location tracking');
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Failed to get current location');
      return null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        errorMsg,
        isTracking,
        isOnline,
        markAsOnline,
        markAsOffline,
        startLocationTracking,
        stopLocationTracking,
        getCurrentLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};