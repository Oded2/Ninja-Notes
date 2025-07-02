import { useEditStore } from '@/lib/stores/editStore';
import { List, Note } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import Collapse from './Collapse';
import {
  cleanSearch,
  deleteByQuery,
  encryptWithKey,
  formatTimestamp,
  handleError,
} from '@/lib/helpers';
import CopyButton from './CopyButton';
import { useConfirmStore } from '@/lib/stores/confirmStore';
import { defaultListName } from '@/lib/constants';
import InlineDivider from './InlineDivider';
import { deleteDoc, doc, query, updateDoc, where } from 'firebase/firestore';
import { listsCollection, notesCollection } from '@/lib/firebase';
import {
  ArrowsUpDownIcon,
  ChevronDoubleDownIcon,
} from '@heroicons/react/24/solid';
import { useMemo, useState } from 'react';
import ListSelect from './ListSelect';
import IconButton from './IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/lib/stores/toastStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useInputStore } from '@/lib/stores/inputStore';
import { useContentStore } from '@/lib/stores/contentStore';
import AutoLink from './AutoLink';
import FormInput from './FormInput';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';

export default function NoteViewer() {
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const setEditNote = useEditStore((state) => state.update);
  const showConfirm = useConfirmStore((state) => state.showConfirm);
  const showInput = useInputStore((state) => state.showInput);
  const notes = useContentStore((state) => state.notes);
  const reverseNotes = useContentStore((state) => state.reverseNotes);
  const removeNote = useContentStore((state) => state.removeNote);
  const lists = useContentStore((state) => state.lists);
  const renameList = useContentStore((state) => state.renameList);
  const removeList = useContentStore((state) => state.removeList);
  const [closedNotes, setClosedNotes] = useState<string[]>([]);
  const addToast = useToastStore((state) => state.add);
  // Undefined implies all lists
  const [listFilter, setListFilter] = useState<List | undefined>(undefined);
  const [searchFilter, setSearchFilter] = useState('');
  // At least one of the notes are closed
  const notesOpen = useMemo(() => !!closedNotes.length, [closedNotes]);
  const filteredNotes = useMemo(() => {
    let result = notes;
    const trimmedSearchFilter = searchFilter.trim();
    if (trimmedSearchFilter) {
      const lowerCaseFilter = cleanSearch(trimmedSearchFilter);
      // Title and content don't need to be trimmed as they are trimmed when inserted into the database
      result = result.filter(
        (note) =>
          cleanSearch(note.title).includes(lowerCaseFilter) ||
          cleanSearch(note.content).includes(lowerCaseFilter),
      );
    }
    if (listFilter)
      result = result.filter((note) => note.listId === listFilter.id);
    return result;
  }, [notes, searchFilter, listFilter]);

  const deleteNote = async (note: Note) => {
    const { id } = note;
    const promises: Promise<void>[] = [];
    const docRef = doc(notesCollection, id);
    promises.push(deleteDoc(docRef));
    const removedListId = removeNote(id);
    if (removedListId) {
      console.log('Deleting list');
      const listRef = doc(listsCollection, removedListId);
      promises.push(deleteDoc(listRef));
      setListFilter(undefined);
    }
    try {
      await Promise.all(promises);
    } catch (err) {
      handleError(err);
    }
    addToast('success', 'Note removed', undefined, 2000);
  };

  const handleRenameList = async (list: List, newName: string) => {
    if (!userKey) return;
    if (lists.some((listItem) => listItem.name === newName)) {
      addToast(
        'error',
        'Duplicate list',
        'A list with that name already exists',
      );
      return;
    }
    const { id, userId, name } = list;
    const docRef = doc(listsCollection, id);
    const encryptedName = await encryptWithKey(newName, userKey);
    await updateDoc(docRef, {
      name: encryptedName,
      userId,
    });
    renameList(id, newName);
    setListFilter({ ...list, name: newName });
    addToast(
      'success',
      'Rename successful',
      `Renamed collection "${name}" to "${newName}"`,
    );
  };

  const deleteList = async (list: List) => {
    const { id: listId, name } = list;
    const promises: Promise<void>[] = [];
    const q = query(
      notesCollection,
      where('userId', '==', user?.uid),
      where('listId', '==', listId),
    );
    // Delete every note in that list
    promises.push(deleteByQuery(q));
    const notDefault = removeList(listId);
    if (notDefault) {
      // User isn't deleting the default collection
      // Delete the list
      const docRef = doc(listsCollection, listId);
      promises.push(deleteDoc(docRef));
    }
    setListFilter(undefined);
    try {
      await Promise.all(promises);
    } catch (err) {
      handleError(err);
    }
    addToast(
      'success',
      'Collection delete',
      name === defaultListName
        ? 'The default collection has been successfully deleted'
        : `Collection '${name}' has been successfully deleted`,
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 *:flex *:gap-2">
        <div className="*:cursor-pointer *:transition-opacity *:hover:opacity-70 *:active:opacity-60">
          <button onClick={() => reverseNotes()}>
            <ArrowsUpDownIcon className="size-6" />
          </button>
          <motion.button
            initial={false}
            animate={{ rotate: notesOpen ? 180 : 0 }}
            transition={{
              type: 'spring',
              duration: 0.5,
            }}
            onClick={() => {
              if (notesOpen) setClosedNotes([]);
              else setClosedNotes(notes.map((note) => note.id));
            }}
          >
            <ChevronDoubleDownIcon className="size-6" />
          </motion.button>
        </div>
        <div className="grow sm:max-w-3xs">
          <FormInput label="Search" val={searchFilter} setVal={setSearchFilter}>
            <MagnifyingGlassIcon />
          </FormInput>
        </div>
        <div className="max-w-3xs grow">
          <ListSelect allowAll val={listFilter} setVal={setListFilter} />
        </div>
        <AnimatePresence>
          {listFilter && (
            <motion.div
              key="collectionActions"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 100, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <IconButton
                style="neutral"
                disabled={listFilter.name === defaultListName}
                onClick={() => {
                  const { name } = listFilter;
                  if (name === defaultListName) {
                    // There's no way for the server to stop the user from renaming the default list unless it knows what the default list is, which would compromise end-to-end encryption
                    // Therefore, beyond just disabling the rename button, this if statement adds extra client-side validation to ensure that the user doesn't rename the default list
                    return;
                  }
                  showInput(`Rename collection: ${name}`, (newName) =>
                    handleRenameList(listFilter, newName),
                  );
                }}
              >
                <PencilIcon />
              </IconButton>
              <IconButton
                style="error"
                onClick={() => {
                  const { name } = listFilter;
                  const isDefaultList = name === defaultListName;
                  showConfirm(
                    'Delete collection?',
                    isDefaultList
                      ? 'All notes under the default collection will be deleted.'
                      : `All notes under the collection '${name}' will be deleted.`,
                    async () => await deleteList(listFilter),
                    isDefaultList ? 'Default collection' : name,
                  );
                }}
              >
                <TrashIcon />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col rounded-lg border border-slate-950/20">
        <AnimatePresence initial={false}>
          {filteredNotes.map((note) => {
            const { id, listId, title, content } = note;
            const isOpen = !closedNotes.includes(id);
            const { editedAt } = note;
            const listName = lists.find((list) => list.id === listId)?.name;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col gap-2 border-slate-950/20 px-5 py-4 not-last:border-b"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 dir="auto" className="text-xl font-semibold">
                      {title}
                    </h2>
                    <div className="text-sm text-slate-950/80">
                      <InlineDivider>
                        <div>{formatTimestamp(note.createdAt)}</div>
                        {editedAt && (
                          <div>{`Edited: ${formatTimestamp(editedAt)}`}</div>
                        )}
                        {listName && (
                          <div>
                            {listName === defaultListName
                              ? 'Default collection'
                              : listName}
                          </div>
                        )}
                      </InlineDivider>
                    </div>
                  </div>
                  <div className="flex transition-all not-pointer-coarse:scale-80 not-pointer-coarse:opacity-0 group-hover:scale-100 group-hover:opacity-100">
                    <CopyButton text={content} />
                  </div>
                </div>
                <Collapse open={isOpen}>
                  <AutoLink text={content} />
                </Collapse>
                <div className="me-auto mt-auto flex items-baseline gap-2 *:cursor-pointer *:hover:underline">
                  {isOpen ? (
                    <button
                      onClick={() => setClosedNotes((state) => [...state, id])}
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setClosedNotes((state) =>
                          state.filter((noteId) => noteId !== id),
                        )
                      }
                    >
                      Open
                    </button>
                  )}
                  <button onClick={() => setEditNote(note)}>Edit</button>
                  <button
                    onClick={() =>
                      showConfirm(
                        'Delete note?',
                        `This will delete "${note.title}". Are you sure you want to continue?`,
                        async () => await deleteNote(note),
                      )
                    }
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
