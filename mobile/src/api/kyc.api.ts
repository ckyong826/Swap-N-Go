import { apiClient, PRIVATE } from './client';

// ── User-facing types ────────────────────────────────────────────────────────

export interface KYCStatus {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  kyc_id?: string;
  full_name?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubmitKYCPayload {
  full_name: string;
  ic_number: string;
  ic_front_photo: string; // base64-encoded image
  ic_back_photo: string;  // base64-encoded image
  selfie_photo: string;   // base64-encoded live selfie
}

// ── Admin types ───────────────────────────────────────────────────────────────

export interface PendingKYCItem {
  kyc_id: string;
  user_id: string;
  full_name: string;
  ic_number: string;
  ic_front_photo: string; // decrypted base64
  ic_back_photo: string;  // decrypted base64
  selfie_photo: string;   // decrypted base64 live selfie
  status: string;
  created_at: string;
}

// ── User-facing API ───────────────────────────────────────────────────────────

export const kycApi = {
  getStatus: () =>
    apiClient
      .get<KYCStatus>(`${PRIVATE}/kyc/status`)
      .then((r) => r.data),

  submit: (payload: SubmitKYCPayload) =>
    apiClient
      .post(`${PRIVATE}/kyc/submit`, payload)
      .then((r) => r.data),
};

// ── Admin API ─────────────────────────────────────────────────────────────────

export const kycAdminApi = {
  listPending: () =>
    apiClient
      .get<PendingKYCItem[]>(`${PRIVATE}/admin/kyc/pending`)
      .then((r) => r.data),

  approve: (kycId: string) =>
    apiClient
      .put(`${PRIVATE}/admin/kyc/${kycId}/approve`)
      .then((r) => r.data),

  reject: (kycId: string, remarks: string) =>
    apiClient
      .put(`${PRIVATE}/admin/kyc/${kycId}/reject`, { remarks })
      .then((r) => r.data),
};
