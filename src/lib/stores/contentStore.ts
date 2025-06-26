import { create } from "zustand";
import { List, Note } from "../types";

type ContentStore = {
  notes: Note[];
  lists: List[];
  addNote: (note: Note, list?: List) => void;
  editNote: (id: string, newNote: Note) => void;
  removeNote: (id: string) => void;
  purgeNotes: () => void;
  renameList: (id: string, newName: string) => void;
  purgeList: (id: string) => void;
};

export const useContentStore = create<ContentStore>((set) => ({
  notes: [],
  lists: [],
  addNote: (note, list) =>
    set((state) => {
      const toAdd: Partial<ContentStore> = {
        notes: [note, ...state.notes],
      };
      if (list) toAdd.lists = [list, ...state.lists];
      return toAdd;
    }),
  editNote: (id, newNote) =>
    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? newNote : note)),
    })),
  removeNote: (id) =>
    set((state) => {
      const { lists, notes } = state;
      let removedNoteListId: string | undefined = undefined;
      const filteredNotes = notes.filter((note) => {
        if (note.id !== id) return true;
        removedNoteListId = note.listId;
        return false;
      });
      const toSet: Partial<ContentStore> = {
        notes: filteredNotes,
      };
      if (
        removedNoteListId &&
        !filteredNotes.some((note) => note.listId === removedNoteListId)
      ) {
        // The removed note was the last one in its list
        toSet.lists = lists.filter((list) => list.id !== removedNoteListId);
      }
      return toSet;
    }),
  purgeNotes: () => set({ notes: [], lists: [] }),
  renameList: (id, newName) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, name: newName } : list,
      ),
    })),
  purgeList: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.listId !== id),
      lists: state.lists.filter((list) => list.id !== id),
    })),
}));
