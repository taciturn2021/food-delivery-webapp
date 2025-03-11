import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import context providers
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { DeliveryProvider } from './src/contexts/DeliveryContext';
import { LocalAuthProvider } from './src/contexts/LocalAuthContext';

// Custom theme colors
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#ff5722',
    accent: '#2196f3',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
        <AuthProvider>
          <LocalAuthProvider>
            <LocationProvider>
              <DeliveryProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </DeliveryProvider>
            </LocationProvider>
          </LocalAuthProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
