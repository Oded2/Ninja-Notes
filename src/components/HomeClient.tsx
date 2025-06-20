"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditStore } from "@/lib/stores/editStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { authHandlers, notesCollection } from "@/lib/firebase";
import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { noteTypeGaurd } from "@/lib/typegaurds";
import { Note } from "@/lib/types";
import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";
import {
  ArrowsUpDownIcon,
  ChevronDoubleUpIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import VerifyEmail from "./VerifyEmail";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const first = useRef(false);
  const editNote = useEditStore((state) => state.note);
  const [notes, setNotes] = useState<Note[]>([]);
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const [email, setEmail] = useState<string | null>(null);
  const reverse = useRef(false);
  const [closedNotes, setClosedNotes] = useState<string[]>([]);
  // At least one of the notes are closed
  const notesOpen = useMemo(() => closedNotes.length > 0, [closedNotes]);

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      notesCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    console.log("Subscribed");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const snapshotNotes = snapshot.docs
        .map((doc) => ({
          ref: doc.ref,
          ...doc.data(),
        }))
        .filter((note) => noteTypeGaurd(note));
      setNotes(reverse.current ? snapshotNotes.toReversed() : snapshotNotes);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (first.current) setViewNotes(!editNote);
    else first.current = true;
  }, [editNote]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="mx-auto flex gap-5">
          <Image
            src="/logo.png"
            alt="Logo"
            width={1024}
            height={1024}
            className="mx-auto hidden size-24 max-h-full rounded-2xl sm:inline-block"
          />
          <div className="my-auto flex flex-col gap-2 text-center">
            <h1 className="text-6xl font-bold text-slate-950">
              <span className="text-red-500">Ninja</span> Notes
            </h1>
            <div className="mx-auto flex flex-col divide-y text-slate-950/80 *:py-1 sm:flex-row sm:divide-x sm:divide-y-0 *:sm:px-1 *:sm:py-0">
              <div>{email}</div>
              <div>
                <Link href="/account" className="hover:underline">
                  Account
                </Link>
              </div>
              <div>
                <button
                  onClick={authHandlers.signout}
                  className="cursor-pointer hover:underline"
                >
                  Sign out
                </button>
              </div>
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
              <div className="mb-4 flex gap-2 *:cursor-pointer *:transition-opacity *:hover:opacity-70 *:active:opacity-60">
                <button
                  onClick={() => {
                    setNotes((state) => state.toReversed());
                    reverse.current = !reverse.current;
                  }}
                >
                  <ArrowsUpDownIcon className="size-6" />
                </button>
                <motion.button
                  initial={false}
                  animate={{ rotate: notesOpen ? 180 : 0 }}
                  transition={{
                    type: "spring",
                    duration: 0.5,
                  }}
                  onClick={() => {
                    if (notesOpen) setClosedNotes([]);
                    else setClosedNotes(notes.map((note) => note.ref.id));
                  }}
                >
                  <ChevronDoubleUpIcon className="size-6" />
                </motion.button>
              </div>

              <NoteViewer
                notes={notes}
                closedNotes={closedNotes}
                setClosedNotes={setClosedNotes}
              />
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
      {!loading && !user?.emailVerified && (
        <>
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-slate-50 pointer-fine:hidden">
            <VerifyEmail />
          </div>
          <div className="fixed end-5 bottom-5 hidden items-center pointer-fine:flex">
            <ExclamationCircleIcon className="peer size-12 text-red-500" />
            <div className="pointer-events-none absolute end-full rounded-lg bg-gray-900 p-3 text-slate-50 opacity-0 transition-opacity peer-hover:pointer-events-auto peer-hover:opacity-100 hover:pointer-events-auto hover:opacity-100">
              <VerifyEmail />
            </div>
          </div>
        </>
      )}
    </>
  );
}
