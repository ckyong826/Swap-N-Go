import { create } from 'zustand';
import { storageService } from '@/services/storage.service';
import { wsService } from '@/services/websocket.service';
import { UserInfo } from '@/types/auth.types';
import { router } from 'expo-router';
import { usePinStore } from '@/stores/pin.store';

interface AuthStore {
  accessToken: string | null;
  role: string;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: UserInfo) => Promise<void>;
  /** @deprecated use setAuth instead */
  setToken: (token: string) => Promise<void>;
  loadToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  role: 'USER',
  userInfo: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token, user) => {
    await storageService.setToken(token);
    await storageService.setRole(user.role);
    await storageService.setUser(user);
    wsService.connect(token);
    set({ accessToken: token, role: user.role, userInfo: user, isAuthenticated: true });
  },

  // Backwards-compat shim
  setToken: async (token) => {
    await storageService.setToken(token);
    wsService.connect(token);
    set({ accessToken: token, role: 'USER', isAuthenticated: true });
  },

  loadToken: async () => {
    const token = await storageService.getToken();
    if (token) {
      const role = (await storageService.getRole()) ?? 'USER';
      const userInfo = await storageService.getUser();
      wsService.connect(token);
      set({ accessToken: token, role, userInfo, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    wsService.disconnect();
    await storageService.deleteToken();
    await storageService.deleteRole();
    await storageService.deleteUser();
    usePinStore.getState().setUnlocked(false); // re-lock so next login re-prompts for PIN
    set({ accessToken: null, role: 'USER', userInfo: null, isAuthenticated: false });
    router.replace('/(auth)/login');
  },
}));
