"use client";

import { useNoteStore } from "@/lib/stores/noteStore";
import { AnimatePresence, motion } from "framer-motion";

export default function NoteViewer() {
  const notes = useNoteStore((state) => state.notes);
  const removeNote = useNoteStore((state) => state.removeNote);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
      <AnimatePresence mode="popLayout">
        {notes.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800 rounded-xl p-5 shadow flex flex-col gap-2"
          >
            <h2 className="font-bold text-xl">{n.title}</h2>
            <p className="whitespace-pre-wrap">{n.content}</p>
            <button
              onClick={() => removeNote(n.id)}
              className="mt-auto me-auto text-red-400 hover:underline text-sm cursor-pointer"
            >
              Delete
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
