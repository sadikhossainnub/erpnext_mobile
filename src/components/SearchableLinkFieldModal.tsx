import React, { useState, useEffect } from 'react';
import { Modal, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, TextInput, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { searchDocuments } from '../api/documents';
import { ERPDocument } from '../types';

interface SearchableLinkFieldModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  docType: string;
  currentValue: string;
  filters?: Record<string, any>; // New prop for dynamic filters
}

const SearchableLinkFieldModal: React.FC<SearchableLinkFieldModalProps> = ({
  visible,
  onClose,
  onSelect,
  docType,
  currentValue,
  filters, // Add filters to destructuring
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<ERPDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      width: '90%',
      maxHeight: '80%',
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    searchInput: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    listItem: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backdrop,
    },
    selectedListItem: {
      backgroundColor: theme.colors.primaryContainer,
    },
    listItemText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      color: theme.colors.onSurfaceVariant,
    },
  });

  useEffect(() => {
    if (visible) {
      setSearchQuery(''); // Reset search query when modal opens
      setDocuments([]); // Clear previous documents
      fetchDocuments(''); // Fetch all documents initially
    }
  }, [visible, docType, filters]); // Add filters to dependency array

  const fetchDocuments = async (query: string) => {
    setLoading(true);
    try {
      const combinedFilters = { ...(filters || {}), ...(query ? { name: ['like', `%${query}%`] } : {}) };
      const result = await searchDocuments(docType, { filters: combinedFilters });
      if (result.data) {
        setDocuments(result.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchDocuments(query);
  };

  const handleSelectDocument = (docName: string) => {
    onSelect(docName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select {docType}</Text>
            <IconButton icon="close" onPress={onClose} />
          </View>
          <TextInput
            label="Search"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
            mode="outlined"
            placeholder={`Search ${docType}...`}
          />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : documents.length > 0 ? (
            <FlatList
              data={documents}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    item.name === currentValue && styles.selectedListItem,
                  ]}
                  onPress={() => handleSelectDocument(item.name)}
                >
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noResultsText}>No results found.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SearchableLinkFieldModal;
