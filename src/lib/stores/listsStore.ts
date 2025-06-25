import { create } from "zustand";
import { List } from "../types";
import { defaultListName } from "../constants";

type ListsStore = {
  lists: List[];
  add: (list: List) => void;
  remove: (id: string) => void;
  rename: (id: string, newName: string) => void;
  findDefaultListId: () => string | undefined;
};

export const useListsStore = create<ListsStore>((set, get) => ({
  lists: [],
  add: (list) => set((state) => ({ lists: [list, ...state.lists] })),
  remove: (id) =>
    set((state) => ({ lists: state.lists.filter((list) => list.id !== id) })),
  rename: (id, newName) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, name: newName } : list,
      ),
    })),
  findDefaultListId: () => {
    const { lists } = get();
    return lists.find((list) => list.name === defaultListName)?.id;
  },
}));
