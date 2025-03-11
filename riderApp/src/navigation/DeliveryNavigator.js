import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';

// Import screens
import ActiveDeliveriesScreen from '../screens/delivery/ActiveDeliveriesScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';
import DeliveryMapScreen from '../screens/delivery/DeliveryMapScreen';

const Stack = createStackNavigator();

const DeliveryNavigator = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ActiveDeliveries" 
        component={ActiveDeliveriesScreen} 
        options={{ title: 'Active Deliveries' }} 
      />
      <Stack.Screen 
        name="DeliveryDetails" 
        component={DeliveryDetailsScreen}
        options={{ title: 'Delivery Details' }}
      />
      <Stack.Screen 
        name="DeliveryHistory" 
        component={DeliveryHistoryScreen}
        options={{ title: 'Delivery History' }}
      />
      <Stack.Screen 
        name="DeliveryMap" 
        component={DeliveryMapScreen}
        options={{ 
          title: 'Navigation',
          headerShown: false // Hide header for map view
        }}
      />
    </Stack.Navigator>
  );
};

export default DeliveryNavigator;