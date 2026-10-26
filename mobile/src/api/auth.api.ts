import { apiClient, PUBLIC, PRIVATE } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(`${PUBLIC}/auth/login`, data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>(`${PUBLIC}/auth/register`, data).then((r) => r.data),

  verifyPin: (pin: string) =>
    apiClient.post<{ valid: boolean }>(`${PRIVATE}/auth/pin/verify`, { pin }).then((r) => r.data),
};
