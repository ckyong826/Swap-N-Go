export type TokenSymbol = 'MYRC' | 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SUI';

export interface TokenBalance {
  token: TokenSymbol;
  amount: number;
  value_myr?: number;
}

export interface WalletInfo {
  sui_address: string;
  email: string;
  balances: TokenBalance[];
  total_value_myr: number;
}

export interface PriceMap {
  [token: string]: number;
}
