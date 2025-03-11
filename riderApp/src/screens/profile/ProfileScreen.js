import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { 
  Text, 
  Surface, 
  Avatar, 
  Title, 
  Caption, 
  Button, 
  List, 
  Switch,
  Divider,
  useTheme,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/api';
import SecuritySettings from './SecuritySettings';

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isOnline, markAsOffline } = useLocation();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentField, setCurrentField] = useState({ key: '', value: '', label: '' });
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          // If online, mark rider as offline before logging out
          if (isOnline) {
            try {
              await markAsOffline();
            } catch (error) {
              console.error('Error updating availability:', error);
            }
          }
          
          // Perform logout
          logout();
        }}
      ]
    );
  };
  
  // Handle opening edit dialog for a specific field
  const openEditDialog = (key, value, label) => {
    setCurrentField({ key, value: value || '', label });
    setEditDialogVisible(true);
  };
  
  // Handle updating user profile field
  const handleUpdateField = async () => {
    try {
      // Close dialog first to show progress
      setEditDialogVisible(false);
      
      // Prepare update data
      const updateData = {
        [currentField.key]: currentField.value
      };
      
      // Make API call
      await api.updateRiderSettings(user.riderId, updateData);
      
      // Show success message
      Alert.alert('Success', 'Your information has been updated');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update your information. Please try again.');
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Header */}
      <Surface style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Icon 
            size={80} 
            icon="account" 
            backgroundColor={theme.colors.primary} 
          />
          
          <View style={styles.profileInfo}>
            <Title>{user?.full_name || 'Rider'}</Title>
            <Caption>{user?.email || 'No email available'}</Caption>
            <View style={styles.onlineStatusContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E' }
              ]} />
              <Text style={styles.statusText}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        
        <Button 
          mode="outlined" 
          onPress={() => openEditDialog('full_name', user?.full_name, 'Full Name')}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </Surface>
      
      {/* Personal Information */}
      <Surface style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Personal Information</Title>
        
        <List.Item
          title="Phone Number"
          description={user?.contact_number || 'Not provided'}
          left={() => <List.Icon icon="phone" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('contact_number', user?.contact_number, 'Phone Number')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Emergency Contact"
          description={user?.emergency_contact || 'Not provided'}
          left={() => <List.Icon icon="phone-alert" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('emergency_contact', user?.emergency_contact, 'Emergency Contact')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </Surface>
      
      {/* Vehicle Information */}
      <Surface style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Vehicle Information</Title>
        
        <List.Item
          title="Vehicle Type"
          description={user?.vehicle_type || 'Not provided'}
          left={() => <List.Icon icon="motorbike" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('vehicle_type', user?.vehicle_type, 'Vehicle Type')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Vehicle Plate Number"
          description={user?.vehicle_plate_no || 'Not provided'}
          left={() => <List.Icon icon="card-account-details" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('vehicle_plate_no', user?.vehicle_plate_no, 'Vehicle Plate Number')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
        
        <Divider />
        
        <List.Item
          title="License Number"
          description={user?.license_no || 'Not provided'}
          left={() => <List.Icon icon="card-account-details-outline" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('license_no', user?.license_no, 'License Number')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </Surface>
      
      {/* App Settings */}
      <Surface style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>App Settings</Title>
        
        <List.Item
          title="Dark Mode"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color={theme.colors.primary}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Push Notifications"
          left={() => <List.Icon icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        
        <Divider />
        
        <List.Item
          title="Preferred Area"
          description={user?.preferred_area || 'Not set'}
          left={() => <List.Icon icon="map-marker-radius" />}
          right={() => (
            <TouchableOpacity onPress={() => openEditDialog('preferred_area', user?.preferred_area, 'Preferred Area')}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </Surface>
      
      {/* Account Actions */}
      <Surface style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Account</Title>
        
        <List.Item
          title="Change Password"
          left={() => <List.Icon icon="lock" />}
          onPress={() => Alert.alert('Feature Coming Soon', 'Password change will be available in the next update.')}
        />
        
        <Divider />
        
        <List.Item
          title="Logout"
          left={() => <List.Icon color="#FF5252" icon="logout" />}
          titleStyle={{ color: '#FF5252' }}
          onPress={handleLogout}
        />
      </Surface>
      
      {/* App Info */}
      <View style={styles.appInfo}>
        <Caption style={styles.versionText}>Version 1.0.0</Caption>
      </View>
      
      {/* Edit Field Dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Edit {currentField.label}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={currentField.label}
              value={currentField.value}
              onChangeText={text => setCurrentField({...currentField, value: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateField}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <SecuritySettings />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#757575',
  },
  editButton: {
    marginTop: 16,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  versionText: {
    color: '#9E9E9E',
  },
  dialogInput: {
    marginTop: 12,
  },
});

export default ProfileScreen;