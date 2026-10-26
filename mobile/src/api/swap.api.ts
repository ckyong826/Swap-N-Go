import { apiClient, PRIVATE } from './client';
import { SwapInitiateRequest, SwapRecord } from '@/types/swap.types';

export const swapKeys = {
  all: ['swaps'] as const,
  list: () => [...swapKeys.all, 'list'] as const,
  status: (id: string) => [...swapKeys.all, 'status', id] as const,
};

export const swapApi = {
  initiate: (data: SwapInitiateRequest) =>
    apiClient.post<{ id: string; status: string }>(`${PRIVATE}/swap/initiate`, data).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<SwapRecord>(`${PRIVATE}/swap/${id}`).then((r) => r.data),

  getHistory: () =>
    apiClient.get<SwapRecord[]>(`${PRIVATE}/swap`).then((r) => r.data),
};
