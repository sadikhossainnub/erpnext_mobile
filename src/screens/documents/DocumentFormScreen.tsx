import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme, Card, Subheading, Checkbox } from 'react-native-paper';
import { useForm, FormProvider } from 'react-hook-form';
import { TabView, TabBar } from 'react-native-tab-view';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getDocument, updateDocument, createDocument, getDocTypeMetadata, createSalesOrderFromQuotation } from '../../api/documents';
import { ERPDocument, ERPField } from '../../types';
import LinkField from './LinkField';
import RatingField from './RatingField';
import TableField from './TableField';
import SelectField from './SelectField';
import DateField from './DateField';
import DynamicLinkField from './DynamicLinkField';
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
  const { docType = '', docName = '', mode = 'create' } = route.params || {};
  const methods = useForm();
  const { control, handleSubmit, setValue, watch } = methods;
  const formData = watch();
  const [document, setDocument] = useState<ERPDocument | null>(null);
  const [fields, setFields] = useState<ERPField[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreatingSalesOrder, setIsCreatingSalesOrder] = useState(false);
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
    if (!docType) {
      setLoading(false);
      setError('Document type is missing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getDocTypeMetadata(docType);
      if (result.data) {
        const parentFields = result.data.fields;
        const childFetchPromises = (parentFields || [])
          .filter((f: ERPField) => f.fieldtype === 'Table' && f.options)
          .map((f: ERPField) => getDocTypeMetadata(f.options!));
        
        const childMetaResults = await Promise.all(childFetchPromises);
        const childFields = childMetaResults.flatMap(res => res.data ? res.data.fields : []);

        setFields([...parentFields, ...childFields]);
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
    if (!docType) {
      setLoading(false);
      setError('Document type is missing.');
      return;
    }
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

          const parentFields = metaResult.data.fields || [];
          const childFetchPromises = parentFields
            .filter((f: ERPField) => f.fieldtype === 'Table' && f.options)
            .map((f: ERPField) => getDocTypeMetadata(f.options!));

          const childMetaResults = await Promise.all(childFetchPromises);
          const childFields = childMetaResults.flatMap(res => res.data ? res.data.fields : []);
          
          const allFields = [...parentFields, ...childFields];
          setFields(allFields);
          setFieldOrder(metaResult.data.field_order);

          const tabFields = (metaResult.data.fields || []).filter((f: ERPField) => f.fieldtype === 'Tab Break');
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

  const handleCreateSalesOrder = async () => {
    if (docName) {
      setIsCreatingSalesOrder(true);
      setError(null);
      try {
        const result = await createSalesOrderFromQuotation(docName);
        if (result.data) {
          navigation.replace('DocumentForm', {
            docType: 'Sales Order',
            docName: result.data.name,
            mode: 'edit',
            title: result.data.name,
          });
        } else {
          setError(result.error || 'Failed to create Sales Order');
        }
      } catch (err) {
        setError('An error occurred while creating the Sales Order');
      } finally {
        setIsCreatingSalesOrder(false);
      }
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

  let effectiveFieldOrder = fieldOrder;
  if (!effectiveFieldOrder || effectiveFieldOrder.length === 0) {
    if (fields && fields.length > 0) {
      effectiveFieldOrder = fields.map(f => f.fieldname);
      console.warn('fieldOrder is missing, using fields.map(f => f.fieldname) as fallback.');
    } else {
      effectiveFieldOrder = [];
    }
  }
  const orderedFields = (effectiveFieldOrder || [])
    .map(fieldname => (fields || []).find(f => f.fieldname === fieldname))
    .filter(Boolean) as ERPField[];

  // Debug logs
  console.log('fields:', fields);
  console.log('fieldOrder:', fieldOrder);
  console.log('orderedFields:', orderedFields);

  const renderField = (field: ERPField) => {
    const fieldType = field.fieldtype.toLowerCase();

    // Helper to get label with optional asterisk
    const getLabel = (label: string, isRequired?: number) => {
      return isRequired ? `${label} *` : label;
    };

    switch (fieldType) {
      case 'select':
        if (field.options) {
          const options = field.options.split('\n');
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <SelectField
                label={getLabel(field.label, field.reqd)}
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
                label={getLabel(field.label, field.reqd)}
                value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
                onValueChange={(text) => handleInputChange(field.fieldname, text)}
                options={field.options} // Pass field.options as the options prop
                docType={docType} // Pass the parent docType
              />
            </View>
          );
        }
        return null;

      case 'check':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <Checkbox.Item
              label={getLabel(field.label, field.reqd)}
              status={formData[field.fieldname] ? 'checked' : 'unchecked'}
              onPress={() => handleInputChange(field.fieldname, !formData[field.fieldname])}
              disabled={!!field.read_only}
            />
          </View>
        );

      case 'rating':
      case 'ratting':
        return (
          <View key={field.fieldname} style={styles.fieldContainer}>
            <RatingField
              label={getLabel(field.label, field.reqd)}
              value={Number(formData[field.fieldname]) || 0}
              onValueChange={(value) => handleInputChange(field.fieldname, value)}
            />
          </View>
        );

      case 'section break':
        return (
          <Subheading key={field.fieldname} style={[styles.subheading, field.bold ? { fontWeight: 'bold' } : {}]}>
            {field.label}
          </Subheading>
        );

      case 'column break':
        return (
          <Subheading key={field.fieldname} style={[styles.subheading, field.bold ? { fontWeight: 'bold' } : {}]}>
            {field.label}
          </Subheading>
        );

      case 'table':
      case 'child table':
        if (field.options) {
          // Debug log for all fields and current table field
          console.log('All fields:', fields);
          console.log('Rendering TableField for:', field.fieldname, 'with options:', field.options);
          const childFields = fields.filter((f: ERPField) => {
            const match = f.parent === field.options;
            if (match) {
              console.log('Matched child field:', f.fieldname, 'parent:', f.parent);
            }
            return match;
          });
          if (childFields.length === 0) {
            console.warn('No child fields found for table:', field.fieldname, 'with options:', field.options);
          }
          // Always pass an array for value
          const tableValue = Array.isArray(formData[field.fieldname]) ? formData[field.fieldname] : [];
          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <TableField
                label={getLabel(field.label, field.reqd)}
                value={tableValue}
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
                label={getLabel(field.label, field.reqd)}
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
              label={getLabel(field.label, field.reqd)}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder=" "
              editable={!field.read_only}
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
              label={getLabel(field.label, field.reqd)}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              keyboardType="numeric"
              placeholder=" "
              editable={!field.read_only}
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
              label={getLabel(field.label, field.reqd)}
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
              label={getLabel(field.label, field.reqd)}
              value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
              onChangeText={(text) => handleInputChange(field.fieldname, text)}
              style={styles.input}
              placeholder=" "
              editable={!field.read_only}
            />
          </View>
        );
    }
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    let fieldsInTab: ERPField[] = [];
    const firstTabBreakIndex = orderedFields.findIndex(f => f.fieldtype === 'Tab Break');

    if (route.key === 'details_tab') {
      // Fields for the first tab are all fields until the first Tab Break
      fieldsInTab = firstTabBreakIndex === -1 ? [...orderedFields] : orderedFields.slice(0, firstTabBreakIndex);
    } else {
      // Logic for subsequent tabs
      const currentTabBreakIndex = orderedFields.findIndex(f => f.fieldname === route.key);
      
      // Find the next tab break after the current one
      let nextTabBreakIndex = -1;
      for (let i = currentTabBreakIndex + 1; i < orderedFields.length; i++) {
        if (orderedFields[i].fieldtype === 'Tab Break') {
          nextTabBreakIndex = i;
          break;
        }
      }

      const start = currentTabBreakIndex + 1;
      const end = nextTabBreakIndex === -1 ? undefined : nextTabBreakIndex;
      fieldsInTab = orderedFields.slice(start, end);
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
        keyExtractor={(item) => `${item.parent}-${item.fieldname}`}
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

    const visibleFields = orderedFields.filter((field) => {
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
          const result = new Function('doc', `try { return ${condition}; } catch (e) { return false; }`)(safeFormData);
          return !!result;
        } catch (e) {
          console.error(`Error evaluating depends_on for ${field.fieldname}:`, e);
          return false;
        }
      }
      return true;
    });

    if (visibleFields.length === 0) {
      return (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text>No fields to display.</Text>
        </View>
      );
    }

    return (
      <FlatList
        style={styles.contentContainer}
        data={visibleFields}
        renderItem={({ item, index }) => renderField(item)}
        keyExtractor={(item, index) => `${item.parent || ''}-${item.fieldname}-${index}`}
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
          {docType === 'Quotation' && mode === 'edit' && (
            <Button
              mode="outlined"
              onPress={handleCreateSalesOrder}
              loading={isCreatingSalesOrder}
              disabled={isCreatingSalesOrder || saving}
              style={{ marginLeft: 8 }}
            >
              Create Sales Order
            </Button>
          )}
        </Card.Actions>
      </View>
    </FormProvider>
  );
};

export default DocumentFormScreen;
