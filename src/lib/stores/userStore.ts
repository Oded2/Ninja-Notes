import { User } from "firebase/auth";
import { create } from "zustand";

type UserStore = {
  user: User | null;
  key: CryptoKey | null;
  loading?: boolean;
  setUser: (user: User | null) => void;
  setKey: (key: CryptoKey | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  key: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setKey: (key) => set({ key }),
}));
