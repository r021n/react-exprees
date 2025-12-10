import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    set({ user: null, token: null, isLoading: false });
  },

  initFromStorage: () => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("authUser");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoading: false });
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
