import { useEditStore } from "@/lib/stores/editStore";
import { List, Note, SetValShortcut } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import Collapse from "./Collapse";
import { decryptWithKey, formatTimestamp, handleError } from "@/lib/helpers";
import CopyButton from "./CopyButton";
import { useConfirmStore } from "@/lib/stores/confirmStore";
import { defaultListName } from "@/lib/constants";
import InlineDivider from "./InlineDivider";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { listsCollection } from "@/lib/firebase";

type Props = {
  notes: Note[];
  closedNotes: string[];
  setClosedNotes: SetValShortcut<string[]>;
  lists: List[];
  userKey: CryptoKey;
  setListFilter: SetValShortcut<List | undefined>;
};

export default function NoteViewer({
  notes,
  closedNotes,
  setClosedNotes,
  lists,
  userKey,
  setListFilter,
}: Props) {
  const setEditNote = useEditStore((state) => state.update);
  const showConfirm = useConfirmStore((state) => state.showConfirm);

  const handleDelete = async (note: Note) => {
    const { ref, listId } = note;
    const isLastInList = notes.every(
      (noteItem) => noteItem.ref.id === ref.id || noteItem.listId !== listId,
    );
    await deleteDoc(ref).catch(handleError);
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
        await deleteDoc(listRef);
        setListFilter(undefined);
      }
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-950/20">
      <AnimatePresence>
        {notes.map((note) => {
          const {
            ref: { id },
            listId,
            title,
            content,
          } = note;
          const isOpen = !closedNotes.includes(id);
          const { editedAt } = note;
          const listName = lists.find((list) => list.ref.id === listId)?.name;
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
                      async () => await handleDelete(note),
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
  );
}
