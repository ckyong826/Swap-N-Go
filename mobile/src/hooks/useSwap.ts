import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { swapApi, swapKeys } from '@/api/swap.api';
import { useUIStore } from '@/stores/ui.store';
import { FsmStatus } from '@/types/fsm.types';

const TERMINAL: FsmStatus[] = ['completed', 'failed'];

export function useInitiateSwap() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: swapApi.initiate,
    onSuccess: (data) => {
      router.push(`/transaction/${data.id}?type=swap`);
    },
    onError: (err: { message: string }) => {
      showToast(err.message, 'error');
    },
  });
}

export function useSwapStatus(id: string) {
  return useQuery({
    queryKey: swapKeys.status(id),
    queryFn: () => swapApi.getStatus(id),
    enabled: !!id,
    refetchInterval: (query) =>
      TERMINAL.includes(query.state.data?.status as FsmStatus) ? false : 2000,
  });
}

export function useSwapHistory() {
  return useQuery({
    queryKey: swapKeys.list(),
    queryFn: swapApi.getHistory,
  });
}
