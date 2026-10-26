import { apiClient, PRIVATE } from './client';
import { DepositInitiateRequest, DepositRecord } from '@/types/api.types';

export const depositKeys = {
  all: ['deposits'] as const,
  status: (id: string) => [...depositKeys.all, 'status', id] as const,
};

export const depositApi = {
  initiate: (data: DepositInitiateRequest) =>
    apiClient.post<{ id: string; status: string; billplz_payment_url: string }>(
      `${PRIVATE}/deposit/initiate`,
      data
    ).then((r) => r.data),

  simulatePaid: (id: string) =>
    apiClient.post<{ message: string; data: { status: string } }>(
      `${PRIVATE}/deposit/${id}/simulate-paid`
    ).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<DepositRecord>(`${PRIVATE}/deposit/${id}`).then((r) => r.data),

  getHistory: () =>
    apiClient.get<DepositRecord[]>(`${PRIVATE}/deposit`).then((r) => r.data),
};
