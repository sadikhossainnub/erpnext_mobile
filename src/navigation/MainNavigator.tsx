import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ModulesScreen from '../screens/modules/ModulesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DocTypeListScreen from '../screens/documents/DocTypeListScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
import DocumentFormScreen from '../screens/documents/DocumentFormScreen';
import EmployeeAdvance from '../screens/documents/EmployeeAdvance';
import AccountingScreen from '../screens/modules/AccountingScreen';

// Define the parameter types for the stack navigator
export type MainStackParamList = {
  MainTabs: undefined;
  DocTypeList: { moduleName: string; docTypes: string[] };
  DocumentDetail: { docType: string; docName: string; title: string };
  DocumentForm: { docType: string; docName?: string; mode: 'create' | 'edit'; title: string };
  EmployeeAdvance: { docType: string; docName?: string; mode: 'create' | 'edit'; title: string };
  Accounting: undefined;
};

// Define the parameter types for the tab navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Modules: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Modules') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'circle';
          }

          return <Icon name={iconName} size={size + 4} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Modules" component={ModulesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (wraps the tabs and other screens)
export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DocTypeList"
        component={DocTypeListScreen}
        options={({ route }) => ({
          title: route.params.moduleName,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DocumentForm"
        component={DocumentFormScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="EmployeeAdvance"
        component={EmployeeAdvance}
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="Accounting"
        component={AccountingScreen}
        options={{
          title: 'Accounting',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
