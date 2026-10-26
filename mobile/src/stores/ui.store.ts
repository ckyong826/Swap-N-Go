import { create } from 'zustand';

type ToastItem = { message: string; type: 'success' | 'error' | 'info' };

interface UIStore {
  toast: ToastItem | null;
  queue: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

function showNext(set: (fn: (s: UIStore) => Partial<UIStore>) => void) {
  set((s) => {
    const [next, ...rest] = s.queue;
    if (!next) return { toast: null, queue: rest };
    setTimeout(() => showNext(set), 3000);
    return { toast: next, queue: rest };
  });
}

export const useUIStore = create<UIStore>((set, get) => ({
  toast: null,
  queue: [],

  showToast: (message, type = 'info') => {
    const item: ToastItem = { message, type };
    const { toast, queue } = get();
    const isDuplicate =
      (toast !== null && toast.message === message && toast.type === type) ||
      queue.some((q) => q.message === message && q.type === type);
    if (isDuplicate) return;

    if (toast === null) {
      set({ toast: item });
      setTimeout(() => showNext(set), 3000);
    } else {
      set((s) => ({ queue: [...s.queue, item] }));
    }
  },

  hideToast: () => showNext(set),
}));
