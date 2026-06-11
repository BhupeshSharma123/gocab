import { create } from "zustand";
import type { Profile } from "@/types";

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (p: Profile | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
