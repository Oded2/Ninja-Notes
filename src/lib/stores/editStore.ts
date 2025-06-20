import { create } from "zustand";
import { Note } from "../types";

type EditNoteStore = {
  note?: Note;
  update: (note: Note) => void;
  reset: () => void;
};

export const useEditStore = create<EditNoteStore>((set) => ({
  update: (note) => set({ note }),
  reset: () => set({ note: undefined }),
}));

// export const useNoteStore = create<NoteStore>((set) => ({
//   notes: [],
//   addNote: (title, content) =>
//     set((state) => {
//       const notes = [
//         ...state.notes,
//         { id: crypto.randomUUID(), title, content },
//       ];
//       updateLocalStorage(notes);
//       return { notes };
//     }),
//   editNote: (id, title, content) =>
//     set((state) => {
//       const notes = state.notes.map((note) =>
//         note.id === id ? { id, title, content } : note,
//       );
//       updateLocalStorage(notes);
//       return { notes };
//     }),
//   removeNote: (id) =>
//     set((state) => {
//       const notes = state.notes.filter((note) => note.id !== id);
//       updateLocalStorage(notes);
//       return { notes };
//     }),
// }));
