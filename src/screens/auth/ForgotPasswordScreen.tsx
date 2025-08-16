import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    setIsLoading(true);
    setMessage('');
    // In a real application, you would make an API call here
    // to send a password reset email.
    console.log('Reset password for email:', email);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    setMessage('If an account with that email exists, a password reset link has been sent.');
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleResetPassword}
        style={styles.button}
        loading={isLoading}
        disabled={isLoading}
      >
        Reset Password
      </Button>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Back to Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: 'green',
  },
  backButton: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
