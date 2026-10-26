import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsService } from '@/services/websocket.service';
import { kycKeys } from '@/hooks/useKYC';

/**
 * Refreshes wallet, transaction history, and KYC status on WebSocket
 * reconnect, since missed-while-disconnected events aren't replayed.
 */
export function useWsReconnectRefresh() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = wsService.addReconnectListener(() => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transaction-history'] });
      qc.invalidateQueries({ queryKey: kycKeys.status });
    });

    return unsub;
  }, [qc]);
}
