import { TokenSymbol } from '@/types/wallet.types';

export const POLLING_INTERVAL_MS = 2000;

export const TOKENS: TokenSymbol[] = ['MYRC', 'USDT', 'USDC', 'BTC', 'ETH', 'SUI'];

export const TOKEN_COLORS: Record<TokenSymbol, string> = {
  MYRC: '#E11D48',
  USDT: '#26A17B',
  USDC: '#2775CA',
  BTC: '#F7931A',
  ETH: '#627EEA',
  SUI: '#4DA2FF',
};

export const COLORS = {
  // Brand purple (primary)
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDim: '#EDE9FE',
  purpleDark: '#1C0A3A',
  purpleCard: '#2D1B69',

  // Legacy aliases — mapped to purple palette so existing consumers auto-update
  green: '#EDE9FE',       // was lime green, now soft purple tint
  greenDark: '#C4B5FD',   // was darker green, now medium purple

  // Base
  white: '#FFFFFF',
  offWhite: '#F7F5FF',
  black: '#0F0A1A',

  // Text / surface
  gray: '#6B6B8A',
  grayLight: '#F5F4FF',
  grayBorder: '#E4E2F0',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  pending: '#F59E0B',
  processing: '#3B82F6',
};
