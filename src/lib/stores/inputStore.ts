import { create } from "zustand";

type InputStore = {
  showInput: (
    label: string,
    callback: (val: string) => void,
    maxLlength?: number,
  ) => void;
  closeInput: () => void;
  content?: {
    label: string;
    callback: (val: string) => void;
    maxLength?: number;
  };
};

export const useInputStore = create<InputStore>((set) => ({
  showInput: (label, callback, maxLength) =>
    set({
      content: {
        label,
        callback,
        maxLength,
      },
    }),
  closeInput: () => set({ content: undefined }),
}));
