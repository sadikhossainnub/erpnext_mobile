import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const AttachField: React.FC<Props> = ({ field, control }) => {
  // This is a placeholder. Document/image picking logic would be implemented here.
  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { value } }) => (
        <View>
          <Text>{field.label}</Text>
          <Button mode="outlined" onPress={() => { /* TODO: Implement file picker */ }}>
            Attach File
          </Button>
          {value && <Text>Attached: {value}</Text>}
        </View>
      )}
    />
  );
};

export default AttachField;
