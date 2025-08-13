import React from 'react';
import { View, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const AttachImageField: React.FC<Props> = ({ field, control }) => {
  // This is a placeholder. Image picking logic would be implemented here.
  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { value } }) => (
        <View>
          <Text>{field.label}</Text>
          <Button mode="outlined" onPress={() => { /* TODO: Implement image picker */ }}>
            Attach Image
          </Button>
          {value && <Image source={{ uri: value }} style={{ width: 100, height: 100, marginTop: 8 }} />}
        </View>
      )}
    />
  );
};

export default AttachImageField;
