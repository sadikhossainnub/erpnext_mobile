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

const getMonthlySalesCount = async (userId?: string): Promise<number> => {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let filters = `[["docstatus", "=", 1], ["MONTH(transaction_date)", "=", ${month}], ["YEAR(transaction_date)", "=", ${year}]]`;
    if (userId) {
      filters = `[["docstatus", "=", 1], ["MONTH(transaction_date)", "=", ${month}], ["YEAR(transaction_date)", "=", ${year}], ["owner", "=", "${userId}"]]`;
    }
    const response = await apiClient.get<any>('/api/resource/Sales Order', {
      params: {
        fields: '["count(*) as total"]',
        filters,
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

const getItemWiseSales = async (): Promise<{ labels: string[]; values: number[] }> => {
  try {
    const response = await apiClient.get<any>('/api/resource/Sales Invoice Item', {
      params: {
        fields: '["item_name", "SUM(amount) as total_amount"]',
        filters: '[["docstatus","=",1]]',
        group_by: 'item_name',
        order_by: 'total_amount desc',
        limit: 10,
      },
    });

    const labels = response.data?.data.map((item: any) => item.item_name);
    const values = response.data?.data.map((item: any) => item.total_amount);

    return { labels, values };
  } catch (error) {
    console.error('Error fetching item wise sales data:', error);
    return { labels: [], values: [] };
  }
};

export const getDashboardData = async (user?: any): Promise<ERPNextResponse<DashboardData>> => {
  try {
    const [salesOrders, invoices, items, monthlySalesCount, myMonthlySalesCount, monthlyQuotationCount, monthlySalesData, expenseClaims, leaveApplications, itemWiseSales] = await Promise.all([
      getDocTypeCount('Sales Order'),
      getDocTypeCount('Sales Invoice'),
      getDocTypeCount('Item'),
      getMonthlySalesCount(),
      getMonthlySalesCount(user?.fullName),
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
      getItemWiseSales(),
    ]);

    const dashboardData: DashboardData = {
      widgets: [
        { title: 'Sales Orders', type: 'number', data: salesOrders },
        { title: 'My Monthly Sales', type: 'number', data: myMonthlySalesCount },
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
          title: 'Item-wise Sales',
          type: 'chart',
          data: itemWiseSales,
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
