import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await setAuth(data.access_token, data.user);
      router.replace('/(tabs)');
    },
    onError: (err: { message: string }) => {
      showToast(err.message, 'error');
    },
  });
}

export function useRegister() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      showToast('Account created! Please log in.', 'success');
      router.replace('/(auth)/login');
    },
    onError: (err: { message: string }) => {
      showToast(err.message, 'error');
    },
  });
}
