import { User } from "firebase/auth";
import { create } from "zustand";

type UserStore = {
  user: User | null;
  loading?: boolean;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
}));
