import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const TimeField: React.FC<Props> = ({ field, control }) => {
  const [showPicker, setShowPicker] = useState(false);
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { onChange, value } }) => {
        const selectedTime = value ? new Date(`1970-01-01T${value}`) : new Date();

        const onTimeChange = (event: any, selectedValue?: Date) => {
          setShowPicker(Platform.OS === 'ios');
          if (selectedValue) {
            onChange(selectedValue.toTimeString().split(' ')[0]);
          }
        };

        return (
          <View>
            <TextInput
              label={field.label}
              value={value || ''}
              editable={false}
              style={{ backgroundColor: theme.colors.background }}
            />
            <Button onPress={() => setShowPicker(true)} mode="outlined" style={{ marginTop: 8 }}>
              Select Time
            </Button>
            {showPicker && (
              <DateTimePicker
                testID="timePicker"
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>
        );
      }}
    />
  );
};

export default TimeField;
