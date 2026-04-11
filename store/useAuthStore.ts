// ── FILE: store/useAuthStore.ts ───────────────────────────────────────────────
// Local-first auth state — persists via SQLite sessions table.

import { create } from 'zustand';
import type { AuthUser } from '../db/client';

interface AuthStore {
  user: AuthUser | null;
  isCheckingSession: boolean;
  setUser: (user: AuthUser | null) => void;
  setCheckingSession: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isCheckingSession: true,

  setUser: (user) => set({ user }),
  setCheckingSession: (isCheckingSession) => set({ isCheckingSession }),
  logout: () => set({ user: null }),
}));
