import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Surface, 
  useTheme, 
  Title, 
  Caption, 
  Divider, 
  Button,
  ActivityIndicator,
  Chip,
  Menu,
  IconButton,
  List
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeliveryContext } from '../../contexts/DeliveryContext';
import { format, subDays } from 'date-fns';

const DeliveryHistoryScreen = ({ navigation }) => {
  const theme = useTheme();
  const { deliveryHistory, stats, fetchDeliveryHistory, isLoading, refreshing } = useContext(DeliveryContext);
  
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [dateRangeMenuVisible, setDateRangeMenuVisible] = useState(false);
  const [startDate, setStartDate] = useState(subDays(new Date(), 7)); // Default to last 7 days
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'cancelled'
  
  // Load delivery history
  useEffect(() => {
    const dateRange = {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    };
    fetchDeliveryHistory(dateRange);
  }, [startDate, endDate]);
  
  // Handle refresh
  const handleRefresh = () => {
    const dateRange = {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    };
    fetchDeliveryHistory(dateRange);
  };
  
  // Handle date changes
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };
  
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  // Set preset date filters
  const setDateRange = (days) => {
    setEndDate(new Date());
    setStartDate(subDays(new Date(), days));
    setDateRangeMenuVisible(false);
  };
  
  // Filter and sort the history
  const getFilteredHistory = () => {
    let filtered = [...deliveryHistory];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status.toLowerCase() === filterStatus);
    }
    
    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.completed_at || a.created_at);
      const dateB = new Date(b.completed_at || b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };
  
  // Render item in history list
  const renderHistoryItem = ({ item }) => {
    const deliveryDate = new Date(item.completed_at || item.created_at);
    
    return (
      <Surface style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.order_id}</Text>
            <Caption>{format(deliveryDate, 'MMM dd, yyyy · h:mm a')}</Caption>
          </View>
          <View>
            <Chip mode="outlined" 
              style={{ 
                borderColor: item.status === 'completed' ? '#4CAF50' : '#F44336',
                backgroundColor: 'transparent'
              }}
              textStyle={{ 
                color: item.status === 'completed' ? '#4CAF50' : '#F44336'
              }}
            >
              {item.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Chip>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="store" size={18} color={theme.colors.primary} />
            <Text numberOfLines={1} style={styles.detailText}>
              {item.restaurant_name || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
            <Text numberOfLines={1} style={styles.detailText}>
              {item.customer_name || 'N/A'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Caption>Distance</Caption>
            <Text>{item.distance_traveled ? `${parseFloat(item.distance_traveled).toFixed(1)} km` : 'N/A'}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Caption>Duration</Caption>
            <Text>{item.delivery_duration ? `${item.delivery_duration} min` : 'N/A'}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Caption>Earnings</Caption>
            <Text style={styles.earnings}>${item.rider_fee ? parseFloat(item.rider_fee).toFixed(2) : '0.00'}</Text>
          </View>
        </View>
        
        <Button 
          mode="outlined"
          compact
          onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.order_id })}
          style={styles.viewButton}
        >
          View Details
        </Button>
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Title style={styles.statValue}>{stats.completed}</Title>
            <Caption>Completed</Caption>
          </View>
          
          <View style={styles.statBox}>
            <Title style={styles.statValue}>${stats.totalEarnings.toFixed(2)}</Title>
            <Caption>Total Earnings</Caption>
          </View>
          
          <View style={styles.statBox}>
            <Title style={styles.statValue}>{stats.totalDistance.toFixed(0)}</Title>
            <Caption>Total KMs</Caption>
          </View>
        </View>
      </Surface>
      
      {/* Filter Bar */}
      <Surface style={styles.filterCard}>
        <View style={styles.filterRow}>
          {/* Date Filter */}
          <Menu
            visible={dateRangeMenuVisible}
            onDismiss={() => setDateRangeMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                icon="calendar" 
                onPress={() => setDateRangeMenuVisible(true)}
                style={styles.filterButton}
              >
                {format(startDate, 'MM/dd')} - {format(endDate, 'MM/dd')}
              </Button>
            }
          >
            <Menu.Item
              title="Today"
              onPress={() => setDateRange(0)}
            />
            <Menu.Item
              title="Past 7 days"
              onPress={() => setDateRange(7)}
            />
            <Menu.Item
              title="Past 30 days"
              onPress={() => setDateRange(30)}
            />
            <Menu.Item
              title="Custom range"
              onPress={() => {
                setDateRangeMenuVisible(false);
                setShowStartDatePicker(true);
              }}
            />
          </Menu>
          
          {/* Sort Order */}
          <IconButton
            icon="sort"
            color={theme.colors.primary}
            size={24}
            onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          />
          
          {/* Filter Menu */}
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter"
                color={theme.colors.primary}
                size={24}
                onPress={() => setFilterMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              title="All Orders"
              onPress={() => {
                setFilterStatus('all');
                setFilterMenuVisible(false);
              }}
              right={() => filterStatus === 'all' && <MaterialCommunityIcons name="check" size={20} />}
            />
            <Menu.Item
              title="Completed Only"
              onPress={() => {
                setFilterStatus('completed');
                setFilterMenuVisible(false);
              }}
              right={() => filterStatus === 'completed' && <MaterialCommunityIcons name="check" size={20} />}
            />
            <Menu.Item
              title="Cancelled Only"
              onPress={() => {
                setFilterStatus('cancelled');
                setFilterMenuVisible(false);
              }}
              right={() => filterStatus === 'cancelled' && <MaterialCommunityIcons name="check" size={20} />}
            />
          </Menu>
        </View>
      </Surface>
      
      {/* Delivery History List */}
      {isLoading && !refreshing && deliveryHistory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading delivery history...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredHistory()}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.order_id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="history" 
                size={64} 
                color={theme.colors.disabled} 
              />
              <Text style={styles.emptyText}>
                No delivery history found for the selected period
              </Text>
            </View>
          }
        />
      )}
      
      {/* Date Pickers (Shown when needed) */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={endDate}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  filterCard: {
    padding: 8,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flex: 1,
  },
  listContent: {
    padding: 8,
    paddingBottom: 16,
  },
  historyCard: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  earnings: {
    color: '#43A047',
    fontWeight: 'bold',
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DeliveryHistoryScreen;