import { FsmStatus } from './fsm.types';

export type TransactionType = 'transfer' | 'swap' | 'deposit' | 'withdrawal';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  status: FsmStatus;
  amount: number;
  token: string;
  sui_tx_hash?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  recipient?: string;
  direction?: 'sent' | 'received';
  from_token?: string;
  to_token?: string;
}
