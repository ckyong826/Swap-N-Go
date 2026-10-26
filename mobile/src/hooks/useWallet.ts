import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet.api';
import { usePriceSocket } from './usePriceSocket';

export function useWallet() {
  const { prices } = usePriceSocket();

  const query = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    staleTime: 30_000,
  });

  // Balances/values come straight from backend response — no frontend recalc.
  return { ...query, prices };
}
