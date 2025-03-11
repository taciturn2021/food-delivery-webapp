import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface, 
  useTheme, 
  Checkbox,
  Snackbar,
  Caption
} from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = () => {
  const theme = useTheme();
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Load saved email if exists
  React.useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('savedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Failed to load saved email', error);
      }
    };
    
    loadSavedEmail();
  }, []);
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      setSnackbarVisible(true);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success && rememberMe) {
        // Save email for next login
        await SecureStore.setItemAsync('savedEmail', email);
      } else if (!rememberMe) {
        // Clear saved email if remember me is disabled
        await SecureStore.deleteItemAsync('savedEmail');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { backgroundColor: theme.colors.background }
        ]}
      >
        <Surface style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Food Delivery</Text>
            <Text style={styles.appSubtitle}>Rider App</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={theme.colors.primary}
              />
              <Text onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxLabel}>
                Remember me
              </Text>
            </View>
            
            <Button 
              mode="contained" 
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={{ paddingVertical: 8 }}
            >
              Login
            </Button>
            
            <Caption style={styles.version}>Version 1.0.0</Caption>
          </View>
        </Surface>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  loginContainer: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  loginButton: {
    marginTop: 8,
  },
  version: {
    marginTop: 24,
    textAlign: 'center',
  },
});

export default LoginScreen;