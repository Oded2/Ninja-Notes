"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditNoteStore } from "@/lib/stores/noteStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const editNote = useEditNoteStore((state) => state.note);

  useEffect(() => {
    setViewNotes(!editNote);
  }, [editNote]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex mt-10 mx-auto gap-5">
        <Image
          src="/logo.png"
          alt="Logo"
          width={1024}
          height={1024}
          className="max-h-full size-24 rounded-2xl"
        />
        <div className="flex flex-col gap-2 text-center my-auto">
          <h1 className="font-bold text-6xl text-slate-950">
            <span className="text-red-500">Ninja</span> Notes
          </h1>
          <p className="text-slate-950/80">Browser only secure notes</p>
        </div>
      </div>
      <div className="flex justify-center gap-4 border-b-2 pb-10 mt-5 border-slate-200/50">
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
