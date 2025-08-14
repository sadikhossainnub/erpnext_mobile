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
      flex: 1, // Allow table container to expand vertically
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 4,
      minHeight: 100, // Ensure a minimum height
    },
    headerRow: {
      // Removed as headers will be part of each vertically stacked field
    },
    headerCell: {
      // Removed as headers will be part of each vertically stacked field
    },
    row: {
      flexDirection: 'column', // Stack fields vertically within each row
      borderBottomWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      paddingVertical: 8, // Adjusted vertical padding for the whole row
      paddingHorizontal: 8,
      marginBottom: 8, // Add some space between rows
    },
    cell: {
      flex: 1, // Cell will now contain the input/component
      paddingHorizontal: 4,
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
      flex: 1, // Ensure input takes available space
      padding: 4,
      height: 40,
      textAlign: 'left', // Align text to left for better readability in vertical layout
      paddingHorizontal: 8,
    },
    actionsCell: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end', // Align actions to the right
      width: 80, // Keep fixed width for actions
    },
    rowNumberAndCheckboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8, // Space below the row number/checkbox
    },
    rowNumberCell: {
      width: 50, // Fixed width for "No." column
      textAlign: 'center',
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    fieldRow: {
      flexDirection: 'row', // Label and input side-by-side
      alignItems: 'center',
      marginBottom: 8, // Space between fields
    },
    fieldLabel: {
      width: 100, // Fixed width for labels
      fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant,
      marginRight: 8,
    },
    linkFieldCell: {
      flex: 1, // LinkField will take remaining space
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
          <View style={styles.linkFieldCell}>
            <LinkField
              key={field.fieldname}
              label={field.label}
              value={item[field.fieldname]}
              options={field.options || ''}
              onValueChange={(val) => updateCell(index, field.fieldname, val)}
              docType={docType}
            />
          </View>
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
      <View style={styles.rowNumberAndCheckboxContainer}>
        <View style={styles.checkboxCell}>
          <Checkbox
            status={selectedRows.includes(index) ? 'checked' : 'unchecked'}
            onPress={() => handleSelectRow(index)}
          />
        </View>
        <Text style={styles.rowNumberCell}>{index + 1}</Text>
        {/* Removed actionsCell as it was empty and causing text rendering issues */}
      </View>
      {fields
        .filter((field) => field.in_list_view === 1)
        .map((field: ERPField) => (
          <View style={styles.fieldRow} key={field.fieldname}>
            <Text style={styles.fieldLabel}>{field.label}:</Text>
            <View style={styles.cell}>
              {renderCell(item, index, field)}
            </View>
          </View>
        ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tableContainer}>
        {/* Removed headerRow as fields are now stacked vertically within each row */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={data}
            renderItem={renderRow}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
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
