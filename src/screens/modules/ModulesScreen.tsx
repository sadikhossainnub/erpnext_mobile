import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { getAvailableModules } from '../../api/modules';
import { Module } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

const iconMapping: { [key: string]: string } = {
  'shopping-cart': 'cart',
  package: 'package-variant',
  box: 'archive',
  'dollar-sign': 'currency-usd',
  users: 'account-group',
  clipboard: 'clipboard-text',
  user: 'account',
  settings: 'cog',
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'MainTabs'>;
};

export const ModulesScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { data: modules } = getAvailableModules();

  const handleModulePress = (module: Module) => {
    navigation.navigate('DocTypeList', {
      moduleName: module.name,
      docTypes: module.docTypes,
    });
  };

  const renderModuleItem = ({ item }: { item: Module }) => (
    <TouchableOpacity
      style={styles.moduleItem}
      onPress={() => handleModulePress(item)}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <IconButton
            icon={iconMapping[item.icon] || 'help-circle'}
            size={30}
            iconColor={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.moduleName}>{item.name}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ERPNext Modules</Text>
        <Text style={styles.headerSubtitle}>
          Access your business modules and documents
        </Text>
      </View>

      <FlatList
        data={modules}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    padding: 8,
  },
  moduleItem: {
    flex: 1,
    padding: 8,
    maxWidth: '50%',
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ModulesScreen;
