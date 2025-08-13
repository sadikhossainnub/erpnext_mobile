// ERPNext API Response Types
export interface ERPNextResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ERPField {
  fieldname: string;
  label: string;
  fieldtype: string;
  hidden: number;
  read_only: number;
  reqd: number;
  options?: string;
  in_list_view?: number;
  parent?: string;
  depends_on?: string;
}

// Authentication Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  gender?: string;
  mobile?: string;
  passport_nid?: string;
  date_of_joining?: string;
  user_image?: string | null;
  company?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  serverUrl: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ERPNext Document Types
export interface ERPDocument {
  name: string;
  doctype: string;
  modified: string;
  creation: string;
  owner: string;
  [key: string]: any;
}

// Dashboard Types
export interface DashboardWidget {
  title: string;
  type: 'chart' | 'number' | 'list';
  data: any;
}

// Module Types
export interface Module {
  name: string;
  icon: string;
  docTypes: string[];
}
