import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kycApi, KYCStatus, SubmitKYCPayload } from '@/api/kyc.api';
import { useUIStore } from '@/stores/ui.store';

export const kycKeys = {
  status: ['kyc-status'] as const,
};

export function useKYCStatus() {
  return useQuery<KYCStatus>({
    queryKey: kycKeys.status,
    queryFn: kycApi.getStatus,
    staleTime: 30_000,
  });
}

export function useSubmitKYC(onSuccess?: () => void) {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: SubmitKYCPayload) => kycApi.submit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kycKeys.status });
      showToast('KYC submitted successfully! Awaiting admin review.', 'success');
      onSuccess?.();
    },
    onError: (err: { message: string }) => {
      showToast(err.message ?? 'KYC submission failed', 'error');
    },
  });
}

/** Returns true only when KYC status is APPROVED */
export function useIsKYCApproved(): boolean {
  const { data } = useKYCStatus();
  return data?.status === 'APPROVED';
}
