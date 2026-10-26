import { TokenBalance, TokenSymbol } from '@/types/wallet.types';

export function getTokenBalance(balances: TokenBalance[] | undefined, token: TokenSymbol): number {
  return balances?.find((b) => b.token === token)?.amount ?? 0;
}
