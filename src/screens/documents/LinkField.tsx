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
}

const LinkField: React.FC<LinkFieldProps> = ({ label, value, onValueChange, options, docType }) => {
  const [modalVisible, setModalVisible] = useState(false);
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
    inputContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.backdrop,
      paddingHorizontal: 12,
      paddingVertical: 8,
      justifyContent: 'center',
      minHeight: 56, // Match TextInput height
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
      <Text style={styles.label}>{label}</Text>
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
      />
    </View>
  );
};

export default LinkField;
