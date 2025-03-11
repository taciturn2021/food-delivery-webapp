import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens and navigators
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DeliveryNavigator from './DeliveryNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false, // Hide the header for tab screens
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={DeliveryNavigator}
        options={{
          title: 'Deliveries'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;