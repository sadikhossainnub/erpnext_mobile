import apiClient from './client';
import { ERPDocument, ERPNextResponse, DocPerm, User } from '../types';
import { hasPermission } from '../utils/permissions';

interface ListResponse {
  message: ERPDocument[];
}

interface DocResponse {
  data: ERPDocument;
  message?: string;
}

interface MetaResponse {
  docs: { fields: any[]; permissions: DocPerm[] }[];
}

export const getDocList = async (
  docType: string,
  filters?: Record<string, any>,
  fields?: string[],
  limit = 20,
  orderBy = 'modified desc'
): Promise<ERPNextResponse<ERPDocument[]>> => {
  try {
    let fieldsToFetch = fields;
    if (!fieldsToFetch) {
      const metaRes = await getDocTypeMetadata(docType);
      if (metaRes.data && metaRes.data.fields) {
        const inListViewFields = metaRes.data.fields
          .filter((df: any) => df.in_list_view)
          .map((df: any) => df.fieldname);
        fieldsToFetch = ['name', 'modified', 'owner', ...inListViewFields];
      } else {
        fieldsToFetch = ['name', 'modified', 'owner'];
      }
    }

    const response = await apiClient.get<ListResponse>('/api/method/frappe.client.get_list', {
      params: {
        doctype: docType,
        filters: filters ? JSON.stringify(filters) : undefined,
        fields: JSON.stringify(fieldsToFetch),
        order_by: orderBy,
      },
    });

    if (response.data && response.data.message) {
      return { data: response.data.message };
    } else {
      return { error: 'Failed to fetch documents: Invalid response structure' };
    }
  } catch (error) {
    console.error('Error fetching document list:', error);
    return { error: 'Error fetching document list' };
  }
};

export const getDocument = async (
  docType: string,
  docName: string
): Promise<ERPNextResponse<ERPDocument>> => {
  try {
    const response = await apiClient.get<DocResponse>(`/api/resource/${docType}/${docName}`);
    
    if (response.data) {
      return { data: response.data.data };
    } else {
      return { error: 'Failed to fetch document' };
    }
  } catch (error) {
    return { error: 'Error fetching document details' };
  }
};

export const createDocument = async (
  user: User | null,
  docType: string,
  docData: Partial<ERPDocument>
): Promise<ERPNextResponse<ERPDocument>> => {
  try {
    const metaRes = await getDocTypeMetadata(docType);
    if (metaRes.data && metaRes.data.permissions) {
      if (!hasPermission(user, metaRes.data.permissions, 'create')) {
        return { error: 'You do not have permission to create this document type.' };
      }
    } else {
      return { error: 'Failed to fetch document type metadata for permission check.' };
    }

    const response = await apiClient.post<DocResponse>(`/api/resource/${docType}`, docData);
    
    if (response.data) {
      return { data: response.data.data };
    } else {
      return { error: 'Failed to create document' };
    }
  } catch (error) {
    return { error: 'Error creating document' };
  }
};

export const updateDocument = async (
  user: User | null,
  docType: string,
  docName: string,
  docData: Partial<ERPDocument>
): Promise<ERPNextResponse<ERPDocument>> => {
  try {
    const metaRes = await getDocTypeMetadata(docType);
    if (metaRes.data && metaRes.data.permissions) {
      // For update, we also need to consider if_owner permission.
      // We need to fetch the document first to get its owner.
      const existingDocRes = await getDocument(docType, docName);
      if (existingDocRes.error || !existingDocRes.data) {
        return { error: existingDocRes.error || 'Failed to fetch existing document for permission check.' };
      }
      const docOwner = existingDocRes.data.owner;

      if (!hasPermission(user, metaRes.data.permissions, 'write', docOwner)) {
        return { error: 'You do not have permission to update this document.' };
      }
    } else {
      return { error: 'Failed to fetch document type metadata for permission check.' };
    }

    const response = await apiClient.put<DocResponse>(`/api/resource/${docType}/${docName}`, docData);
    
    if (response.data) {
      return { data: response.data.data };
    } else {
      return { error: 'Failed to update document' };
    }
  } catch (error) {
    return { error: 'Error updating document' };
  }
};

export const deleteDocument = async (
  user: User | null,
  docType: string,
  docName: string
): Promise<ERPNextResponse<null>> => {
  try {
    const metaRes = await getDocTypeMetadata(docType);
    if (metaRes.data && metaRes.data.permissions) {
      // For delete, we also need to consider if_owner permission.
      // We need to fetch the document first to get its owner.
      const existingDocRes = await getDocument(docType, docName);
      if (existingDocRes.error || !existingDocRes.data) {
        return { error: existingDocRes.error || 'Failed to fetch existing document for permission check.' };
      }
      const docOwner = existingDocRes.data.owner;

      if (!hasPermission(user, metaRes.data.permissions, 'delete', docOwner)) {
        return { error: 'You do not have permission to delete this document.' };
      }
    } else {
      return { error: 'Failed to fetch document type metadata for permission check.' };
    }

    await apiClient.delete(`/api/resource/${docType}/${docName}`);
    return { message: 'Document deleted successfully' };
  } catch (error) {
    return { error: 'Error deleting document' };
  }
};

export const getDocTypeMetadata = async (
  docType: string
): Promise<ERPNextResponse<any>> => {
  try {
    const response = await apiClient.get<MetaResponse>('/api/method/frappe.desk.form.load.getdoctype', {
      params: {
        doctype: docType,
      },
    });

    if (response.data && response.data.docs && response.data.docs[0]) {
      return { data: response.data.docs[0] };
    } else {
      return { error: 'Failed to fetch metadata: Invalid response structure' };
    }
  } catch (error) {
    console.error('Error fetching doctype metadata:', error);
    return { error: 'Error fetching doctype metadata' };
  }
};

export const searchDocuments = async (
  docType: string,
  query: { filters: Record<string, any> }
): Promise<ERPNextResponse<ERPDocument[]>> => {
  return getDocList(docType, query.filters, undefined, 100);
};

export const getUserProfile = async (
  email: string
): Promise<ERPNextResponse<any>> => {
  try {
    const response = await apiClient.get<DocResponse>(`/api/resource/User/${email}`);
    if (response.data) {
      return { data: response.data.data };
    } else {
      return { error: 'Failed to fetch user profile' };
    }
  } catch (error) {
    return { error: 'Error fetching user profile' };
  }
};

export const getCompanyCurrency = async (
  companyName: string
): Promise<ERPNextResponse<string>> => {
  try {
    const response = await getDocument('Company', companyName);
    if (response.data && response.data.default_currency) {
      return { data: response.data.default_currency };
    } else {
      return { error: 'Failed to fetch company currency or currency not found.' };
    }
  } catch (error) {
    console.error('Error fetching company currency:', error);
    return { error: 'Error fetching company currency' };
  }
};

export const createSalesOrderFromQuotation = async (
  quotationName: string
): Promise<ERPNextResponse<ERPDocument>> => {
  try {
    const response = await apiClient.post<DocResponse>(
      '/api/method/erpnext.selling.doctype.quotation.quotation.make_sales_order',
      {
        source_name: quotationName,
        for_doctype: 'Sales Order',
      }
    );

    if (response.data && response.data.message) {
      const newSalesOrder = JSON.parse(response.data.message);
      return { data: newSalesOrder };
    } else {
      return { error: 'Failed to create Sales Order' };
    }
  } catch (error) {
    console.error('Error creating Sales Order:', error);
    return { error: 'Error creating Sales Order' };
  }
};
