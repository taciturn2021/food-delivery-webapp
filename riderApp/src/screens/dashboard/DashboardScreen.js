import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Surface, 
  Title, 
  Subheading, 
  Switch,
  useTheme,
  Button,
  ActivityIndicator,
  Avatar,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, riderId } = useAuth();
  const { startLocationTracking, stopLocationTracking, isTracking } = useLocation();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleAvailability = async (value) => {
    try {
      await api.updateRiderAvailability(riderId, value);
      setIsAvailable(value);
      
      // Start/stop location tracking based on availability
      if (value) {
        await startLocationTracking();
      } else {
        await stopLocationTracking();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.profileSection}>
          <Avatar.Text 
            size={60} 
            label={user?.username?.charAt(0).toUpperCase() || 'R'} 
            backgroundColor={theme.colors.primary}
          />
          <View style={styles.profileInfo}>
            <Title>{user?.username}</Title>
            <Subheading>{user?.email}</Subheading>
          </View>
        </View>
        <View style={styles.availabilitySection}>
          <Text>Available for Deliveries</Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            color={theme.colors.primary}
          />
        </View>
      </Surface>

      <View style={styles.metricsContainer}>
        <Surface style={styles.metricCard}>
          <MaterialCommunityIcons 
            name="bike-fast" 
            size={30} 
            color={theme.colors.primary} 
          />
          <Title>0</Title>
          <Text>Total Deliveries</Text>
        </Surface>

        <Surface style={styles.metricCard}>
          <MaterialCommunityIcons 
            name="star" 
            size={30} 
            color={theme.colors.accent} 
          />
          <Title>0.0</Title>
          <Text>Average Rating</Text>
        </Surface>

        <Surface style={styles.metricCard}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={30} 
            color="#4CAF50" 
          />
          <Title>0</Title>
          <Text>Completed</Text>
        </Surface>
      </View>

      <Surface style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          icon="package-variant"
          onPress={() => navigation.navigate('Deliveries')}
          style={styles.actionButton}
        >
          View Active Deliveries
        </Button>

        <Button 
          mode="outlined"
          icon="history"
          onPress={() => navigation.navigate('Deliveries', { screen: 'DeliveryHistory' })}
          style={styles.actionButton}
        >
          View Delivery History
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
  },
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  metricCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
  },
  actionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default DashboardScreen;