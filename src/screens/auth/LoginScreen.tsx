import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 28,
      marginBottom: 24,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 8,
      paddingVertical: 8,
    },
    error: {
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    logo: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
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
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={() => login(email, password)}
        style={styles.button}
        loading={isLoading}
        disabled={isLoading}
      >
        Login
      </Button>
    </View>
  );
};

export default LoginScreen;
