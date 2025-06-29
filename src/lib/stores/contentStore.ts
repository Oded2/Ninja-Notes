import { create } from 'zustand';
import { List, Note } from '../types';
import { decoyListId, defaultListName } from '../constants';
import { findDefaultListId } from '../helpers';

type ContentStore = {
  notes: Note[];
  lists: List[];
  addNote: (note: Note, list?: List) => void;
  editNote: (id: string, newNote: Note, list?: List) => string | undefined; // Returns the deleted list's id (if a list was deleted);
  removeNote: (id: string) => string | undefined;
  addList: (list: List, newNotes: Note[]) => void;
  addDecoyList: (name: string) => List;
  removeDecoyList: () => void;
  renameList: (id: string, newName: string) => void;
  removeList: (id: string) => boolean;
  reverseNotes: () => void;
  purge: (full?: boolean) => void;
};

/**
 * @function addNote For adding a singular note, along with an optional list if a new list was created
 * @function addList For adding a single list with multiple notes in it, used when fetching lists and notes seperately
 */
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
  editNote: (id, newNote, list) => {
    let deletedListId: string | undefined;
    set((state) => {
      let oldListId: string | undefined;
      const toSet: Partial<ContentStore> = {};
      toSet.notes = state.notes.map((note) => {
        if (note.id !== id) return note;
        oldListId = note.listId;
        return newNote;
      });
      const defaultListId = findDefaultListId(state.lists);
      if (
        oldListId !== defaultListId &&
        !toSet.notes.some((note) => note.listId === oldListId)
      ) {
        // The note was the last one in its list, and the now empty list is not the default list
        deletedListId = oldListId;
        toSet.lists = state.lists.filter((list) => list.id !== oldListId);
      }
      if (list) {
        // The user has added a new list
        toSet.lists = [list, ...state.lists];
      }
      return toSet;
    });
    return deletedListId;
  },
  removeNote: (id) => {
    // If the note was the last one in its list, then the list must be deleted as well
    // The return value of this function is either the id of the deleted list or undefined if no list was deleted
    let deletedListId: string | undefined = undefined;
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
      const defaultListId = findDefaultListId(state.lists);
      if (
        removedNoteListId !== defaultListId &&
        !filteredNotes.some((note) => note.listId === removedNoteListId)
      ) {
        // The removed note was not in the default list and it was last one in its list
        toSet.lists = lists.filter((list) => list.id !== removedNoteListId);
        deletedListId = removedNoteListId;
      }
      return toSet;
    });
    return deletedListId;
  },
  addList: (list, newNotes) =>
    set((state) => ({
      lists: [list, ...state.lists],
      notes: [...newNotes, ...state.notes].toSorted(
        (a, b) => b.createdAt.seconds - a.createdAt.seconds,
      ),
    })),
  addDecoyList: (name) => {
    const decoyList: List = {
      name,
      id: decoyListId,
    };
    set((state) => ({ lists: [...state.lists, decoyList] }));
    return decoyList;
  },
  removeDecoyList: () =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== decoyListId),
    })),
  renameList: (id, newName) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, name: newName } : list,
      ),
    })),
  removeList: (id) => {
    let notDefaultList: boolean = false;
    set((state) => {
      const { lists } = state;
      const toSet: Partial<ContentStore> = {
        notes: state.notes.filter((note) => note.listId !== id),
      };
      notDefaultList = findDefaultListId(lists) !== id;
      if (notDefaultList) toSet.lists = lists.filter((list) => list.id !== id);
      return toSet;
    });
    return notDefaultList;
  },
  reverseNotes: () => set((state) => ({ notes: state.notes.toReversed() })),
  purge: (full) =>
    set((state) => ({
      notes: [],
      lists: full
        ? []
        : state.lists.filter((list) => list.name === defaultListName),
    })),
}));
