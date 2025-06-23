import { useEditStore } from "@/lib/stores/editStore";
import { Note, SetValShortcut } from "@/lib/types";
import { deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Collapse from "./Collapse";
import { handleError } from "@/lib/helpers";
import CopyButton from "./CopyButton";
import { useConfirmStore } from "@/lib/stores/confirmStore";
import { defaultCollection } from "@/lib/constants";
import InlineDivider from "./InlineDivider";

type Props = {
  notes: Note[];
  closedNotes: string[];
  setClosedNotes: SetValShortcut<string[]>;
};

export default function NoteViewer({
  notes,
  closedNotes,
  setClosedNotes,
}: Props) {
  const setEditNote = useEditStore((state) => state.update);
  const showConfirm = useConfirmStore((state) => state.showConfirm);

  return notes.length > 0 ? (
    <div className="flex flex-col rounded-lg border border-slate-950/20">
      <AnimatePresence mode="popLayout">
        {notes.map((note) => {
          const {
            ref: { id },
            collection,
            title,
            content,
          } = note;
          const isOpen = !closedNotes.includes(id);
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
                      <div>
                        {note.createdAt.toDate().toLocaleString(undefined, {
                          minute: "numeric",
                          hour: "numeric",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div>
                        {collection === defaultCollection
                          ? "Default collection"
                          : collection}
                      </div>
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
                      async () => deleteDoc(note.ref).catch(handleError),
                    )
                  }
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}{" "}
      </AnimatePresence>
    </div>
  ) : (
    <div>No notes</div>
  );
}
