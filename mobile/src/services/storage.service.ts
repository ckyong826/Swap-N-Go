import * as SecureStore from 'expo-secure-store';
import { UserInfo } from '@/types/auth.types';

const TOKEN_KEY = 'swapngo_access_token';
const ROLE_KEY = 'swapngo_role';
const USER_KEY = 'swapngo_user';

export const storageService = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getRole(): Promise<string | null> {
    return SecureStore.getItemAsync(ROLE_KEY);
  },

  async setRole(role: string): Promise<void> {
    await SecureStore.setItemAsync(ROLE_KEY, role);
  },

  async deleteRole(): Promise<void> {
    await SecureStore.deleteItemAsync(ROLE_KEY);
  },

  async getUser(): Promise<UserInfo | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async setUser(user: UserInfo): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async deleteUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
