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
