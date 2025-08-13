import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme, Card, Subheading, Checkbox } from 'react-native-paper';
import { useForm, FormProvider } from 'react-hook-form';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getDocument, updateDocument, createDocument, getDocTypeMetadata } from '../../api/documents';
import { ERPDocument, ERPField } from '../../types';
import LinkField from './LinkField';
import RatingField from './RatingField';
import TableField from './TableField';
import SelectField from './SelectField';
import DateField from './DateField';
import DynamicLinkField from './DynamicLinkField';
import DateTimeField from './DateTimeField';
import TimeField from './TimeField';
import DurationField from './DurationField';
import ColorField from './ColorField';
import AttachField from './AttachField';
import AttachImageField from './AttachImageField';
import BarcodeField from './BarcodeField';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DocumentForm'>;
  route: RouteProp<MainStackParamList, 'DocumentForm'>;
};

const DocumentFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { docType, docName, mode } = route.params;
  const methods = useForm();
  const { control, handleSubmit, setValue, watch } = methods;
  const formData = watch();
  const [document, setDocument] = useState<ERPDocument | null>(null);
  const [fields, setFields] = useState<ERPField[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<{ key: string; title: string }[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    subheading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    card: {
      borderRadius: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },
    errorContainer: {
      padding: 16,
      backgroundColor: '#ffebee',
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: '#c62828',
    },
    fieldContainer: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: '#FFFFFF',
    },
    saveButton: {
      flex: 1,
    },
  });

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDocTypeMetadata(docType);
      if (result.data) {
        setFields(result.data.fields);
        setFieldOrder(result.data.field_order);
      } else {
        setError(result.error || 'Failed to fetch metadata');
      }
    } catch (err) {
      setError('An error occurred while fetching metadata');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async (isRefreshing = false) => {
    if (mode === 'edit' && docName) {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const [docResult, metaResult] = await Promise.all([
          getDocument(docType, docName),
          getDocTypeMetadata(docType),
        ]);

        if (docResult.data) {
          const doc = docResult.data;
          setDocument(doc);
          Object.keys(doc).forEach(key => {
            setValue(key, doc[key]);
          });
        } else {
          setError(docResult.error || 'Failed to fetch document');
        }

        if (metaResult.data) {
          const sortedFields = metaResult.data.field_order.map((fieldname: string) => 
            metaResult.data.fields.find((f: ERPField) => f.fieldname === fieldname)
          ).filter(Boolean);

          setFields(sortedFields);
          setFieldOrder(metaResult.data.field_order);

          const tabFields = sortedFields.filter((f: ERPField) => f.fieldtype === 'Tab Break');
          if (tabFields.length > 0) {
            const firstTab = { key: 'details_tab', title: 'Details' };
            const otherTabs = tabFields.map((f: ERPField) => ({ key: f.fieldname, title: f.label }));
            setRoutes([firstTab, ...otherTabs]);
          }
        } else {
          setError((prev) => (prev ? `${prev}, ${metaResult.error || ''}` : metaResult.error || null));
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    } else {
      fetchMetadata();
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docType, docName, mode]);

  const handleRefresh = () => {
    fetchDocument(true);
  };

  const handleInputChange = (key: string, value: any) => {
    setValue(key, value);
  };

  const handleSave = async (data: any) => {
    setSaving(true);
    setError(null);
    try {
      let result;
      if (mode === 'edit' && docName) {
        result = await updateDocument(docType, docName, data);
      } else {
        result = await createDocument(docType, data);
      }

      if (result.data) {
        navigation.goBack();
      } else {
        setError(result.error || 'Failed to save document');
      }
    } catch (err) {
      setError('An error occurred while saving the document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderField = (field: ERPField) => {
    const fieldType = field.fieldtype.toLowerCase();

    switch (fieldType) {
      case 'select':
        if (field.options) {
          const options = field.options.split('\n');
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <SelectField
                label={field.label}
                options={options}
                selectedValue={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
                onValueChange={(value) => handleInputChange(field.fieldname, value)}
              />
            </View>
          );
        }
        return null;

      case 'link':
        if (field.options) {
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <LinkField
                label={field.label}
                value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
                onValueChange={(text) => handleInputChange(field.fieldname, text)}
                docType={field.options}
              />
            </View>
          );
        }
        return null;

      case 'check':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <Checkbox.Item
              label={field.label}
              status={formData[field.fieldname] ? 'checked' : 'unchecked'}
              onPress={() => handleInputChange(field.fieldname, !formData[field.fieldname])}
            />
          </View>
        );

      case 'rating':
      case 'ratting':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <RatingField
              label={field.label}
              value={Number(formData[field.fieldname]) || 0}
              onValueChange={(value) => handleInputChange(field.fieldname, value)}
            />
          </View>
        );

      case 'section break':
        return (
          <Subheading key={field.fieldname} style={styles.subheading}>
            {field.label}
          </Subheading>
        );

      case 'column break':
        return (
          <Subheading key={field.fieldname} style={styles.subheading}>
            {field.label}
          </Subheading>
        );

      case 'table':
      case 'child table':
        if (field.options) {
          const childFields = fields.filter((f: ERPField) => f.parent === field.options);
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <TableField
                label={field.label}
                value={formData[field.fieldname] || []}
                onValueChange={(value) => handleInputChange(field.fieldname, value)}
                fields={childFields}
                docType={field.options}
              />
            </View>
          );
        }
        return null;

      case 'date':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <DateField field={field} control={control} />
          </View>
        );

      case 'dynamic link':
        if (field.options) {
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <DynamicLinkField
                label={field.label}
                value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
                onValueChange={(text) => handleInputChange(field.fieldname, text)}
                options={field.options}
              />
            </View>
          );
        }
        return null;

      case 'long text':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder=" "
            />
          </View>
        );

      case 'currency':
      case 'float':
      case 'int':
      case 'percent':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              keyboardType="numeric"
              placeholder=" "
            />
          </View>
        );

      case 'button':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <Button mode="contained" onPress={() => { /* TODO: handle button click */ }}>
              {field.label}
            </Button>
          </View>
        );

      case 'read only':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              editable={false}
              style={styles.input}
              placeholder=" "
            />
          </View>
        );

      case 'attach':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <AttachField field={field} control={control} />
          </View>
        );
      case 'attach image':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <AttachImageField field={field} control={control} />
          </View>
        );
      case 'barcode':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <BarcodeField field={field} control={control} />
          </View>
        );
      case 'datetime':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <DateTimeField field={field} control={control} />
          </View>
        );
      case 'time':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <TimeField field={field} control={control} />
          </View>
        );
      case 'duration':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <DurationField field={field} control={control} />
          </View>
        );
      case 'color':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <ColorField field={field} control={control} />
          </View>
        );

      case 'data':
      case 'text':
      default:
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              placeholder=" "
            />
          </View>
        );
    }
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    let fieldsInTab: ERPField[] = [];
    const firstTabBreakIndex = fields.findIndex(f => f.fieldtype === 'Tab Break');

    if (route.key === 'details_tab') {
      // Fields for the first tab are all fields until the first Tab Break
      fieldsInTab = firstTabBreakIndex === -1 ? [...fields] : fields.slice(0, firstTabBreakIndex);
    } else {
      // Logic for subsequent tabs
      const currentTabBreakIndex = fields.findIndex(f => f.fieldname === route.key);
      
      // Find the next tab break after the current one
      let nextTabBreakIndex = -1;
      for (let i = currentTabBreakIndex + 1; i < fields.length; i++) {
        if (fields[i].fieldtype === 'Tab Break') {
          nextTabBreakIndex = i;
          break;
        }
      }

      const start = currentTabBreakIndex + 1;
      const end = nextTabBreakIndex === -1 ? undefined : nextTabBreakIndex;
      fieldsInTab = fields.slice(start, end);
    }

    return (
      <FlatList
        style={styles.contentContainer}
        data={fieldsInTab.filter((field) => {
          if (field.hidden || field.read_only || field.fieldtype === 'Section Break') {
            return false;
          }
          if (field.depends_on) {
            try {
              const condition = field.depends_on.startsWith('eval:')
                ? field.depends_on.substring(5)
                : `doc.${field.depends_on}`;
              const safeFormData = new Proxy(formData, {
                get: (target, prop) => {
                  if (typeof prop === 'string') {
                    return prop in target ? target[prop] : undefined;
                  }
                  return undefined;
                },
              });
              const result = new Function('doc', `return ${condition}`)(safeFormData);
              return !!result;
            } catch (e) {
              console.error(`Error evaluating depends_on for ${field.fieldname}:`, e);
              return false;
            }
          }
          return true;
        })}
        renderItem={({ item }) => renderField(item)}
        keyExtractor={(item) => item.fieldname}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    );
  };

  const renderFormContent = () => {
    if (routes.length > 0) {
      return (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              scrollEnabled
              style={{ backgroundColor: 'white' }}
              indicatorStyle={{ backgroundColor: 'black' }}
              tabStyle={{ width: 'auto' }}
              // @ts-ignore
              labelStyle={{ color: 'black' }}
            />
          )}
        />
      );
    }

    return (
      <FlatList
        style={styles.contentContainer}
        data={fields.filter((field) => {
          if (field.hidden || field.read_only || field.fieldtype === 'Section Break') {
            return false;
          }
          if (field.depends_on) {
            try {
              const condition = field.depends_on.startsWith('eval:')
                ? field.depends_on.substring(5)
                : `doc.${field.depends_on}`;
              const safeFormData = new Proxy(formData, {
                get: (target, prop) => {
                  if (typeof prop === 'string') {
                    return prop in target ? target[prop] : undefined;
                  }
                  return undefined;
                },
              });
              const result = new Function('doc', `return ${condition}`)(safeFormData);
              return !!result;
            } catch (e) {
              console.error(`Error evaluating depends_on for ${field.fieldname}:`, e);
              return false;
            }
          }
          return true;
        })}
        renderItem={({ item }) => renderField(item)}
        keyExtractor={(item) => item.fieldname}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    );
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {renderFormContent()}
        <Card.Actions>
          <Button
            mode="contained"
            onPress={handleSubmit(handleSave)}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Document'}
          </Button>
        </Card.Actions>
      </View>
    </FormProvider>
  );
};

export default DocumentFormScreen;
