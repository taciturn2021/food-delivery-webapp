import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const statusIcons = {
  assigned: { name: 'bicycle-outline', color: '#F9A825' }, // Yellow for assigned
  picked: { name: 'checkmark-circle-outline', color: '#42A5F5' }, // Blue for picked 
  delivered: { name: 'checkmark-done-circle-outline', color: '#66BB6A' }, // Green for delivered
  cancelled: { name: 'close-circle-outline', color: '#EF5350' }, // Red for cancelled
};

const formatDeliveryTime = (timestamp) => {
  if (!timestamp) return 'Not available';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusText = (status) => {
  switch (status) {
    case 'assigned': return 'Assigned to you';
    case 'picked': return 'Picked up';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const DeliveryCard = ({ delivery, onPress }) => {
  if (!delivery) return null;
  
  const statusIcon = statusIcons[delivery.delivery_status] || { 
    name: 'help-circle-outline', 
    color: '#757575' 
  };
  
  const truncateAddress = (address) => {
    if (!address) return 'No address provided';
    return address.length > 35 ? address.substring(0, 35) + '...' : address;
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(delivery)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: statusIcon.color }]}>
          <Ionicons name={statusIcon.name} size={24} color="white" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.orderIdText}>Order #{delivery.id}</Text>
          <Text style={[styles.statusText, { color: statusIcon.color }]}>
            {getStatusText(delivery.delivery_status)}
          </Text>
        </View>
        
        <Text style={styles.addressText} numberOfLines={2}>
          {truncateAddress(delivery.delivery_address)}
        </Text>
        
        <View style={styles.footerRow}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.timeText}>{formatDeliveryTime(delivery.assigned_at)}</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              ${Number(delivery.total_amount).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  amountContainer: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
});

export default DeliveryCard;