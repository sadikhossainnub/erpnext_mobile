import { apiClient } from './client';
import { User, ERPNextResponse } from '../types';

interface LoginResponse {
  message: string;
  full_name: string;
}

interface LoggedInUserResponse {
  message: string;
}

interface UserRolesResponse {
  message: string[];
}



export const login = async (email: string, password: string): Promise<ERPNextResponse<User>> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/method/login', {
      usr: email,
      pwd: password,
    });

    console.log('Login response:', response);

    if (response.data && response.data.message === 'Logged In') {
      const user: User = {
        id: email,
        email: email,
        fullName: response.data.full_name || 'User',
        roles: [], // Roles will be fetched separately
      };
      return { data: user };
    } else {
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
};

export const logout = async (): Promise<ERPNextResponse<null>> => {
  try {
    await apiClient.get('/api/method/logout');
    return { data: null };
  } catch (error) {
    return { error: 'An unexpected error occurred during logout' };
  }
};

export const fetchUserRoles = async () => {
  try {
    // Step 1: Get logged-in user
    const userRes = await apiClient.get<LoggedInUserResponse>('/api/method/frappe.auth.get_logged_user');
    const userData = userRes.data;
    const user = userData?.message;
    if (!user) throw new Error("No logged-in user found");

    // Step 2: Get roles for that user
    const rolesRes = await apiClient.get<UserRolesResponse>(`/api/method/frappe.core.doctype.user.user.get_roles?uid=${user}`);
    const rolesData = rolesRes.data;
    const roles = Array.isArray(rolesData?.message) ? rolesData.message : [];

    console.log("User:", user);
    console.log("Roles:", roles);

    return { user, roles };
  } catch (err) {
    console.error("Error fetching roles:", err);
    return { user: null, roles: [] };
  }
}
