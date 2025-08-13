import apiClient from './client';
import { DashboardWidget, ERPNextResponse } from '../types';

interface DashboardData {
  widgets: DashboardWidget[];
}

const handleApiError = (error: any): { error: string } => {
  console.error('API Error:', error);
  if (error.response?.status === 401) {
    return { error: 'Authentication failed. Please log in again.' };
  }
  if (error.response?.status === 403) {
    return { error: 'Access denied. You do not have permission.' };
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return { error: 'Network error. Cannot connect to the server.' };
  }
  return { error: 'An unexpected error occurred while fetching dashboard data.' };
};

const getDocTypeCount = async (docType: string): Promise<number> => {
  try {
    const response = await apiClient.get<any>(`/api/resource/${docType}`, {
      params: { limit: 1, fields: '["count(*)"]' },
    });
    return response.data?.count || 0;
  } catch (error) {
    console.error(`Error fetching count for ${docType}:`, error);
    return 0;
  }
};

const getMonthlySalesCount = async (): Promise<number> => {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const response = await apiClient.get<any>('/api/resource/Sales Order', {
      params: {
        fields: '["count(*) as total"]',
        filters: `[["docstatus", "=", 1], ["MONTH(transaction_date)", "=", ${month}], ["YEAR(transaction_date)", "=", ${year}]]`,
      },
    });
    return response.data?.data[0]?.total || 0;
  } catch (error) {
    console.error('Error fetching monthly sales count:', error);
    return 0;
  }
};

const getMonthlyQuotationCount = async (): Promise<number> => {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const response = await apiClient.get<any>('/api/resource/Quotation', {
      params: {
        fields: '["count(*) as total"]',
        filters: `[["docstatus", "=", 1], ["MONTH(transaction_date)", "=", ${month}], ["YEAR(transaction_date)", "=", ${year}]]`,
      },
    });
    return response.data?.data[0]?.total || 0;
  } catch (error) {
    console.error('Error fetching monthly quotation count:', error);
    return 0;
  }
};

const getMonthlySalesData = async (): Promise<{ target: number; achieved: number }> => {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const achievedPromise = apiClient.get<any>('/api/resource/Sales Order', {
      params: {
        fields: '["SUM(grand_total) as total"]',
        filters: `[["docstatus", "=", 1], ["MONTH(transaction_date)", "=", ${month}], ["YEAR(transaction_date)", "=", ${year}]]`,
      },
    });

    const targetPromise = apiClient.get<any>('/api/resource/Sales Target', {
        params: {
            fields: '["target_amount"]',
            filters: `[["month", "=", month], ["year", "=", year]]`,
        },
    });

    const [achievedResponse, targetResponse] = await Promise.all([achievedPromise, targetPromise]);

    const achieved = achievedResponse.data?.data[0]?.total || 0;
    const target = targetResponse.data?.data[0]?.target_amount || 0;

    return { target, achieved };
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);
    return { target: 0, achieved: 0 };
  }
};

export const getDashboardData = async (): Promise<ERPNextResponse<DashboardData>> => {
  try {
    const [salesOrders, purchaseOrders, invoices, items, monthlySalesCount, monthlyQuotationCount, monthlySalesData, expenseClaims, leaveApplications] = await Promise.all([
      getDocTypeCount('Sales Order'),
      getDocTypeCount('Purchase Order'),
      getDocTypeCount('Sales Invoice'),
      getDocTypeCount('Item'),
      getMonthlySalesCount(),
      getMonthlyQuotationCount(),
      getMonthlySalesData(),
      apiClient.get<any>('/api/resource/Expense Claim', {
        params: {
          limit: 10,
          fields: '["name", "status", "total_claimed_amount", "creation"]',
          order_by: 'creation desc',
        },
      }),
      apiClient.get<any>('/api/resource/Leave Application', {
        params: {
          limit: 10,
          fields: '["name", "status", "leave_type", "total_leave_days", "creation"]',
          order_by: 'creation desc',
        },
      }),
    ]);

    const dashboardData: DashboardData = {
      widgets: [
        { title: 'Sales Orders', type: 'number', data: salesOrders },
        { title: 'Purchase Orders', type: 'number', data: purchaseOrders },
        { title: 'Invoices', type: 'number', data: invoices },
        { title: 'Inventory Items', type: 'number', data: items },
        { title: 'Monthly Sales Orders', type: 'number', data: monthlySalesCount },
        { title: 'Monthly Quotations', type: 'number', data: monthlyQuotationCount },
        {
          title: 'Monthly Sales Target',
          type: 'chart',
          data: monthlySalesData,
        },
        {
          title: 'Recent Expense Claims',
          type: 'list',
          data: expenseClaims.data?.data || [],
        },
        {
          title: 'Recent Leave Applications',
          type: 'list',
          data: leaveApplications.data?.data || [],
        },
      ],
    };

    return { data: dashboardData };
  } catch (error) {
    return handleApiError(error);
  }
};
