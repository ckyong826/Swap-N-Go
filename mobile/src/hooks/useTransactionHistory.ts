import { useQuery } from '@tanstack/react-query';
import { transferApi } from '@/api/transfer.api';
import { swapApi } from '@/api/swap.api';
import { depositApi } from '@/api/deposit.api';
import { withdrawApi } from '@/api/withdraw.api';
import { TransactionRecord } from '@/types/transaction.types';

export function useTransactionHistory() {
  return useQuery({
    queryKey: ['transaction-history'],
    queryFn: async (): Promise<TransactionRecord[]> => {
      const [transfers, swaps, deposits, withdrawals] = await Promise.allSettled([
        transferApi.getHistory(),
        swapApi.getHistory(),
        depositApi.getHistory(),
        withdrawApi.getHistory(),
      ]);

      const all: TransactionRecord[] = [];

      if (transfers.status === 'fulfilled') {
        transfers.value.forEach((t) =>
          all.push({ ...t, type: 'transfer', token: t.token, amount: t.amount, status: t.status as any })
        );
      }
      if (swaps.status === 'fulfilled') {
        swaps.value.forEach((s) =>
          all.push({ ...s, type: 'swap', token: s.from_token, amount: s.amount, status: s.status as any })
        );
      }
      if (deposits.status === 'fulfilled') {
        deposits.value.forEach((d) =>
          all.push({ ...d, type: 'deposit', token: 'MYRC' as const, amount: d.amount_myr, status: d.status as any })
        );
      }
      if (withdrawals.status === 'fulfilled') {
        withdrawals.value.forEach((w) =>
          all.push({ ...w, type: 'withdrawal', token: w.token, amount: w.amount, status: w.status as any })
        );
      }

      return all.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    staleTime: 30_000,
  });
}
