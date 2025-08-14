import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator, TextInput } from 'react-native-paper';
import { searchDocuments } from '../../api/documents';
import { ERPDocument } from '../../types';
import SearchableLinkFieldModal from '../../components/SearchableLinkFieldModal';

interface LinkFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string; // This will be the docType for the linked document
  docType: string; // This is the docType of the parent document
  filters?: Record<string, any>; // New prop for dynamic filters
}

const LinkField: React.FC<LinkFieldProps> = ({ label, value, onValueChange, options, docType, filters }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      // Removed marginBottom to prevent extra spacing in table cells
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    inputContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.backdrop,
      paddingHorizontal: 8, // Adjusted padding
      paddingVertical: 4, // Adjusted padding
      justifyContent: 'center',
      minHeight: 40, // Adjusted to be more compact for table cells
    },
    inputText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    placeholderText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.inputContainer}>
        {value ? (
          <Text style={styles.inputText}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>Select {label}...</Text>
        )}
      </TouchableOpacity>

      <SearchableLinkFieldModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
        docType={options} // 'options' prop from LinkField is the docType for the linked document
        currentValue={value}
        filters={filters} // Pass the new filters prop
      />
    </View>
  );
};

export default LinkField;
