import { useEditStore } from "@/lib/stores/editStore";
import { List, Note } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import Collapse from "./Collapse";
import {
  decryptWithKey,
  deleteByQuery,
  formatTimestamp,
  handleError,
} from "@/lib/helpers";
import CopyButton from "./CopyButton";
import { useConfirmStore } from "@/lib/stores/confirmStore";
import { defaultListName } from "@/lib/constants";
import InlineDivider from "./InlineDivider";
import { deleteDoc, doc, getDoc, query, where } from "firebase/firestore";
import { listsCollection, notesCollection } from "@/lib/firebase";
import { useNotesStore } from "@/lib/stores/notesStore";
import {
  ArrowsUpDownIcon,
  ChevronDoubleDownIcon,
} from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import ListSelect from "./ListSelect";
import IconButton from "./IconButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useToastStore } from "@/lib/stores/toastStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useListsStore } from "@/lib/stores/listsStore";

type Props = {
  userKey: CryptoKey;
};

export default function NoteViewer({ userKey }: Props) {
  const user = useUserStore((state) => state.user);
  const setEditNote = useEditStore((state) => state.update);
  const showConfirm = useConfirmStore((state) => state.showConfirm);
  const notes = useNotesStore((state) => state.notes);
  const purgeNotes = useNotesStore((state) => state.purge);
  const reverseNotes = useNotesStore((state) => state.reverse);
  const removeNote = useNotesStore((state) => state.remove);
  const lists = useListsStore((state) => state.lists);
  const removeList = useListsStore((state) => state.remove);
  const [closedNotes, setClosedNotes] = useState<string[]>([]);
  const addToast = useToastStore((state) => state.add);
  // Undefined implies all lists
  const [listFilter, setListFilter] = useState<List | undefined>(undefined);
  // At least one of the notes are closed
  const notesOpen = useMemo(() => closedNotes.length > 0, [closedNotes]);
  const filteredNotes = useMemo(
    () =>
      listFilter
        ? notes.filter((note) => note.listId === listFilter.id)
        : notes,
    [notes, listFilter],
  );

  const deleteNote = async (note: Note) => {
    const { id, listId } = note;
    const isLastInList = notes.every(
      (noteItem) => noteItem.id === id || noteItem.listId !== listId,
    );
    const promises: Promise<void>[] = [];
    const docRef = doc(notesCollection, id);
    promises.push(deleteDoc(docRef));
    if (isLastInList) {
      console.log("Last in list");
      // The note was the last one in its list
      // Since the list is now empty, it needs to be deleted
      // The list should only be deleted if it's not the default list
      const listRef = doc(listsCollection, listId);
      const listDocSnap = await getDoc(listRef);
      const encryptedName = listDocSnap.get("name");
      if (typeof encryptedName !== "string") {
        alert("Invalid list name");
        return;
      }
      const notDefaultList = await decryptWithKey(encryptedName, userKey).then(
        (decryptedName) => decryptedName !== defaultListName,
      );
      if (notDefaultList) {
        console.log("Deleting list");
        promises.push(deleteDoc(listRef));
        setListFilter(undefined);
      }
    }
    try {
      await Promise.all(promises);
    } catch (err) {
      handleError(err);
    }
    removeNote(id);
    addToast("success", "Note removed", undefined, 2000);
  };

  const deleteList = async (list: List) => {
    const { id, name } = list;
    const promises: Promise<void>[] = [];
    const q = query(
      notesCollection,
      where("userId", "==", user?.uid),
      where("listId", "==", id),
    );
    // Delete every note in that list
    promises.push(deleteByQuery(q));
    if (name !== defaultListName) {
      // User isn't deleting the default collection
      // Delete the list
      const docRef = doc(listsCollection, id);
      promises.push(deleteDoc(docRef));
      // Set the collection filter back to all
      setListFilter(undefined);
      removeList(id);
    }
    try {
      await Promise.all(promises);
    } catch (err) {
      handleError(err);
    }
    purgeNotes(id);
    addToast(
      "success",
      "Collection delete",
      name === defaultListName
        ? "The default collection has been successfully deleted"
        : `Collection '${name}' has been successfully deleted`,
    );
  };

  return (
    <>
      <div className="mb-4 flex gap-2 *:flex *:gap-2">
        <div className="*:cursor-pointer *:transition-opacity *:hover:opacity-70 *:active:opacity-60">
          <button
            onClick={() => {
              reverseNotes();
            }}
          >
            <ArrowsUpDownIcon className="size-6" />
          </button>
          <motion.button
            initial={false}
            animate={{ rotate: notesOpen ? 180 : 0 }}
            transition={{
              type: "spring",
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
        <div className="max-w-sm grow">
          <ListSelect allowAll val={listFilter} setVal={setListFilter} />
        </div>
        {listFilter && (
          <div>
            <IconButton
              onClick={() => {
                const { name } = listFilter;
                const isDefaultList = name === defaultListName;
                showConfirm(
                  "Delete collection?",
                  isDefaultList
                    ? "All notes under the default collection will be deleted."
                    : `All notes under the collection '${name}' will be deleted.`,
                  async () => await deleteList(listFilter),
                  isDefaultList ? "Default collection" : name,
                );
              }}
            >
              <TrashIcon />
            </IconButton>
          </div>
        )}
      </div>
      <div className="flex flex-col rounded-lg border border-slate-950/20">
        <AnimatePresence>
          {filteredNotes.map((note) => {
            const { id, listId, title, content } = note;
            const isOpen = !closedNotes.includes(id);
            const { editedAt } = note;
            const listName = lists.find((list) => list.id === listId)?.name;
            return (
              <motion.div
                key={id}
                layout
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col gap-2 border-slate-950/20 px-5 py-4 not-last:border-b"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold">{title || "Untitled"}</h2>
                    <div className="text-sm text-slate-950/80">
                      <InlineDivider>
                        <div>{formatTimestamp(note.createdAt)}</div>
                        {editedAt && (
                          <div>{`Edited: ${formatTimestamp(editedAt)}`}</div>
                        )}
                        {listName && (
                          <div>
                            {listName === defaultListName
                              ? "Default collection"
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
                  <p className="whitespace-pre-wrap">{content}</p>
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
                        "Delete note?",
                        `This will delete "${note.title || "Untitled"}". Are you sure you want to continue?`,
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
