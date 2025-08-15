import { apiClient } from './client';
import { User, ERPNextResponse } from '../types';

interface LoginResponse {
  message: string;
  full_name: string;
}

interface UserRolesResponse {
  message: string[];
}

export const get_user_roles = async (): Promise<ERPNextResponse<string[]>> => {
  try {
    const response = await apiClient.get<UserRolesResponse>('/api/method/frappe.client.get_user_roles');
    if (response.data && Array.isArray(response.data.message)) {
      return { data: response.data.message };
    } else if (response.data && Array.isArray(response.data)) {
      // Handle cases where the response data is the array of roles
      return { data: response.data as unknown as string[] };
    } else {
      console.error('Unexpected response format for user roles:', response.data);
      return { error: 'Failed to fetch user roles due to unexpected format' };
    }
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return { error: 'An unexpected error occurred while fetching user roles' };
  }
};

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
