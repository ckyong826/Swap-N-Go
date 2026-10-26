import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsService, WsNotification } from '@/services/websocket.service';
import { useUIStore } from '@/stores/ui.store';
import { kycKeys } from '@/hooks/useKYC';

// Maps backend notification type strings to user-friendly messages.
const MESSAGES: Record<string, (n: WsNotification) => string> = {
  SWAP_COMPLETED: (n) => `Swap completed! You received ${n.data.to_amount ?? ''} ${n.data.to_token ?? ''}.`,
  SWAP_FAILED: () => 'Swap failed. Please try again.',
  DEPOSIT_SUCCESS: (n) => `Deposit of ${n.data.amount ?? ''} MYRC confirmed.`,
  DEPOSIT_FAILED: () => 'Deposit failed. Please contact support.',
  WITHDRAW_SUCCESS: (n) => `Withdrawal of ${n.data.amount ?? ''} MYR processed.`,
  WITHDRAW_FAILED: () => 'Withdrawal failed. Please contact support.',
  TRANSFER_SUCCESS: (n) => `Transfer of ${n.data.amount ?? ''} MYRC sent successfully.`,
  TRANSFER_FAILED: () => 'Transfer failed. Please try again.',
  KYC_APPROVED: () => 'Your KYC has been approved! Full features are now unlocked.',
  KYC_REJECTED: (n) => `Your KYC was rejected. Reason: ${n.data.remarks ?? 'No reason provided.'}`,
};

/**
 * Listens for server-pushed WebSocket notifications and shows an Alert.
 * Mount this once at the root of the authenticated app (e.g. in the tabs layout).
 *
 * @param onNotification  Optional callback for custom handling (e.g. toast library).
 */
export function useNotification(onNotification?: (n: WsNotification) => void) {
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;
  const showToast = useUIStore((s) => s.showToast);
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = wsService.addNotificationListener((notification) => {
      // Call optional custom handler
      onNotificationRef.current?.(notification);

      const formatter = MESSAGES[notification.type];
      if (formatter) {
        const isFailure = notification.type.endsWith('_FAILED') || notification.type === 'KYC_REJECTED';
        const message = formatter(notification);
        showToast(message, isFailure ? 'error' : 'success');
      }

      if (notification.type.endsWith('_COMPLETED') || notification.type.endsWith('_SUCCESS')) {
        qc.invalidateQueries({ queryKey: ['wallet'] });
        qc.invalidateQueries({ queryKey: ['transaction-history'] });
      } else if (notification.type.endsWith('_FAILED')) {
        qc.invalidateQueries({ queryKey: ['transaction-history'] });
      } else if (notification.type === 'KYC_APPROVED' || notification.type === 'KYC_REJECTED') {
        qc.invalidateQueries({ queryKey: kycKeys.status });
      }
    });

    return unsub;
  }, [showToast, qc]);
}
