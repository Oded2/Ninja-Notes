"use client";

import { useEditNoteStore, useNoteStore } from "@/lib/stores/noteStore";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function NoteViewer() {
  const notes = useNoteStore((state) => state.notes);
  const setEditNote = useEditNoteStore((state) => state.update);
  const removeNote = useNoteStore((state) => state.removeNote);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
      <AnimatePresence mode="popLayout">
        {notes.length > 0 ? (
          notes.map((note) => {
            const isExpanded = expandedNotes.includes(note.id);
            return (
              <motion.div
                key={note.id}
                layout
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "bg-slate-200/60",
                  "shadow-lg",
                  "rounded-xl",
                  "p-5",
                  "flex",
                  "flex-col",
                  "gap-2",
                  "col-auto",
                  {
                    "col-span-full": isExpanded,
                  }
                )}
              >
                <h2 className="font-bold text-xl">
                  {note.title || "Untitled"}
                </h2>
                <p
                  className={clsx("whitespace-pre-wrap", {
                    "line-clamp-10": !isExpanded,
                  })}
                >
                  {note.content || "No content"}
                </p>
                <div className="flex gap-2 mt-auto items-baseline *:hover:underline *:cursor-pointer">
                  {isExpanded ? (
                    <button
                      onClick={() =>
                        setExpandedNotes(
                          expandedNotes.filter((noteId) => noteId !== note.id)
                        )
                      }
                    >
                      Minimize
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setExpandedNotes([...expandedNotes, note.id])
                      }
                    >
                      Expand
                    </button>
                  )}
                  <button onClick={() => setEditNote(note)}>Edit</button>
                  <button
                    onClick={() => removeNote(note.id)}
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
