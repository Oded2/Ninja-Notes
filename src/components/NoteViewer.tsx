"use client";

import { useEditStore } from "@/lib/stores/editStore";
import { Note } from "@/lib/types";
import { deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Props = {
  notes: Note[];
};

export default function NoteViewer({ notes }: Props) {
  const setEditNote = useEditStore((state) => state.update);
  const [closedNotes, setClosedNotes] = useState<string[]>([]);
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
    deleteDoc(note.ref);
  };

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-slate-950/20 py-5">
      <AnimatePresence mode="popLayout">
        {notes.length > 0 ? (
          notes.map((note) => {
            const isOpen = !closedNotes.includes(note.ref.id);
            return (
              <motion.div
                key={note.ref.id}
                layout
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2 border-slate-950/20 px-5 not-last:border-b not-last:pb-5"
              >
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
                {isOpen && (
                  <p className="whitespace-pre-wrap">
                    {note.content || "No content"}
                  </p>
                )}
                <div className="mt-auto flex items-baseline gap-2 *:cursor-pointer *:hover:underline">
                  {isOpen ? (
                    <button
                      onClick={() =>
                        setClosedNotes((state) => [...state, note.ref.id])
                      }
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setClosedNotes((state) =>
                          state.filter((noteId) => noteId !== note.ref.id),
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
              </motion.div>
            );
          })
        ) : (
          <div>No notes</div>
        )}
      </AnimatePresence>
    </div>
  );
}
