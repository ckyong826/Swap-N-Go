export type FsmStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AsyncOperation {
  id: string;
  status: FsmStatus;
  sui_tx_hash?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
