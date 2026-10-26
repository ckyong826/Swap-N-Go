import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { transferApi, transferKeys } from '@/api/transfer.api';
import { useUIStore } from '@/stores/ui.store';
import { FsmStatus } from '@/types/fsm.types';

const TERMINAL: FsmStatus[] = ['completed', 'failed'];

// Live recipient lookup. Debounced 400ms; skips raw 0x addresses and short input.
// Query key = the trimmed input, so React Query dedupes and the latest key wins
// (no manual cancellation needed).
export function useResolveRecipient(input: string) {
  const q = input.trim();
  const [debounced, setDebounced] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const enabled = debounced.length >= 3 && !debounced.startsWith('0x');

  return useQuery({
    queryKey: transferKeys.resolve(debounced),
    queryFn: () => transferApi.resolve(debounced),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useInitiateTransfer() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: transferApi.initiate,
    onSuccess: (data) => {
      router.push(`/transaction/${data.id}?type=transfer`);
    },
    onError: (err: { message: string }) => {
      showToast(err.message, 'error');
    },
  });
}

export function useTransferStatus(id: string) {
  return useQuery({
    queryKey: transferKeys.status(id),
    queryFn: () => transferApi.getStatus(id),
    enabled: !!id,
    refetchInterval: (query) =>
      TERMINAL.includes(query.state.data?.status as FsmStatus) ? false : 2000,
  });
}

export function useTransferHistory() {
  return useQuery({
    queryKey: transferKeys.list(),
    queryFn: transferApi.getHistory,
  });
}
