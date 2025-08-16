import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERPNextResponse } from '../types';

let currentApiKey: string | null = null;
let currentApiSecret: string | null = null;

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
  private serverUrl: string = ''; // Initialize with an empty string

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
        const storedUrl = await AsyncStorage.getItem('server_url');
        this.serverUrl = storedUrl || ''; // Initialize with an empty string
        config.baseURL = this.serverUrl;

        const storedApiKey = await AsyncStorage.getItem('api_key');
        const storedApiSecret = await AsyncStorage.getItem('api_secret');

        currentApiKey = storedApiKey;
        currentApiSecret = storedApiSecret;

        if (currentApiKey && currentApiSecret) {
          config.headers.Authorization = `token ${currentApiKey}:${currentApiSecret}`;
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

  async setApiKey(key: string): Promise<void> {
    currentApiKey = key;
    await AsyncStorage.setItem('api_key', key);
  }

  async setApiSecret(secret: string): Promise<void> {
    currentApiSecret = secret;
    await AsyncStorage.setItem('api_secret', secret);
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

export const setBaseUrl = async (url: string) => {
  await apiClient.setServerUrl(url);
};

export const setApiKey = async (key: string) => {
  await apiClient.setApiKey(key);
};

export const setApiSecret = async (secret: string) => {
  await apiClient.setApiSecret(secret);
};

export default apiClient;
