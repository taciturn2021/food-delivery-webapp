import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  icon = 'alert-circle-outline',
  buttonText = 'Retry',
  onRetry = null,
  buttonMode = 'contained'
}) => {
  const theme = useTheme();

  return (
    <Surface style={styles.container}>
      <MaterialCommunityIcons 
        name={icon} 
        size={64} 
        color={theme.colors.error} 
      />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button 
          mode={buttonMode}
          onPress={onRetry}
          style={styles.retryButton}
        >
          {buttonText}
        </Button>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
  },
  message: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    minWidth: 120,
  },
});

export default ErrorMessage;