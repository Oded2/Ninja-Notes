import { create } from "zustand";
import { List } from "../types";

type ListsStore = {
  lists: List[];
  add: (list: List) => void;
  remove: (id: string) => void;
  rename: (id: string, newName: string) => void;
};

export const useListsStore = create<ListsStore>((set) => ({
  lists: [],
  add: (list) => set((state) => ({ lists: [list, ...state.lists] })),
  remove: (id) =>
    set((state) => ({ lists: state.lists.filter((list) => list.id !== id) })),
  rename: (id, newName) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { name: newName, id } : list,
      ),
    })),
}));
