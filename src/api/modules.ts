import { Module, ERPNextResponse } from '../types';

// Define the available modules in ERPNext
export const getAvailableModules = (): ERPNextResponse<Module[]> => {
  const modules: Module[] = [
    {
      name: 'Sales',
      icon: 'shopping-cart',
      docTypes: ['Customer', 'Quotation', 'Sales Order', 'Sales Invoice', 'Delivery Note'],
    },
    {
      name: 'Stock',
      icon: 'box',
      docTypes: ['Item'],
    },
    {
      name: 'HR',
      icon: 'users',
      docTypes: ['Salary Slip', 'Attendance', 'Leave Application', 'Employee Advance'],
    },
    {
      name: 'Projects',
      icon: 'clipboard',
      docTypes: ['Project', 'Task', 'Timesheet', 'Issue'],
    },
    {
      name: 'CRM',
      icon: 'user',
      docTypes: ['Lead', 'Opportunity', 'Customer', 'Contact', 'Address'],
    },
  ];

  return { data: modules };
};
