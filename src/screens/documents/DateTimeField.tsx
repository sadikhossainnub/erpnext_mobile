import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const DateTimeField: React.FC<Props> = ({ field, control }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const theme = useTheme();

  const showMode = (currentMode: 'date' | 'time') => {
    setShowPicker(true);
    setPickerMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { onChange, value } }) => {
        const selectedDate = value ? new Date(value) : new Date();

        const onDateTimeChange = (
          event: DateTimePickerEvent,
          selectedValue?: Date
        ) => {
          setShowPicker(Platform.OS === 'ios');
          if (selectedValue) {
            const currentDate = new Date(value || selectedValue);
            if (event.type === 'set') {
              if (pickerMode === 'date') {
                currentDate.setFullYear(selectedValue.getFullYear());
                currentDate.setMonth(selectedValue.getMonth());
                currentDate.setDate(selectedValue.getDate());
              } else if (pickerMode === 'time') {
                currentDate.setHours(selectedValue.getHours());
                currentDate.setMinutes(selectedValue.getMinutes());
              }
            }
            onChange(currentDate.toISOString());
          }
        };

        return (
          <View>
            <TextInput
              label={field.label}
              value={value ? new Date(value).toLocaleString() : ''}
              editable={false}
              style={{ backgroundColor: theme.colors.background }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
              <Button onPress={showDatepicker} mode="outlined">
                Select Date
              </Button>
              <Button onPress={showTimepicker} mode="outlined">
                Select Time
              </Button>
            </View>
            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedDate}
                mode={pickerMode}
                is24Hour={true}
                display="default"
                onChange={onDateTimeChange}
              />
            )}
          </View>
        );
      }}
    />
  );
};

export default DateTimeField;
