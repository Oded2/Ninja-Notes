"use client";

import { useEditNoteStore, useNoteStore } from "@/lib/stores/noteStore";
import { AnimatePresence, motion } from "framer-motion";
import { div } from "framer-motion/client";

export default function NoteViewer() {
  const notes = useNoteStore((state) => state.notes);
  const setEditNote = useEditNoteStore((state) => state.update);
  const removeNote = useNoteStore((state) => state.removeNote);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
      <AnimatePresence mode="popLayout">
        {notes.length > 0 ? (
          notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-200/60 shadow-lg rounded-xl p-5 flex flex-col gap-2"
            >
              <h2 className="font-bold text-xl">{note.title || "Untitled"}</h2>
              <p className="whitespace-pre-wrap line-clamp-10">
                {note.content || "No content"}
              </p>
              <div className="flex gap-2 mt-auto items-baseline *:hover:underline *:cursor-pointer">
                <button onClick={() => setEditNote(note)}>Edit</button>
                <button
                  onClick={() => removeNote(note.id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div>No notes</div>
        )}
      </AnimatePresence>
    </div>
  );
}
