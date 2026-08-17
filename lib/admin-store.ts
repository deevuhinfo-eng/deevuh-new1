'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  setAuthenticated: () => void;
  logout: () => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: () => set({ isAuthenticated: true }),
      logout: () => {
        // Also sign out from Supabase
        try {
          const { createClient } = require('@/lib/supabase/client');
          const supabase = createClient();
          supabase.auth.signOut();
        } catch {}
        set({ isAuthenticated: false });
      },
    }),
    { name: 'maison-noir-admin', storage: createJSONStorage(() => localStorage) }
  )
);
