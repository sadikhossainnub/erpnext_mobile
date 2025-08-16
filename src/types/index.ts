import { MD3Theme } from 'react-native-paper';

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      accent: string;
    }

    interface Theme {
      spacing: {
        small: number;
        medium: number;
        large: number;
      };
    }
  }
}

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
  bold?: number;
  in_global_search?: number;
  print_hide?: number;
  in_preview?: number;
  track_changes?: number;
  is_submittable?: number;
  is_child_table?: number;
  is_single?: number;
  is_tree?: number;
  is_calendar_and_gantt?: number;
  quick_entry?: number;
  track_seen?: number;
  track_views?: number;
  unique?: number;
  no_copy?: number;
  set_only_once?: number;
  is_virtual?: number;
  is_common?: number;
  allow_on_submit?: number;
  translatable?: number;
  collapsible?: number;
  collapsible_depends_on?: string;
  allow_bulk_edit?: number;
  width?: string;
  length?: number;
  precision?: string;
  default?: string;
  description?: string;
  read_only_depends_on?: string;
  mandatory_depends_on?: string;
  hidden_depends_on?: string;
  fetch_from?: string;
  fetch_if_empty?: number;
  ignore_user_permissions?: number;
  ignore_xss_filter?: number;
  permlevel?: number;
  allow_in_quick_entry?: number;
  is_data_import_id?: number;
  remember_last_value?: number;
  show_preview_popup?: number;
  hide_border?: number;
  hide_days?: number;
  hide_seconds?: number;
  hide_toolbar?: number;
  show_time?: number;
  show_today_button?: number;
  show_week_numbers?: number;
  start_date_field?: string;
  end_date_field?: string;
  min_date?: string;
  max_date?: string;
  min_time?: string;
  max_time?: string;
  min_value?: number;
  max_value?: number;
  step?: number;
  file_type?: string;
  max_file_size?: number;
  max_attachments?: number;
  route_options?: string;
  search_fields?: string;
  auto_refresh?: number;
  on_change?: string;
  on_form_render?: string;
  on_update?: string;
  on_submit?: string;
  on_cancel?: string;
  on_trash?: string;
  on_clone?: string;
  on_load?: string;
  on_save?: string;
  on_validate?: string;
  on_update_after_submit?: string;
  on_cancel_after_submit?: string;
  on_trash_after_submit?: string;
  on_change_after_submit?: string;
  on_form_render_after_submit?: string;
  on_update_on_submit?: string;
  on_cancel_on_submit?: string;
  on_trash_on_submit?: string;
  on_change_on_submit?: string;
  on_form_render_on_submit?: string;
  on_update_on_cancel?: string;
  on_cancel_on_cancel?: string;
  on_trash_on_cancel?: string;
  on_change_on_cancel?: string;
  on_form_render_on_cancel?: string;
  on_update_on_trash?: string;
  on_cancel_on_trash?: string;
  on_trash_on_trash?: string;
  on_change_on_trash?: string;
  on_form_render_on_trash?: string;
  on_update_on_clone?: string;
  on_cancel_on_clone?: string;
  on_trash_on_clone?: string;
  on_change_on_clone?: string;
  on_form_render_on_clone?: string;
  on_update_on_load?: string;
  on_cancel_on_load?: string;
  on_trash_on_load?: string;
  on_change_on_load?: string;
  on_form_render_on_load?: string;
  on_update_on_save?: string;
  on_cancel_on_save?: string;
  on_trash_on_save?: string;
  on_change_on_save?: string;
  on_form_render_on_save?: string;
  on_update_on_validate?: string;
  on_cancel_on_validate?: string;
  on_trash_on_validate?: string;
  on_change_on_validate?: string;
  on_form_render_on_validate?: string;
}

// Authentication Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  apiKey?: string;
  apiSecret?: string;
  gender?: string;
  mobile?: string;
  passport_nid?: string;
  date_of_joining?: string;
  user_image?: string | null;
  company?: string;
  loginTime?: number;
  serverUrl?: string; // Add serverUrl to User interface
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
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
  permissions?: DocPerm[];
  [key: string]: any;
  status?: DocStatus;
}

export type DocStatus =
  | 'Draft'
  | 'Cancel'
  | 'Submitted'
  | 'Approve'
  | 'Reject'
  | 'Pending'
  | 'Overdue'
  | 'Bill'
  | 'Bill to Delivery'
  | 'Unpaid'
  | 'Paid'
  | 'Partly Paid'
  | 'Partly Paid and Discounted'
  | 'Return'
  | 'Credit Note Issued';

export interface DocPerm {
  read: 0 | 1;
  write: 0 | 1;
  create: 0 | 1;
  delete: 0 | 1;
  submit: 0 | 1;
  cancel: 0 | 1;
  amend: 0 | 1;
  report: 0 | 1;
  export: 0 | 1;
  print: 0 | 1;
  email: 0 | 1;
  if_owner: 0 | 1;
  permlevel: number;
  role: string;
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

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};
