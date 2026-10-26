import { apiClient, PRIVATE } from './client';
import { WalletInfo } from '@/types/wallet.types';

export const walletApi = {
  getWallet: () =>
    apiClient.get<WalletInfo>(`${PRIVATE}/wallet`).then((r) => r.data),

  getBalances: () =>
    apiClient.get(`${PRIVATE}/wallet/balances`).then((r) => r.data),
};
