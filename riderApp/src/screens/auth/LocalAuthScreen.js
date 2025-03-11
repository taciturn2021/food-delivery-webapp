import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

const LocalAuthScreen = () => {
  const { 
    hasHardware,
    hasBiometrics,
    pin,
    setupPin,
    verifyPin,
    authenticateWithBiometrics,
    setIsAuthenticated
  } = useLocalAuth();
  
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(!pin);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasBiometrics) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    const success = await authenticateWithBiometrics();
    setLoading(false);
    if (!success && !pin) {
      setIsSettingPin(true);
    }
  };

  const handlePinSubmit = async () => {
    if (isSettingPin) {
      if (!pinInput || pinInput.length < 4) {
        Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
        return;
      }
      if (!confirmPin) {
        setConfirmPin(pinInput);
        setPinInput('');
        return;
      }
      if (pinInput !== confirmPin) {
        Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
        setConfirmPin('');
        setPinInput('');
        return;
      }
      const success = await setupPin(confirmPin);
      if (success) {
        setIsAuthenticated(true);
      }
    } else {
      if (verifyPin(pinInput)) {
        setIsAuthenticated(true);
      } else {
        Alert.alert('Invalid PIN', 'Please try again');
        setPinInput('');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSettingPin 
          ? confirmPin 
            ? 'Confirm your PIN'
            : 'Set up your PIN'
          : 'Enter your PIN'}
      </Text>
      <TextInput
        style={styles.input}
        value={pinInput}
        onChangeText={setPinInput}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        mode="outlined"
      />
      <Button mode="contained" onPress={handlePinSubmit} style={styles.button}>
        {isSettingPin ? confirmPin ? 'Confirm PIN' : 'Next' : 'Login'}
      </Button>
      {hasBiometrics && !isSettingPin && (
        <Button
          mode="outlined"
          onPress={handleBiometricAuth}
          style={styles.button}
          icon="fingerprint"
        >
          Use Biometrics
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    marginBottom: 10,
  },
});

export default LocalAuthScreen;