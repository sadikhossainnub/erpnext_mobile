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
  const rawDocType = watch(options);
  // Capitalize the first letter of the docType to match ERPNext naming conventions
  const docType = rawDocType ? rawDocType.charAt(0).toUpperCase() + rawDocType.slice(1) : '';

  return (
    <View>
      <LinkField
        label={label}
        value={value}
        onValueChange={onValueChange}
        options={docType} // Pass the capitalized docType to LinkField's options prop
        docType={''} // Pass an empty string for the parent docType, as it's not relevant here
      />
    </View>
  );
};

export default DynamicLinkField;
