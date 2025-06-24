import { create } from "zustand";
import { Toast, ToastTypes } from "../types";

type ToastStore = {
  toasts: Toast[];
  add: (
    type: ToastTypes,
    title: string,
    description?: string,
    duration?: number,
  ) => string;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, title, description, duration = 5000) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          type,
          title,
          description,
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
