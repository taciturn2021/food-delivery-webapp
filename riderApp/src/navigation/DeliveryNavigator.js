import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ActiveDeliveriesScreen from '../screens/delivery/ActiveDeliveriesScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';

const Stack = createStackNavigator();

const DeliveryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}
    >
      <Stack.Screen 
        name="ActiveDeliveriesList" 
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
    </Stack.Navigator>
  );
};

export default DeliveryNavigator;