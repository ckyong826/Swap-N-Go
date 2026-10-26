import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket.service';

export function usePriceSocket() {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = wsService.addListener(setPrices);
    return () => { unsub(); };
  }, []);

  return { prices };
}
