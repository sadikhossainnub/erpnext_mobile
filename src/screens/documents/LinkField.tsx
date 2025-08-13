import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { searchDocuments } from '../../api/documents';
import { ERPDocument } from '../../types';

interface LinkFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  docType: string;
}

const LinkField: React.FC<LinkFieldProps> = ({ label, value, onValueChange, docType }) => {
  const [documents, setDocuments] = useState<ERPDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    picker: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.backdrop,
      borderRadius: 4,
    },
  });

  const fetchDocumentsForPicker = async () => {
    setLoading(true);
    const result = await searchDocuments(docType, { filters: {} });
    if (result.data) {
      setDocuments(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocumentsForPicker();
  }, [docType]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue: string) => onValueChange(itemValue)}
        >
          <Picker.Item label="Select..." value="" />
          {documents.map((doc) => (
            <Picker.Item key={doc.name} label={doc.name} value={doc.name} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default LinkField;
