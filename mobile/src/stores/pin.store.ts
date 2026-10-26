import { create } from 'zustand';

// ponytail: imperative PIN prompt via a stored promise resolver. One global
// modal (PinModalHost) serves every transaction screen — call requestPin(),
// await the 4 digits, then send them in the initiate body for the backend to
// verify. `unlocked` is the cold-start app lock; it lives only in memory so it
// resets to false on every app restart (and on logout), forcing a fresh PIN.
interface PinStore {
  visible: boolean;
  resolve: ((pin: string | null) => void) | null;
  unlocked: boolean;
  requestPin: () => Promise<string | null>;
  submitPin: (pin: string) => void;
  cancelPin: () => void;
  setUnlocked: (v: boolean) => void;
}

export const usePinStore = create<PinStore>((set, get) => ({
  visible: false,
  resolve: null,
  unlocked: false,
  requestPin: () => new Promise<string | null>((resolve) => set({ visible: true, resolve })),
  submitPin: (pin) => {
    get().resolve?.(pin);
    set({ visible: false, resolve: null });
  },
  cancelPin: () => {
    get().resolve?.(null);
    set({ visible: false, resolve: null });
  },
  setUnlocked: (v) => set({ unlocked: v }),
}));
