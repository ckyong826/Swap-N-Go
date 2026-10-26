import { apiClient, PRIVATE } from './client';
import { WithdrawInitiateRequest, WithdrawRecord } from '@/types/api.types';

export const withdrawKeys = {
  all: ['withdrawals'] as const,
  status: (id: string) => [...withdrawKeys.all, 'status', id] as const,
};

export const withdrawApi = {
  initiate: (data: WithdrawInitiateRequest) =>
    apiClient.post<{ id: string; status: string }>(`${PRIVATE}/withdraw/initiate`, data).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<WithdrawRecord>(`${PRIVATE}/withdraw/${id}`).then((r) => r.data),

  getHistory: () =>
    apiClient.get<WithdrawRecord[]>(`${PRIVATE}/withdraw`).then((r) => r.data),
};
