import { apiClient } from './client';
import { User, ERPNextResponse } from '../types';

interface LoginResponse {
  message: string;
  full_name: string;
}

export const login = async (email: string, password: string): Promise<ERPNextResponse<User>> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/method/login', {
      usr: email,
      pwd: password,
    });

    console.log('Login response:', response);

    if (response.data && response.data.message === 'Logged In') {
      // Assuming the user's full name is returned in the response
      const user: User = {
        id: email,
        email: email,
        fullName: response.data.full_name || 'User',
        roles: [], // Roles might need to be fetched separately
      };
      return { data: user };
    } else {
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
};
