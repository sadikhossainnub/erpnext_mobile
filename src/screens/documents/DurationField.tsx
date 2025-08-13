import React from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const DurationField: React.FC<Props> = ({ field, control }) => {
  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { onChange, value } }) => (
        <View>
          <TextInput
            label={field.label}
            value={value ? String(value) : ''}
            onChangeText={onChange}
            keyboardType="numeric"
            placeholder="e.g., 1h 30m"
          />
        </View>
      )}
    />
  );
};

export default DurationField;
