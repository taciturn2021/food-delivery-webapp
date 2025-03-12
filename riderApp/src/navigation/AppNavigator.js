import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import context
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import AuthLoadingScreen from '../screens/auth/AuthLoadingScreen';
import MainTabNavigator from './MainTabNavigator';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryMapScreen from '../screens/delivery/DeliveryMapScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="DeliveryDetails" 
              component={DeliveryDetailsScreen}
              options={{
                headerShown: true,
                title: 'Delivery Details',
                headerTitleAlign: 'center'
              }}
            />
            <Stack.Screen 
              name="DeliveryMapScreen" 
              component={DeliveryMapScreen}
              options={{
                headerShown: false
              }} 
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;