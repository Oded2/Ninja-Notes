import { create } from "zustand";

export type Note = {
  id: string;
  title?: string;
  content?: string;
};

type NoteStore = {
  notes: Note[];
  addNote: (title?: string, content?: string) => void;
  removeNote: (id: string) => void;
};

const updateLocalStorage = (notes: Note[]) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  addNote: (title, content) =>
    set((state) => {
      const notes = [
        ...state.notes,
        { id: crypto.randomUUID(), title, content },
      ];
      updateLocalStorage(notes);
      return { notes };
    }),
  removeNote: (id) =>
    set((state) => {
      const notes = state.notes.filter((note) => note.id !== id);
      updateLocalStorage(notes);
      return { notes };
    }),
}));
