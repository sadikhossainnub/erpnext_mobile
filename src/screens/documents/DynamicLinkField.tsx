import React from 'react';
import { View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import LinkField from './LinkField';

interface DynamicLinkFieldProps {
  label: string;
  value: string;
  onValueChange: (text: string) => void;
  options: string;
}

const DynamicLinkField: React.FC<DynamicLinkFieldProps> = ({ label, value, onValueChange, options }) => {
  const { watch } = useFormContext();
  const docType = watch(options);

  return (
    <View>
      <LinkField
        label={label}
        value={value}
        onValueChange={onValueChange}
        docType={docType}
      />
    </View>
  );
};

export default DynamicLinkField;
