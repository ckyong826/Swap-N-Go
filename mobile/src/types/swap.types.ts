import { FsmStatus } from './fsm.types';
import { TokenSymbol } from './wallet.types';

export interface SwapInitiateRequest {
  from_token: TokenSymbol;
  to_token: TokenSymbol;
  amount: number;
  pin: string;
}

export interface SwapRecord {
  id: string;
  status: FsmStatus;
  from_token: TokenSymbol;
  to_token: TokenSymbol;
  amount: number;
  received_amount?: number;
  sui_tx_hash?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
