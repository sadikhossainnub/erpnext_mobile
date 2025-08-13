import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Subheading } from 'react-native-paper';
import { ERPField } from '../../types';
import LinkField from './LinkField';
import RatingField from './RatingField';
import { Checkbox, TextInput } from 'react-native-paper';

interface ChildDocFormProps {
  fields: ERPField[];
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

const ChildDocForm: React.FC<ChildDocFormProps> = ({ fields, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: ERPField) => {
    switch (field.fieldtype) {
      case 'Link':
        return (
          <LinkField
            label={field.label}
            value={formData[field.fieldname] || ''}
            onValueChange={(value) => handleInputChange(field.fieldname, value)}
            docType={field.options || ''}
          />
        );
      case 'Check':
        return (
          <Checkbox.Item
            label={field.label}
            status={formData[field.fieldname] ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange(field.fieldname, !formData[field.fieldname])}
          />
        );
      case 'Rating':
        return (
          <RatingField
            label={field.label}
            value={Number(formData[field.fieldname]) || 0}
            onValueChange={(value) => handleInputChange(field.fieldname, value)}
          />
        );
      default:
        return (
          <TextInput
            label={field.label}
            value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
            onChangeText={(text) => handleInputChange(field.fieldname, text)}
            keyboardType={field.fieldtype === 'Int' ? 'numeric' : 'default'}
          />
        );
    }
  };

  return (
    <ScrollView>
      <Card>
        <Card.Content>
          {fields.map((field) => (
            <View key={field.fieldname} style={{ marginBottom: 16 }}>
              {renderField(field)}
            </View>
          ))}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => onSave(formData)}>Save</Button>
          <Button onPress={onCancel}>Cancel</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

export default ChildDocForm;
