import { create } from "zustand";
import { Note } from "../types";

type NotesStore = {
  notes: Note[];
  add: (note: Note) => void;
  remove: (id: string) => void;
  edit: (id: string, newNote: Note) => void;
  reverse: () => void;
  purge: (listId?: string) => void;
};

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  add: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),
  remove: (id) =>
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
  edit: (id, newNote) =>
    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? newNote : note)),
    })),
  reverse: () => set((state) => ({ notes: state.notes.toReversed() })),
  purge: (listId) =>
    set((state) => ({
      notes: listId ? state.notes.filter((note) => note.listId !== listId) : [],
    })),
}));
