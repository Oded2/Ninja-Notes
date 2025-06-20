"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditStore } from "@/lib/stores/editStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { authHandlers, notesCollection } from "@/lib/firebase";
import { onSnapshot } from "firebase/firestore";
import { noteTypeGaurd } from "@/lib/typegaurds";
import { Note } from "@/lib/types";
import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const first = useRef(false);
  const editNote = useEditStore((state) => state.note);
  const [notes, setNotes] = useState<Note[]>([]);
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      console.log("Subscribed");
      const snapshotNotes = snapshot.docs
        .map((doc) => ({
          ref: doc.ref,
          ...doc.data(),
        }))
        .filter((note) => noteTypeGaurd(note));
      setNotes(snapshotNotes);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (first.current) setViewNotes(!editNote);
    else first.current = true;
  }, [editNote]);

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto flex gap-5">
        <Image
          src="/logo.png"
          alt="Logo"
          width={1024}
          height={1024}
          className="size-24 max-h-full rounded-2xl"
        />
        <div className="my-auto flex flex-col gap-2 text-center">
          <h1 className="text-6xl font-bold text-slate-950">
            <span className="text-red-500">Ninja</span> Notes
          </h1>
          <div className="mx-auto flex gap-1 text-slate-950/80">
            <span>{email}</span>
            <span className="after:content-['|']" />
            <Link href="/account" className="hover:underline">
              Account
            </Link>
            <span className="after:content-['|']" />
            <button
              onClick={authHandlers.signout}
              className="cursor-pointer hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-4 border-b-2 border-slate-200/50 pb-10">
        <Button
          onClick={() => setViewNotes(false)}
          label="Add Note"
          isPrimary
        />
        <Button onClick={() => setViewNotes(true)} label="View Notes" />
      </div>
      <AnimatePresence initial={false} mode="wait">
        {viewNotes ? (
          <motion.div
            key="noteViewer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
          >
            <NoteViewer notes={notes} />
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
