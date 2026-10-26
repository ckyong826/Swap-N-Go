import axios from 'axios';
import { env } from '@/config/env';
import { storageService } from '@/services/storage.service';
import { useAuthStore } from '@/stores/auth.store';

export const PUBLIC = '/api/v1/public';
export const PRIVATE = '/api/v1/private';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storageService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    data: config.data,
    hasToken: !!token,
  });
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    console.log(`[API ←] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    console.error(`[API ✕] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message ?? error.message,
      isNetworkError: !error.response,
    });
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    const message: string =
      error.response?.data?.message ?? error.message ?? 'An error occurred';
    return Promise.reject({ message, code: error.response?.status?.toString() });
  }
);
