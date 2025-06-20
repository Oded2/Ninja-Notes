"use client";

import { useEditStore } from "@/lib/stores/editStore";
import { Note } from "@/lib/types";
import clsx from "clsx";
import { deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Props = {
  notes: Note[];
};

export default function NoteViewer({ notes }: Props) {
  const setEditNote = useEditStore((state) => state.update);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {notes.length > 0 ? (
          notes.map((note) => {
            const isExpanded = expandedNotes.includes(note.ref.id);
            return (
              <motion.div
                key={note.ref.id}
                layout
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "flex flex-col gap-2 rounded-xl bg-slate-200/60 p-5 shadow-lg",
                  {
                    "col-span-full": isExpanded,
                  },
                )}
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
                      month: "numeric",
                    })}
                  </span>
                </div>
                <p
                  className={clsx("whitespace-pre-wrap", {
                    "line-clamp-10": !isExpanded,
                  })}
                >
                  {note.content || "No content"}
                </p>
                <div className="mt-auto flex items-baseline gap-2 *:cursor-pointer *:hover:underline">
                  {isExpanded ? (
                    <button
                      onClick={() =>
                        setExpandedNotes(
                          expandedNotes.filter(
                            (noteId) => noteId !== note.ref.id,
                          ),
                        )
                      }
                    >
                      Minimize
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setExpandedNotes([...expandedNotes, note.ref.id])
                      }
                    >
                      Expand
                    </button>
                  )}
                  <button onClick={() => setEditNote(note)}>Edit</button>
                  <button
                    onClick={() => deleteDoc(note.ref)}
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
