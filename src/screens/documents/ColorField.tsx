import React from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const ColorField: React.FC<Props> = ({ field, control }) => {
  // This is a basic implementation. A color picker could be integrated here.
  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { onChange, value } }) => (
        <View>
          <TextInput
            label={field.label}
            value={value || ''}
            onChangeText={onChange}
            placeholder="e.g., #FF5733"
          />
          <View style={{ width: 30, height: 30, backgroundColor: value || '#FFFFFF', marginTop: 8, borderWidth: 1, borderColor: '#000' }} />
        </View>
      )}
    />
  );
};

export default ColorField;
