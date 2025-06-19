import { create } from "zustand";

export type Note = {
  id: string;
  title?: string;
  content?: string;
};

type EditNoteStore = {
  note?: Note;
  update: (note: Note) => void;
  reset: () => void;
};

type NoteStore = {
  notes: Note[];
  addNote: (title?: string, content?: string) => void;
  editNote: (id: string, title?: string, content?: string) => void;
  removeNote: (id: string) => void;
};

const updateLocalStorage = (notes: Note[]) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

export const useEditNoteStore = create<EditNoteStore>((set) => ({
  update: (note) => set({ note }),
  reset: () => set({ note: undefined }),
}));

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
  editNote: (id, title, content) =>
    set((state) => {
      const notes = state.notes.map((note) =>
        note.id === id ? { id, title, content } : note
      );
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
