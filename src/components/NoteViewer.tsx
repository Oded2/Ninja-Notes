import { useEditStore } from "@/lib/stores/editStore";
import { Note } from "@/lib/types";
import { deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction, useMemo } from "react";
import Collapse from "./Collapse";
import { handleError } from "@/lib/helpers";
import CopyButton from "./CopyButton";

type Props = {
  notes: Note[];
  closedNotes: string[];
  setClosedNotes: Dispatch<SetStateAction<string[]>>;
};

export default function NoteViewer({
  notes,
  closedNotes,
  setClosedNotes,
}: Props) {
  const setEditNote = useEditStore((state) => state.update);
  const handleDelete = (note: Note) => {
    if (
      !confirm(
        `This will delete your note from ${note.createdAt
          .toDate()
          .toLocaleString(undefined, {
            day: "numeric",
            month: "numeric",
          })}. Are you sure you want to continue?`,
      )
    )
      return;
    deleteDoc(note.ref).catch(handleError);
  };

  return notes.length > 0 ? (
    notes.map((note) => {
      const {
        ref: { id },
      } = note;
      const isOpen = !closedNotes.includes(id);
      return (
        <div
          className="flex flex-col rounded-lg border border-slate-950/20"
          key={id}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="group flex flex-col gap-2 border-slate-950/20 px-5 py-5 not-last:border-b"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold">
                    {note.title || "Untitled"}
                  </h2>
                  <span className="text-sm text-slate-950/80">
                    {note.createdAt.toDate().toLocaleString(undefined, {
                      minute: "numeric",
                      hour: "numeric",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex opacity-0 transition-opacity duration-75 group-hover:opacity-100 pointer-coarse:opacity-100">
                  <CopyButton text={note.content ?? ""} />
                </div>
              </div>
              <Collapse open={isOpen}>
                <p className="whitespace-pre-wrap">
                  {note.content || "No content"}
                </p>
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
                  onClick={() => handleDelete(note)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            </motion.div>{" "}
          </AnimatePresence>
        </div>
      );
    })
  ) : (
    <div>No notes</div>
  );
}
