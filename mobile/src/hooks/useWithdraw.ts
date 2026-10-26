import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { withdrawApi, withdrawKeys } from '@/api/withdraw.api';
import { useUIStore } from '@/stores/ui.store';
import { FsmStatus } from '@/types/fsm.types';

const TERMINAL: FsmStatus[] = ['completed', 'failed'];

export function useInitiateWithdraw() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: withdrawApi.initiate,
    onSuccess: (data) => {
      router.push(`/withdraw/status?id=${data.id}`);
    },
    onError: (err: { message: string }) => {
      showToast(err.message, 'error');
    },
  });
}

export function useWithdrawStatus(id: string) {
  return useQuery({
    queryKey: withdrawKeys.status(id),
    queryFn: () => withdrawApi.getStatus(id),
    enabled: !!id,
    refetchInterval: (query) =>
      TERMINAL.includes(query.state.data?.status as FsmStatus) ? false : 2000,
  });
}

export function useWithdrawHistory() {
  return useQuery({
    queryKey: withdrawKeys.all,
    queryFn: withdrawApi.getHistory,
  });
}
