import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, useTheme } from 'react-native-paper';

interface SelectFieldProps {
  label: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, selectedValue, onValueChange }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue: string) => onValueChange(itemValue)}
        >
          <Picker.Item label="Select..." value="" />
          {options.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default SelectField;
