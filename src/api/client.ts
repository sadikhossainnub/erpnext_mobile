import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERPNextResponse } from '../types';
import { API_KEY, API_SECRET, ERPNEXT_SERVER_URL } from '../config';

const handleApiError = (error: AxiosError): ERPNextResponse<any> => {
  if (error.response) {
    if (error.response.status === 401) {
      // Automatically handle logout on auth failure
      AsyncStorage.removeItem('user_data');
    }
    return {
      error: (error.response.data as any)?.message || `Error: ${error.response.status}`,
    };
  }
  if (error.request) {
    return { error: 'Network error. Please check your connection.' };
  }
  return { error: error.message || 'An unexpected error occurred.' };
};

class ApiClient {
  private client: AxiosInstance;
  private serverUrl: string = ERPNEXT_SERVER_URL;

  constructor() {
    this.client = axios.create({
      baseURL: this.serverUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      async (config) => {
        if (config.baseURL !== this.serverUrl) {
          const storedUrl = await AsyncStorage.getItem('server_url');
          this.serverUrl = storedUrl || ERPNEXT_SERVER_URL;
          config.baseURL = this.serverUrl;
        }

        if (API_KEY && API_SECRET) {
          config.headers.Authorization = `token ${API_KEY}:${API_SECRET}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async setServerUrl(url: string): Promise<void> {
    this.serverUrl = url;
    await AsyncStorage.setItem('server_url', url);
    this.client.defaults.baseURL = url;
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ERPNextResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ERPNextResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ERPNextResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ERPNextResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
