import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Text, useTheme, IconButton, Checkbox } from 'react-native-paper';
import { ERPField } from '../../types';

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
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
    },
    headerCell: {
      flex: 1,
      padding: 8,
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    cell: {
      flex: 1,
      padding: 8,
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
      textAlign: 'right',
      paddingRight: 8,
    },
    actionsCell: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
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
        newRow[field.fieldname] = field.fieldname === 'quantity' ? 1 : 0;
      } else {
        newRow[field.fieldname] = '';
      }
    });
    const newData = [...data, newRow];
    const rate = parseFloat(newRow.rate) || 0;
    const quantity = parseFloat(newRow.quantity) || 0;
    newRow.amount = (rate * quantity).toFixed(2);
    setData(newData);
    onValueChange(newData);
  };

  const addMultipleRows = () => {
    const newRows = [];
    for (let i = 0; i < 5; i++) {
      const newRow: any = {};
      fields.forEach((field: ERPField) => {
        if (field.fieldtype === 'Int' || field.fieldtype === 'Float' || field.fieldtype === 'Currency') {
          newRow[field.fieldname] = field.fieldname === 'quantity' ? 1 : 0;
        } else {
          newRow[field.fieldname] = '';
        }
      });
      const rate = parseFloat(newRow.rate) || 0;
      const quantity = parseFloat(newRow.quantity) || 0;
      newRow.amount = (rate * quantity).toFixed(2);
      newRows.push(newRow);
    }
    const newData = [...data, ...newRows];
    setData(newData);
    onValueChange(newData);
  };

  const updateCell = (index: number, fieldname: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [fieldname]: value };

    if (fieldname === 'quantity' || fieldname === 'rate') {
      const rate = parseFloat(newData[index].rate) || 0;
      const quantity = parseFloat(newData[index].quantity) || 0;
      newData[index].amount = (rate * quantity).toFixed(2);
    }

    if (newData[index].quantity < 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than or equal to 0');
      return;
    }
    setData(newData);
    onValueChange(newData);
  };

  const renderCell = (item: any, index: number, field: ERPField) => {
    if (field.fieldname === 'new_image') {
      return (
        <View style={styles.imageCell} key={field.fieldname}>
          {item[field.fieldname] ? (
            <Image source={{ uri: item[field.fieldname] }} style={styles.imagePreview} />
          ) : (
            <Text>No Image</Text>
          )}
        </View>
      );
    } else if (field.fieldname === 'quantity') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <IconButton icon="minus" size={20} onPress={() => updateCell(index, 'quantity', Math.max(0, parseFloat(item.quantity || 0) - 1))} />
          <TextInput
            key={field.fieldname}
            style={[styles.inputCell, { flex: 1 }]}
            keyboardType="numeric"
            value={item[field.fieldname]?.toString() || ''}
            onChangeText={(text) => updateCell(index, field.fieldname, text)}
          />
          <IconButton icon="plus" size={20} onPress={() => updateCell(index, 'quantity', parseFloat(item.quantity || 0) + 1)} />
        </View>
      )
    } else if (field.fieldname === 'rate') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ paddingLeft: 8 }}>৳</Text>
          <TextInput
            key={field.fieldname}
            style={[styles.inputCell, { flex: 1 }]}
            keyboardType="numeric"
            value={item[field.fieldname]?.toString() || ''}
            onChangeText={(text) => updateCell(index, field.fieldname, text)}
          />
        </View>
      )
    } else if (field.fieldname === 'amount') {
      return (
        <Text key={field.fieldname} style={[styles.cell, { textAlign: 'right' }]}>
          ৳ {item[field.fieldname]}
        </Text>
      );
    } else {
      return (
        <Text key={field.fieldname} style={styles.cell}>
          {item[field.fieldname]}
        </Text>
      );
    }
  };

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
          {fields.map((field: ERPField) => (
            <Text key={field.fieldname} style={styles.headerCell}>
              {field.label}
            </Text>
          ))}
          <View style={styles.actionsCell}>
            <IconButton icon="cog" size={20} />
          </View>
        </View>
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={styles.checkboxCell}>
                <Checkbox
                  status={selectedRows.includes(index) ? 'checked' : 'unchecked'}
                  onPress={() => handleSelectRow(index)}
                />
              </View>
              <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
              {fields.map((field: ERPField) => renderCell(item, index, field))}
              <View style={styles.actionsCell}>
                <IconButton icon="pencil" size={20} onPress={() => {}} />
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
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
        </View>
        <View style={styles.rightButtons}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TableField;
