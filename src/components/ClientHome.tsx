"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditNoteStore } from "@/lib/stores/noteStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const editNote = useEditNoteStore((state) => state.note);

  useEffect(() => {
    setViewNotes(!editNote);
  }, [editNote]);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-r from-amber-500 to-amber-200  bg-clip-text flex mx-auto flex-col gap-1 text-center mt-10">
        <h1 className="font-bold text-6xl text-transparent">Ninja Notes</h1>
        <p>Browser only secure notes</p>
      </div>
      <div className="flex justify-center gap-4 border-b-2 pb-10 mt-5 border-orange-100/80">
        <Button
          onClick={() => setViewNotes(false)}
          label="Add Note"
          isPrimary
        />
        <Button onClick={() => setViewNotes(true)} label="View Notes" />
      </div>
      <AnimatePresence mode="wait">
        {viewNotes ? (
          <motion.div
            key="noteViewer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
          >
            <NoteViewer />
          </motion.div>
        ) : (
          <motion.div
            key="addNote"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
          >
            <AddNote label="Create new note" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
