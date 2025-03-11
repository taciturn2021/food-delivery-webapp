import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import AuthLoadingScreen from '../screens/auth/AuthLoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LocalAuthScreen from '../screens/auth/LocalAuthScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAuthenticated } = useLocalAuth();

  // Show auth loading screen while checking authentication
  if (authLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not logged in - show login screen
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : !isAuthenticated ? (
        // Logged in but needs local auth - show PIN/biometric screen
        <Stack.Screen name="LocalAuth" component={LocalAuthScreen} />
      ) : (
        // Fully authenticated - show main app
        <Stack.Screen name="App" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;