import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, AppState } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  // Track app state (foreground/background)
  const [appState, setAppState] = useState(AppState.currentState);
  
  // Update location in the backend
  const updateLocationInBackend = useCallback(async (latitude, longitude) => {
    if (!user) {
      console.log('No user logged in, skipping location update');
      return;
    }
    
    try {
      await api.updateLocation({ latitude, longitude });
      console.log('Location updated in backend:', { latitude, longitude });
    } catch (error) {
      console.error('Failed to update location in backend:', error);
      setErrorMsg('Failed to update location. Please check your connection.');
    }
  }, [user]);
  
  // Request and start location updates
  const startLocationTracking = useCallback(async () => {
    if (!user) return;
    
    try {
      // Request permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsTracking(false);
        return;
      }
      
      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,  // 30 seconds
          distanceInterval: 100, // 100 meters
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation(newLocation);
          updateLocationInBackend(latitude, longitude);
        }
      );
      
      setIsTracking(true);
      setErrorMsg(null);
      
      // Return the subscription so we can clean it up later
      return subscription;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Error starting location tracking');
      setIsTracking(false);
    }
  }, [user, updateLocationInBackend]);
  
  // Stop location tracking
  const stopLocationTracking = useCallback(async (subscription) => {
    if (subscription) {
      subscription.remove();
    }
    setIsTracking(false);
    console.log('Location tracking stopped');
  }, []);
  
  // Check the rider's online status
  const checkOnlineStatus = useCallback(async () => {
    if (!user || !user.id) {
      console.log('No user ID available, skipping online status check');
      return;
    }
    
    try {
      const response = await api.getRiderStatus(user.id);
      const isActive = response.data.status === 'active';
      setIsOnline(isActive);
      console.log('Rider online status:', isActive);
      return isActive;
    } catch (error) {
      console.error('Error loading online status:', error);
      setErrorMsg('Failed to load online status');
      return false;
    }
  }, [user]);
  
  // Mark rider as online
  const markAsOnline = useCallback(async () => {
    if (!user || !user.id) {
      console.log('No user ID available, cannot mark as online');
      setErrorMsg('User ID not available');
      return false;
    }
    
    try {
      await api.updateRider(user.id, { status: 'active' });
      setIsOnline(true);
      
      // Start location tracking when going online
      const subscription = await startLocationTracking();
      
      return true;
    } catch (error) {
      console.error('Error marking as online:', error);
      setErrorMsg('Failed to update availability status');
      return false;
    }
  }, [user, startLocationTracking]);
  
  // Mark rider as offline
  const markAsOffline = useCallback(async () => {
    if (!user || !user.id) {
      console.log('No user ID available, cannot mark as offline');
      setErrorMsg('User ID not available');
      return false;
    }
    
    try {
      await api.updateRider(user.id, { status: 'inactive' });
      setIsOnline(false);
      
      // Stop location tracking when going offline
      stopLocationTracking();
      
      return true;
    } catch (error) {
      console.error('Error marking as offline:', error);
      setErrorMsg('Failed to update availability status');
      return false;
    }
  }, [user, stopLocationTracking]);
  
  // Handle app state changes (active, background, inactive)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('App state changed:', nextAppState);
      setAppState(nextAppState);
      
      // If app comes to foreground and rider is online, restart tracking
      if (appState.match(/inactive|background/) && nextAppState === 'active' && isOnline) {
        console.log('App became active while rider is online, restarting tracking');
        startLocationTracking();
      }
      
      // If app goes to background but rider is online, tracking should continue
      // This is handled by the system as we're using Location.watchPositionAsync
    });
    
    return () => {
      subscription.remove();
    };
  }, [appState, isOnline, startLocationTracking]);
  
  // Check online status when the context is initialized or when user changes
  useEffect(() => {
    if (user && user.id) {
      checkOnlineStatus().then(isActive => {
        if (isActive) {
          // If rider is already online, start tracking
          startLocationTracking();
        }
      });
    }
    
    // Cleanup function
    return () => {
      stopLocationTracking();
    };
  }, [user, checkOnlineStatus, startLocationTracking, stopLocationTracking]);
  
  const value = {
    location,
    errorMsg,
    isTracking,
    isOnline,
    markAsOnline,
    markAsOffline,
    checkOnlineStatus
  };
  
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;