import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ActiveDeliveriesScreen from '../screens/delivery/ActiveDeliveriesScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={ActiveDeliveriesScreen} 
        options={{
          title: 'Active Deliveries',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={DeliveryHistoryScreen} 
        options={{
          title: 'Delivery History',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;