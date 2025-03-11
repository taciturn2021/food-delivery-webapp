import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, List, Switch } from 'react-native-paper';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

const SecuritySettings = () => {
  const { hasBiometrics, pin, setupPin } = useLocalAuth();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showPinForm, setShowPinForm] = useState(false);

  const handleChangePin = async () => {
    if (!pin) {
      if (!newPin || newPin.length < 4) {
        Alert.alert('Error', 'PIN must be at least 4 digits');
        return;
      }
      if (newPin !== confirmNewPin) {
        Alert.alert('Error', 'PINs do not match');
        return;
      }
    } else {
      if (currentPin !== pin) {
        Alert.alert('Error', 'Current PIN is incorrect');
        return;
      }
      if (!newPin || newPin.length < 4) {
        Alert.alert('Error', 'New PIN must be at least 4 digits');
        return;
      }
      if (newPin !== confirmNewPin) {
        Alert.alert('Error', 'New PINs do not match');
        return;
      }
    }

    const success = await setupPin(newPin);
    if (success) {
      Alert.alert('Success', 'PIN updated successfully');
      setShowPinForm(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    } else {
      Alert.alert('Error', 'Failed to update PIN');
    }
  };

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Security Settings</List.Subheader>
        {hasBiometrics && (
          <List.Item
            title="Biometric Authentication"
            left={props => <List.Icon {...props} icon="fingerprint" />}
            description="Use fingerprint or Face ID for authentication"
          />
        )}
        <List.Item
          title="Change PIN"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={() => setShowPinForm(!showPinForm)}
        />
      </List.Section>

      {showPinForm && (
        <View style={styles.formContainer}>
          {pin && (
            <TextInput
              style={styles.input}
              label="Current PIN"
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              mode="outlined"
            />
          )}
          <TextInput
            style={styles.input}
            label="New PIN"
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            label="Confirm New PIN"
            value={confirmNewPin}
            onChangeText={setConfirmNewPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            mode="outlined"
          />
          <Button mode="contained" onPress={handleChangePin}>
            {pin ? 'Change PIN' : 'Set PIN'}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default SecuritySettings;