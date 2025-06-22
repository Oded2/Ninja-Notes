import { create } from "zustand";
import { Toast, ToastTypes } from "../types";

type ToastStore = {
  toasts: Toast[];
  add: (
    type: ToastTypes,
    title: string,
    content: string,
    duration?: number,
  ) => string;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, title, content, duration = 5000) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          type,
          title,
          content,
          duration,
          id,
        },
      ],
    }));
    return id;
  },
  remove: (removeId) =>
    set((state) => ({
      toasts: state.toasts.filter(({ id }) => id !== removeId),
    })),
}));
