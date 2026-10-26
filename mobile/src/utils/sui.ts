const SUI_EXPLORER = process.env.EXPO_PUBLIC_SUI_EXPLORER_URL ?? 'https://suiscan.xyz/testnet';

export function suiExplorerTxUrl(hash: string): string {
  return `${SUI_EXPLORER}/tx/${hash}`;
}

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{63,64}$/.test(address);
}

export function truncateSuiAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
