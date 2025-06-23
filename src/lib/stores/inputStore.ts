import { create } from "zustand";

type InputStore = {
  showInput: (label: string, callback: (val: string) => void) => void;
  closeInput: () => void;
  content?: {
    label: string;
    callback: (val: string) => void;
  };
};

export const useInputStore = create<InputStore>((set) => ({
  showInput: (label, callback) =>
    set({
      content: {
        label,
        callback,
      },
    }),
  closeInput: () => set({ content: undefined }),
}));
