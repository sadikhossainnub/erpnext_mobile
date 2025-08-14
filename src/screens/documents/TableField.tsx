import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Text, useTheme, IconButton, Checkbox } from 'react-native-paper';
import { ERPField } from '../../types';
import LinkField from './LinkField';

interface TableFieldProps {
  label: string;
  value: any[];
  onValueChange: (value: any[]) => void;
  fields: ERPField[];
  docType: string;
}

const TableField: React.FC<TableFieldProps> = ({ label, value, onValueChange, fields, docType }) => {
  const theme = useTheme();
  const [data, setData] = useState(value);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    setData(value);
  }, [value]);

  useEffect(() => {
    setSelectedRows([]);
  }, [data]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    tableContainer: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 4,
      minHeight: 100, // Changed to minHeight for better flexibility
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      paddingVertical: 8, // Added vertical padding
    },
    headerCell: {
      flex: 1,
      paddingHorizontal: 8, // Adjusted padding
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
      textAlign: 'center', // Center align header text
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: 4, // Added vertical padding
    },
    cell: {
      flex: 1,
      paddingHorizontal: 8, // Adjusted padding
      textAlign: 'center', // Center align cell text
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 8,
      justifyContent: 'space-between',
    },
    leftButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    rightButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      backgroundColor: '#f0f0f0',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    buttonText: {
      color: '#000',
    },
    deleteButtonText: {
      color: theme.colors.onError,
    },
    checkboxCell: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageCell: {
      flex: 1,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreview: {
      width: 40,
      height: 40,
      resizeMode: 'cover',
      borderRadius: 4,
    },
    inputCell: {
      flex: 1,
      padding: 4,
      height: 40,
      textAlign: 'center', // Center align input text
      paddingHorizontal: 8,
    },
    actionsCell: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
    },
    // Added styles for better visual separation and alignment
    rowNumberCell: {
      flex: 0.5,
      paddingHorizontal: 8,
      textAlign: 'center',
    },
  });

  const handleSelectRow = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, index) => index));
    }
  };

  const addRow = () => {
    const newRow: any = {};
    fields.forEach((field: ERPField) => {
      if (field.fieldtype === 'Int' || field.fieldtype === 'Float' || field.fieldtype === 'Currency') {
        newRow[field.fieldname] = 0;
      } else {
        newRow[field.fieldname] = '';
      }
    });
    const newData = [...data, newRow];
    setData(newData);
    onValueChange(newData);
  };

  const addMultipleRows = () => {
    const newRows = [];
    for (let i = 0; i < 5; i++) {
      const newRow: any = {};
      fields.forEach((field: ERPField) => {
        if (field.fieldtype === 'Int' || field.fieldtype === 'Float' || field.fieldtype === 'Currency') {
          newRow[field.fieldname] = 0;
        } else {
          newRow[field.fieldname] = '';
        }
      });
      newRows.push(newRow);
    }
    const newData = [...data, ...newRows];
    setData(newData);
    onValueChange(newData);
  };

  const deleteRows = () => {
    const newData = data.filter((_, index) => !selectedRows.includes(index));
    setData(newData);
    onValueChange(newData);
  };

  const updateCell = (index: number, fieldname: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [fieldname]: value };
    setData(newData);
    onValueChange(newData);
  };

  const renderCell = (item: any, index: number, field: ERPField) => {
    const fieldtype = field.fieldtype;

    switch (fieldtype) {
      case 'Int':
      case 'Float':
      case 'Currency':
        return (
          <TextInput
            style={[styles.inputCell, { flex: 1 }]}
            keyboardType="numeric"
            value={item[field.fieldname]?.toString() || ''}
            onChangeText={(text) => {
              const parsedValue = fieldtype === 'Int' ? parseInt(text || '0', 10) : parseFloat(text || '0');
              updateCell(index, field.fieldname, isNaN(parsedValue) ? 0 : parsedValue);
            }}
          />
        );
      case 'Image':
        return (
          <View style={styles.imageCell} key={field.fieldname}>
            {item[field.fieldname] ? (
              <Image source={{ uri: item[field.fieldname] }} style={styles.imagePreview} />
            ) : (
              <Text>No Image</Text>
            )}
          </View>
        );
      case 'Link':
        return (
          <LinkField
            key={field.fieldname}
            label={field.label}
            value={item[field.fieldname]}
            options={field.options || ''}
            onValueChange={(val) => updateCell(index, field.fieldname, val)}
            docType={docType}
          />
        );
      default:
        return (
          <TextInput
            style={[styles.inputCell, { flex: 1 }]}
            value={item[field.fieldname]?.toString() || ''}
            onChangeText={(text) => updateCell(index, field.fieldname, text)}
          />
        );
    }
  };

  const renderRow = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.row} key={index}>
      <View style={styles.checkboxCell}>
        <Checkbox
          status={selectedRows.includes(index) ? 'checked' : 'unchecked'}
          onPress={() => handleSelectRow(index)}
        />
      </View>
      <Text style={styles.rowNumberCell}>{index + 1}</Text>
      {fields
        .filter((field) => field.in_list_view === 1)
        .map((field: ERPField) => (
          <View style={{ flex: 1 }} key={field.fieldname}>
            {renderCell(item, index, field)}
          </View>
        ))}
      <View style={styles.actionsCell} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tableContainer}>
        <View style={styles.headerRow}>
          <View style={styles.checkboxCell}>
            <Checkbox
              status={selectedRows.length === data.length && data.length > 0 ? 'checked' : 'unchecked'}
              onPress={handleSelectAllRows}
            />
          </View>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>No.</Text>
          {fields
            .filter((field) => field.in_list_view === 1)
            .map((field: ERPField) => (
              <Text key={field.fieldname} style={styles.headerCell}>
                {field.label}
              </Text>
            ))}
          <View style={styles.actionsCell} />
        </View>
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={(item, index) => index.toString()}
          style={{ flex: 1 }} // Added flex: 1 to FlatList
        />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.leftButtons}>
          <TouchableOpacity style={styles.button} onPress={addRow}>
            <Text style={styles.buttonText}>Add Row</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={addMultipleRows}>
            <Text style={styles.buttonText}>Add Multiple</Text>
          </TouchableOpacity>
          {selectedRows.length > 0 && (
            <TouchableOpacity style={styles.deleteButton} onPress={deleteRows}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.rightButtons} />
      </View>
    </View>
  );
};

export default TableField;
