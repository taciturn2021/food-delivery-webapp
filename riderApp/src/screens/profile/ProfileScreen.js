import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/api';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const { isOnline, markAsOffline } = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentField, setCurrentField] = useState({
    key: '',
    value: '',
    label: ''
  });

  useEffect(() => {
    loadRiderProfile();
  }, []);

  const loadRiderProfile = async () => {
    setLoading(true);
    try {
      const response = await api.getRiderStatus(user.id);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel' },
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
      setEditDialogVisible(false);
      
      const updateData = {
        [currentField.key]: currentField.value
      };
      
      await api.updateRider(user.id, updateData);
      await loadRiderProfile(); // Reload profile data
      
      Alert.alert('Success', 'Your information has been updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update your information');
    }
  };

  if (loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {user?.username ? user.username[0].toUpperCase() : 'R'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.username || 'Rider'}</Text>
        <Text style={styles.email}>{user?.email || 'No email'}</Text>
      </View>

      {/* Profile information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => openEditDialog('contact_number', profileData?.contact_number, 'Phone Number')}
        >
          <View style={styles.infoContent}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{profileData?.contact_number || 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => openEditDialog('emergency_contact', profileData?.emergency_contact, 'Emergency Contact')}
        >
          <View style={styles.infoContent}>
            <Ionicons name="alert-circle-outline" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>{profileData?.emergency_contact || 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Vehicle information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => openEditDialog('vehicle_type', profileData?.vehicle_type, 'Vehicle Type')}
        >
          <View style={styles.infoContent}>
            <Ionicons name="bicycle" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Vehicle Type</Text>
              <Text style={styles.infoValue}>{profileData?.vehicle_type || 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => openEditDialog('vehicle_plate_no', profileData?.vehicle_plate_no, 'Vehicle Plate Number')}
        >
          <View style={styles.infoContent}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Vehicle Plate Number</Text>
              <Text style={styles.infoValue}>{profileData?.vehicle_plate_no || 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => openEditDialog('license_no', profileData?.license_no, 'License Number')}
        >
          <View style={styles.infoContent}>
            <Ionicons name="id-card-outline" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>{profileData?.license_no || 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Account actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.infoItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <View style={styles.infoContent}>
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Edit dialog */}
      <Modal
        visible={editDialogVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit {currentField.label}</Text>
            
            <TextInput
              style={styles.input}
              value={currentField.value}
              onChangeText={text => setCurrentField({ ...currentField, value: text })}
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditDialogVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateField}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  profileImageContainer: {
    marginBottom: 16
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoTextContainer: {
    marginLeft: 12
  },
  infoLabel: {
    fontSize: 14,
    color: '#333'
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  logoutButton: {
    borderBottomWidth: 0
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8
  },
  cancelButton: {
    backgroundColor: '#f8f9fa'
  },
  cancelButtonText: {
    color: '#666'
  },
  saveButton: {
    backgroundColor: '#0066cc'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500'
  }
});

export default ProfileScreen;