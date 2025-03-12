import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { DeliveryProvider } from './src/contexts/DeliveryContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AuthProvider>
        <LocationProvider>
          <DeliveryProvider>
            <AppNavigator />
          </DeliveryProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
