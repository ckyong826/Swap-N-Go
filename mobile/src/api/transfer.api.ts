import { apiClient, PRIVATE } from './client';
import { ResolvedRecipient, TransferInitiateRequest, TransferRecord } from '@/types/api.types';

export const transferKeys = {
  all: ['transfers'] as const,
  list: () => [...transferKeys.all, 'list'] as const,
  status: (id: string) => [...transferKeys.all, 'status', id] as const,
  resolve: (q: string) => [...transferKeys.all, 'resolve', q] as const,
};

export const transferApi = {
  resolve: (q: string) =>
    apiClient.get<ResolvedRecipient>(`${PRIVATE}/transfer/resolve`, { params: { q } }).then((r) => r.data),

  initiate: (data: TransferInitiateRequest) =>
    apiClient.post<{ id: string; status: string }>(`${PRIVATE}/transfer/initiate`, data).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<TransferRecord>(`${PRIVATE}/transfer/${id}`).then((r) => r.data),

  getHistory: () =>
    apiClient.get<TransferRecord[]>(`${PRIVATE}/transfer`).then((r) => r.data),
};
