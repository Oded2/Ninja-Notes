import { create } from "zustand";

type ConfirmStore = {
  showConfirm: (
    title: string,
    description: string,
    callback: () => Promise<void>,
  ) => void;
  closeConfirm: () => void;
  content?: {
    title: string;
    description: string;
    callback: () => Promise<void>;
  };
};

export const useConfirmStore = create<ConfirmStore>((set) => ({
  showConfirm: (title, description, callback) =>
    set({
      content: {
        title,
        description,
        callback,
      },
    }),
  closeConfirm: () =>
    set({
      content: undefined,
    }),
}));
