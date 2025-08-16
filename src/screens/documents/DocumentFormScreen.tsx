import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme, Card, Subheading, Checkbox } from 'react-native-paper';
import { useForm, FormProvider } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getDocument, updateDocument, createDocument, getDocTypeMetadata, createSalesOrderFromQuotation, getCompanyCurrency } from '../../api/documents';
import { ERPDocument, ERPField } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
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
  const [companyCurrency, setCompanyCurrency] = useState<string | null>(null); // New state for company currency
  const theme = useTheme();
  const layout = useWindowDimensions();
  const { user } = useAuth();


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
    if (mode === 'create') {
      if (docType === 'Quotation') {
        setValue('quotation_to', 'Customer');
      }
      // Set default company if user has one and field exists
      if (user?.company) {
        setValue('company', user.company);
      }
    }
  }, [docType, docName, mode, user?.company]);

  // Fetch company currency when user or company changes
  useEffect(() => {
    const fetchCurrency = async () => {
      if (user?.company && mode === 'create') {
        const result = await getCompanyCurrency(user.company);
        if (result.data) {
          setCompanyCurrency(result.data);
        } else {
          console.error('Failed to fetch company currency:', result.error);
        }
      }
    };
    fetchCurrency();
  }, [user?.company, mode]);

  // Set default currency for currency fields when companyCurrency is available
  useEffect(() => {
    if (companyCurrency && mode === 'create' && fields.length > 0) {
      fields.forEach(field => {
        if (field.fieldtype.toLowerCase() === 'currency' && !formData[field.fieldname]) {
          setValue(field.fieldname, companyCurrency);
        }
      });
    }
  }, [companyCurrency, mode, fields, formData, setValue]);

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
        result = await updateDocument(user, docType, docName, data);
      } else {
        result = await createDocument(user, docType, data);
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
      marginBottom: 16,
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
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 8,
      margin: 16,
    },
    errorText: {
      color: theme.colors.error,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness, // Apply border radius
      paddingVertical: 4, // Add vertical padding
    },
    saveButton: {
      flex: 1,
    },
    actionsContainer: {
      padding: 8,
      borderTopWidth: 1,
      borderColor: theme.colors.backdrop,
      backgroundColor: theme.colors.surface,
    },
  });

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
    } else {
      effectiveFieldOrder = [];
    }
  }
  const orderedFields = (effectiveFieldOrder || [])
    .map(fieldname => (fields || []).find(f => f.fieldname === fieldname))
    .filter(Boolean) as ERPField[];

  const renderField = (field: ERPField) => {
    const fieldType = field.fieldtype.toLowerCase();

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
          let linkOptions = field.options;
          let linkFilters: Record<string, any> | undefined = undefined;

          if (field.fieldname === 'party' && formData.quotation_to === 'Customer') {
            linkOptions = 'Customer';
          } else if (field.fieldname === 'party' && formData.quotation_to === 'Lead') {
            linkOptions = 'Lead';
          } else if (field.fieldname === 'party' && formData.quotation_to === 'Supplier') {
            linkOptions = 'Supplier';
          }

          return (
            <View key={field.fieldname} style={styles.fieldContainer}>
              <LinkField
                label={getLabel(field.label, field.reqd)}
                value={formData[field.fieldname] ? String(formData[field.fieldname]) : ''}
                onValueChange={(text) => handleInputChange(field.fieldname, text)}
                options={linkOptions}
                docType={docType}
                filters={linkFilters}
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
          const childFields = fields.filter((f: ERPField) => f.parent === field.options);
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
              mode="outlined" // Add mode="outlined"
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
              mode="outlined" // Add mode="outlined"
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
              mode="outlined" // Add mode="outlined"
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
              mode="outlined" // Add mode="outlined"
            />
          </View>
        );
    }
  };

  const renderFormContent = () => {
    const fieldsToHide = [
      'amended_from',
      'order_type',
      'company',
      'currency',
      'exchange_rate',
      'price_list',
      'selling_price_list',
      'price_list_currency_exchange_rate',
      'ignore_pricing_rule',
      'bundle_items',
      'letter_head',
      'group_same_items',
      'print_heading',
      'disable_rounded_total', 'section_break_44', 'apply_discount_on', 'base_discount_amount', "coupon_code", "additional_discount_percentage", "discount_amount", "referral_sales_partner", "sec_tax_breakup", "other_charges_calculation", "packed_items", "pricing_rule_details", "pricing_rules", "address_and_contact_tab", "more_info_tab", "subscription_section", "auto_repeat", "print_settings", "select_print_heading", "language", "lost_reasons", "competitors", "additional_info_section", "status", "territory", "campaign", "source", "opportunity", "supplier_quotation", "connections_tab", "item_code", "item_name", "section_break_5", "description", "image_section", "image_view", "q_image", "q_image_view", "quantity_and_rate", "qty", "stock_uom", "uom", "conversion_factor", "stock_qty", "available_quantity_section", "actual_qty", "company_total_stock", "price_list_rate", "base_price_list_rate", "discount_and_margin", "distributed_discount_amount", "rate", "net_rate", "amount", "net_amount", "item_tax_template", "base_rate", "base_net_rate", "base_amount", "base_net_amount", "is_free_item", "is_alternative", "valuation_rate", "gross_profit", "item_weight_details", "weight_per_unit", "total_weight", "weight_uom", "reference", "warehouse", "against_blanket_order", "prevdoc_docname", "item_balance", "projected_qty", "stock_balance", "shopping_cart_section", "additional_notes", "page_break", "charge_type", "account_head", "included_in_print_rate", "accounting_dimensions_section", "cost_center", "account_currency", "tax_amount", "total", "tax_amount_after_discount_amount", "base_tax_amount", "base_total", "parent_item", "target_warehouse", "use_serial_batch_fields", "batch_no", "ordered_qty", "incoming_rate", "picked_qty", "pricing_rule", "rule_applied", "payment_term", "section_break_15", "due_date", "mode_of_payment", "invoice_portion", "discount_type", "discount"
    ];

    const visibleFields = orderedFields.filter((field) => {
      // Hide fields that are explicitly requested to be hidden
      if (fieldsToHide.includes(field.fieldname)) {
        return false;
      }
      // Hide fields that are hidden
      if (field.hidden) {
        return false;
      }
      // Hide fields with empty labels or fieldnames (blank fields)
      if (!field.label || field.label.trim() === '' || !field.fieldname || field.fieldname.trim() === '') {
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
        renderItem={({ item }) => <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}><Card.Content>{renderField(item)}</Card.Content></Card>}
        keyExtractor={(item, index) => `${item.parent || ''}-${item.fieldname}-${index}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    );
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {renderFormContent()}
        <Card.Actions style={styles.actionsContainer}>
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
