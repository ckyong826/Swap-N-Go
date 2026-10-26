export const env = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://swapngo.3utilities.com',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL ?? 'wss://swapngo.3utilities.com',
  SUI_EXPLORER_URL: process.env.EXPO_PUBLIC_SUI_EXPLORER_URL ?? 'https://suiexplorer.com',
  ENV: process.env.EXPO_PUBLIC_ENV ?? 'development',
} as const;
