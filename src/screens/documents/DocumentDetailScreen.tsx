import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Divider, List, useTheme } from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getDocument, deleteDocument, getDocTypeMetadata } from '../../api/documents';
import { ERPDocument, DocPerm } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DocumentDetail'>;
  route: RouteProp<MainStackParamList, 'DocumentDetail'>;
};

export const DocumentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { docType, docName } = route.params;
  const [document, setDocument] = useState<ERPDocument | null>(null);
  const [docMeta, setDocMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const fetchDocument = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const [docResult, metaResult] = await Promise.all([
        getDocument(docType, docName),
        getDocTypeMetadata(docType)
      ]);

      if (docResult.data) {
        setDocument(docResult.data);
      } else {
        setError(docResult.error || 'Failed to fetch document');
      }

      if (metaResult.data) {
        setDocMeta(metaResult.data);
      } else {
        // setError(metaResult.error || 'Failed to fetch document metadata');
      }
    } catch (err) {
      setError('An error occurred while fetching document details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docType, docName]);

  const handleRefresh = () => {
    fetchDocument(true);
  };

  const handleEdit = () => {
    navigation.navigate('DocumentForm', {
      docType,
      docName,
      mode: 'edit',
      title: `Edit ${docName}`,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete this ${docType}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteDocument(user, docType, docName);
              if (!result.error) {
                navigation.goBack();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete document');
              }
            } catch (err) {
              Alert.alert('Error', 'An error occurred while deleting the document');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const canEdit = docMeta?.permissions && document?.owner
    ? hasPermission(user, docMeta.permissions, 'write', document.owner)
    : false;
  const canDelete = docMeta?.permissions && document?.owner
    ? hasPermission(user, docMeta.permissions, 'delete', document.owner)
    : false;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading document details...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : document ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerContainer}>
                <View>
                  <Text style={styles.title}>{document.name}</Text>
                  <Text style={styles.docType}>{docType}</Text>
                </View>
                {document.docstatus !== undefined && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.docstatus) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(document.docstatus)}</Text>
                  </View>
                )}
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.metaContainer}>
                <Text style={styles.metaItem}>Created: {new Date(document.creation).toLocaleString()}</Text>
                <Text style={styles.metaItem}>Modified: {new Date(document.modified).toLocaleString()}</Text>
                <Text style={styles.metaItem}>Owner: {document.owner}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Document Fields" />
            <Card.Content>
              <View style={styles.fieldsContainer}>
                {docMeta?.fields.map((field: any) => {
                  const value = document[field.fieldname];
                  if (['name', 'doctype', 'creation', 'modified', 'owner', 'docstatus'].includes(field.fieldname) || field.hidden || !value) {
                    return null;
                  }
                  return (
                    <View key={field.fieldname} style={styles.fieldItem}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      {field.fieldtype === 'Text Editor' ? (
                        <RenderHTML
                          contentWidth={width}
                          source={{ html: String(value) }}
                        />
                      ) : (
                        <Text style={styles.fieldValue}>{String(value)}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            {canEdit && (
              <Button
                mode="contained"
                onPress={handleEdit}
                style={[styles.button, styles.editButton]}
                icon="pencil"
              >
                Edit
              </Button>
            )}
            
            {canDelete && (
              <Button
                mode="contained"
                onPress={handleDelete}
                style={[styles.button, styles.deleteButton]}
                buttonColor="#f44336"
                icon="delete"
              >
                Delete
              </Button>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text>Document not found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const getStatusColor = (docstatus: number) => {
  switch (docstatus) {
    case 0: // Draft
      return '#FFC107'; // Amber
    case 1: // Submitted
      return '#4CAF50'; // Green
    case 2: // Cancelled
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
};

const getStatusLabel = (docstatus: number) => {
  switch (docstatus) {
    case 0:
      return 'Draft';
    case 1:
      return 'Submitted';
    case 2:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fieldItem: {
    width: '48%', // Two columns
    marginBottom: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#555',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
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
    borderRadius: 8,
    marginBottom: 16,
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
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  docType: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  metaContainer: {
    marginTop: 8,
  },
  metaItem: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    marginLeft: 0,
  },
  deleteButton: {
    marginRight: 0,
  },
});

export default DocumentDetailScreen;
