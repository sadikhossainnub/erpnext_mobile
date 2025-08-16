import { apiClient, setApiKey, setApiSecret } from './client';
import { User, ERPNextResponse } from '../types';
import config from '../config';

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

    if (response.data && response.data.message === 'Logged In') {
      const { apiKey, apiSecret } = config;

      if (apiKey && apiSecret) {
        await setApiKey(apiKey);
        await setApiSecret(apiSecret);

        const userDocResponse = await apiClient.get<any>(`/api/resource/User/${email}`);
        const userDoc = userDocResponse.data?.data;

        if (userDoc) {
          const roles = userDoc.roles?.map((r: any) => r.role) || [];
          const user: User = {
            id: email,
            email: email,
            fullName: userDoc.full_name || 'User',
            roles,
            apiKey,
            apiSecret,
            user_image: userDoc.user_image || null,
          };
          return { data: user };
        } else {
          return { error: 'Failed to fetch user document' };
        }
      } else {
        return { error: 'API key or secret not found in the configuration file' };
      }
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
