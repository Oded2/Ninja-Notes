import { create } from "zustand";

type ConfirmStore = {
  showConfirm: (
    title: string,
    description: string,
    callback: () => Promise<void>,
    text?: string,
  ) => void;
  closeConfirm: () => void;
  content?: {
    title: string;
    description: string;
    callback: () => Promise<void>;
    text?: string;
  };
};

export const useConfirmStore = create<ConfirmStore>((set) => ({
  showConfirm: (title, description, callback, text) =>
    set({
      content: {
        title,
        description,
        callback,
        text,
      },
    }),
  closeConfirm: () =>
    set({
      content: undefined,
    }),
}));
