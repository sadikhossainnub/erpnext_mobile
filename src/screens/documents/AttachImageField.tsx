import React from 'react';
import { View, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';
import { ERPField } from '../../types';

type Props = {
  field: ERPField;
  control: Control;
};

const AttachImageField: React.FC<Props> = ({ field, control }) => {
  const chooseImage = (onChange: (uri: string) => void) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        onChange(response.assets[0].uri || '');
      }
    });
  };

  return (
    <Controller
      control={control}
      name={field.fieldname}
      render={({ field: { onChange, value } }) => (
        <View>
          <Text>{field.label}</Text>
          <Button mode="outlined" onPress={() => chooseImage(onChange)}>
            Attach Image
          </Button>
          {value && <Image source={{ uri: value }} style={{ width: 100, height: 100, marginTop: 8 }} />}
        </View>
      )}
    />
  );
};

export default AttachImageField;
