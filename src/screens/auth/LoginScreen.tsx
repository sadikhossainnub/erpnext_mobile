import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { theme } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../contexts/AuthContext';
import ConfigPopup from '../../components/ConfigPopup';
import { setBaseUrl, apiClient, setApiKey, setApiSecret } from '../../api/client';
import { RootStackParamList } from '../../types';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://paperware.jfmart.site');
  const [apiKey, setApiKeyLocal] = useState('');
  const [apiSecret, setApiSecretLocal] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { login, isLoading, error } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const loadConfig = async () => {
      const storedUrl = await apiClient.getServerUrl();
      setServerUrl(storedUrl);
      const storedApiKey = await AsyncStorage.getItem('api_key');
      const storedApiSecret = await AsyncStorage.getItem('api_secret');
      if (storedApiKey) {
        setApiKeyLocal(storedApiKey);
      }
      if (storedApiSecret) {
        setApiSecretLocal(storedApiSecret);
      }
    };
    loadConfig();

    if (error) {
      console.log('Login Error:', error);
    }
  }, [error]);

  useEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    };
    checkBiometrics();
  }, []);

  const handleLogin = () => {
    console.log('Attempting to log in with email:', email);
    login(email, password);
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to log in',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        console.log('Biometric authentication successful!');
        login('biometric_user@example.com', 'biometric_password'); // Placeholder
      } else {
        console.log('Biometric authentication failed or cancelled:', result.error);
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
    }
  };

  const handleSave = (url: string, newApiKey: string, newApiSecret: string) => {
    setBaseUrl(url);
    setServerUrl(url);
    setApiKey(newApiKey);
    setApiSecret(newApiSecret);
    setApiKeyLocal(newApiKey);
    setApiSecretLocal(newApiSecret);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.large,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    configButtonContainer: {
      position: 'absolute',
      top: theme.spacing.medium,
      right: theme.spacing.medium,
      zIndex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: theme.spacing.large,
      textAlign: 'center',
      color: theme.colors.primary,
    },
    input: {
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    button: {
      marginTop: theme.spacing.small,
      borderRadius: theme.roundness,
      paddingVertical: theme.spacing.small / 2,
    },
    error: {
      textAlign: 'center',
      marginBottom: theme.spacing.medium,
      color: theme.colors.error,
      fontSize: 14,
    },
    logo: {
      width: 180,
      height: 180,
      alignSelf: 'center',
      marginBottom: theme.spacing.large,
      borderRadius: theme.roundness * 2, // Make logo slightly rounded
    },
    forgotPasswordButton: {
      marginTop: theme.spacing.medium,
      alignSelf: 'center',
    },
    biometricButton: {
      marginTop: theme.spacing.medium,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <ConfigPopup
          visible={popupVisible}
          onDismiss={() => setPopupVisible(false)}
          onSave={handleSave}
          initialServerUrl={serverUrl}
          initialApiKey={apiKey}
          initialApiSecret={apiSecret}
        />
        <View style={styles.configButtonContainer}>
          <Button
            mode="outlined"
            onPress={() => setPopupVisible(true)}
            icon="cog"
            labelStyle={{ fontSize: 12 }}
            contentStyle={{ paddingHorizontal: theme.spacing.small }}
          >
            Config
          </Button>
        </View>
        <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>PRIME ERP</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          theme={{ roundness: theme.roundness }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          theme={{ roundness: theme.roundness }}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
        >
          Login
        </Button>
        {isBiometricAvailable && (
          <Button
            mode="outlined"
            onPress={handleBiometricLogin}
            style={[styles.button, styles.biometricButton]}
            loading={isLoading}
            disabled={isLoading}
            icon="fingerprint"
            labelStyle={{ fontSize: 16 }}
          >
            Login with Biometrics
          </Button>
        )}
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordButton}
          labelStyle={{ color: theme.colors.primary }}
        >
          Forgot Password?
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
