import { create } from "zustand";

type Note = {
  id: string;
  title?: string;
  content: string;
};

type NoteStore = {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  removeNote: (id: string) => void;
};

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  addNote: (title, content) =>
    set((state) => ({
      notes: [...state.notes, { id: crypto.randomUUID(), title, content }],
    })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),
}));
