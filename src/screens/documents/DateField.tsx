import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DateFieldProps {
  field: {
    fieldname: string;
    label: string;
  } | null;
  control: Control<any>;
}

const DateField: React.FC<DateFieldProps> = ({ field, control }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Early return if field is null or undefined
  if (!field) {
    return (
      <View>
        <TextInput
          label="Date Field"
          value="Invalid field configuration"
          editable={false}
          mode="outlined"
          error
        />
      </View>
    );
  }

  // Helper to ensure we always pass a valid Date object to the picker
  const parseToDate = (val?: string | Date): Date => {
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === 'string' && !isNaN(Date.parse(val))) return new Date(val);
    return new Date();
  };

  return (
    <View>
      <Controller
        control={control}
        name={field.fieldname}
        defaultValue={new Date().toISOString()} // store as ISO string
        render={({ field: { onChange, value } }) => {
          const displayDate = parseToDate(value);
          return (
            <>
              <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                <TextInput
                  label={field.label}
                  value={displayDate.toLocaleDateString()}
                  editable={false}
                  mode="outlined"
                />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date: Date) => {
                  setDatePickerVisibility(false);
                  onChange(date.toISOString());
                }}
                onCancel={() => setDatePickerVisibility(false)}
                date={displayDate}
              />
            </>
          );
        }}
      />
    </View>
  );
};

export default DateField;
