import { create } from "zustand";
import { Toast, ToastTypes } from "../types";

type ToastStore = {
  toasts: Toast[];
  addToast: (
    type: ToastTypes,
    title: string,
    content: string,
    duration?: number,
  ) => string;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, title, content, duration) => {
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
  removeToast: (removeId) =>
    set((state) => ({
      toasts: state.toasts.filter(({ id }) => id !== removeId),
    })),
}));
