import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Switch,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useDelivery } from '../../contexts/DeliveryContext';
import DeliveryCard from '../../components/delivery/DeliveryCard';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    isOnline, 
    errorMsg: locationError,
    markAsOnline,
    markAsOffline
  } = useLocation();

  const { 
    activeDeliveries, 
    isLoading, 
    error,
    refreshing,
    handleRefresh,
    fetchActiveDeliveries
  } = useDelivery();

  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    // Fetch deliveries when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      if (user && user.id) {
        fetchActiveDeliveries();
      }
    });

    return unsubscribe;
  }, [navigation, fetchActiveDeliveries, user]);

  const toggleOnlineStatus = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'User account not properly loaded. Please log out and log in again.');
      return;
    }

    setStatusLoading(true);
    try {
      if (isOnline) {
        // If there are active deliveries, don't allow going offline
        if (activeDeliveries.length > 0) {
          Alert.alert(
            'Active Deliveries',
            'You cannot go offline while you have active deliveries.',
            [{ text: 'OK' }]
          );
          return;
        }
        await markAsOffline();
        console.log('Rider marked as offline');
      } else {
        await markAsOnline();
        console.log('Rider marked as online');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', 'Failed to update your availability status');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString(undefined, options);
  };

  if (isLoading && !refreshing) {
    return <LoadingIndicator message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
        }
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.welcomeText}>
              Hello, {user?.username || 'Rider'}
            </Text>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>
              {isOnline ? 'You are online' : 'You are offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isOnline ? '#0066cc' : '#f4f3f4'}
              disabled={statusLoading}
            />
          </View>
        </View>

        {(error || locationError) && (
          <ErrorMessage 
            message={error || locationError} 
            onRetry={fetchActiveDeliveries} 
          />
        )}

        <View style={styles.deliveriesSection}>
          <Text style={styles.sectionTitle}>
            Active Deliveries ({activeDeliveries.length})
          </Text>
          
          {activeDeliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>No active deliveries</Text>
              <Text style={styles.emptySubtext}>
                {isOnline 
                  ? 'You will be notified when new deliveries are assigned to you'
                  : 'Go online to start receiving deliveries'}
              </Text>
            </View>
          ) : (
            activeDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onPress={() => navigation.navigate('DeliveryDetails', { delivery })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 0
  },
  welcomeSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  statusLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  deliveriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;