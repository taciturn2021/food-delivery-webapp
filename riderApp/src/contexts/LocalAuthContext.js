import React, { createContext, useState, useContext, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocalAuthContext = createContext(null);

const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
};

const LocalAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [pin, setPin] = useState(null);

  useEffect(() => {
    checkDeviceSupport();
    loadPin();
  }, []);

  const checkDeviceSupport = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    setHasHardware(hardware);
    if (hardware) {
      const biometrics = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(biometrics);
    }
  };

  const loadPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      setPin(savedPin);
    } catch (error) {
      console.error('Error loading PIN:', error);
    }
  };

  const setupPin = async (newPin) => {
    try {
      await AsyncStorage.setItem('userPin', newPin);
      setPin(newPin);
      return true;
    } catch (error) {
      console.error('Error saving PIN:', error);
      return false;
    }
  };

  const verifyPin = (inputPin) => {
    return inputPin === pin;
  };

  const authenticateWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true, // We'll handle PIN fallback ourselves
      });
      setIsAuthenticated(result.success);
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  };

  return (
    <LocalAuthContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      hasHardware,
      hasBiometrics,
      pin,
      setupPin,
      verifyPin,
      authenticateWithBiometrics,
    }}>
      {children}
    </LocalAuthContext.Provider>
  );
};

export { LocalAuthContext, LocalAuthProvider, useLocalAuth };