import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Button, List, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainNavigator';

type Props = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Profile'>;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, serverUrl } = useAuth();
  const theme = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  let avatarUrl = 'https://www.gravatar.com/avatar/';
  if (user?.user_image) {
    try {
      avatarUrl = new URL(user.user_image, serverUrl).href;
    } catch (e) {
      console.error('Invalid user_image URL:', e);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.user_image ? (
          <Avatar.Image size={80} source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Avatar.Text
            size={80}
            label={user ? getInitials(user.fullName) : '?'}
            style={styles.avatar}
          />
        )}
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <List.Item
          title="Server"
          description={serverUrl || 'Not connected'}
          left={(props) => <List.Icon {...props} icon="server" />}
        />
        
        <Divider />
        
        <List.Item
          title="User ID"
          description={user?.id || 'Unknown'}
          left={(props) => <List.Icon {...props} icon="card-account-details" />}
        />
        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        <List.Item
          title="App Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        
        <Divider />
        
        <List.Item
          title="Settings"
          description="App preferences and configuration"
          left={(props) => <List.Icon {...props} icon="cog" />}
          onPress={() => {
            // Navigate to settings screen if implemented
            Alert.alert('Settings', 'Settings functionality not implemented yet');
          }}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#f44336"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
  },
});

export default ProfileScreen;
