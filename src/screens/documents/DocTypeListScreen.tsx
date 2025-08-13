import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, Searchbar, IconButton, Divider } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getDocList } from '../../api/documents';
import { ERPDocument } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DocTypeList'>;
  route: RouteProp<MainStackParamList, 'DocTypeList'>;
};

export const DocTypeListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { moduleName, docTypes } = route.params;
  const [selectedDocType, setSelectedDocType] = useState<string | null>(docTypes[0] || null);
  const [documents, setDocuments] = useState<ERPDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const fetchDocuments = async (docType: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDocList(docType);
      if (result.data) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Failed to fetch documents');
        setDocuments([]);
      }
    } catch (err) {
      setError('An error occurred while fetching documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDocType) {
      fetchDocuments(selectedDocType);
    }
  }, [selectedDocType]);

  const handleDocTypeSelect = (docType: string) => {
    setSelectedDocType(docType);
  };

  const handleDocumentPress = (document: ERPDocument) => {
    navigation.navigate('DocumentDetail', {
      docType: selectedDocType!,
      docName: document.name,
      title: document.name,
    });
  };

  const handleCreateNew = () => {
    if (selectedDocType) {
      navigation.navigate('DocumentForm', {
        docType: selectedDocType,
        mode: 'create',
        title: `New ${selectedDocType}`,
      });
    }
  };

  const renderDocTypeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.docTypeItem,
        selectedDocType === item && styles.selectedDocType,
      ]}
      onPress={() => handleDocTypeSelect(item)}
    >
      <Text
        style={[
          styles.docTypeText,
          selectedDocType === item && styles.selectedDocTypeText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderDocumentItem = ({ item }: { item: ERPDocument }) => (
    <TouchableOpacity onPress={() => handleDocumentPress(item)}>
      <Card style={styles.documentCard}>
        <Card.Content>
          <Text style={styles.documentName}>{item.name}</Text>
          {Object.entries(item).map(([key, value]) => {
            if (key !== 'name' && key !== 'modified' && key !== 'owner' && value) {
              return (
                <Text key={key} style={styles.documentInfo}>
                  {key}: {value}
                </Text>
              );
            }
            return null;
          })}
          {item.modified && (
            <Text style={styles.documentInfo}>
              Modified: {new Date(item.modified).toLocaleString()}
            </Text>
          )}
          {item.owner && (
            <Text style={styles.documentInfo}>Owner: {item.owner}</Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{moduleName} Module</Text>
        <Text style={styles.headerSubtitle}>
          Select a document type to view or create new records
        </Text>
      </View>

      <View style={styles.docTypeContainer}>
        <FlatList
          data={docTypes}
          renderItem={renderDocTypeItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.docTypeList}
        />
      </View>
      
      <Divider />

      <View style={styles.documentListHeader}>
        <Searchbar
          placeholder="Search documents"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <IconButton
          icon="plus"
          size={24}
          onPress={handleCreateNew}
          style={styles.addButton}
          iconColor={theme.colors.primary}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredDocuments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>No documents found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.documentList}
        />
      )}
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
  docTypeContainer: {
    backgroundColor: '#fff',
  },
  docTypeList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  docTypeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedDocType: {
    backgroundColor: '#1976D2',
  },
  docTypeText: {
    fontWeight: '500',
  },
  selectedDocTypeText: {
    color: '#fff',
  },
  documentListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    marginLeft: 'auto',
  },
  documentList: {
    padding: 16,
  },
  documentCard: {
    marginBottom: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});

export default DocTypeListScreen;
