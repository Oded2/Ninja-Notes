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
import { decryptWithKey } from "@/lib/helpers";
import { loadUserKey } from "@/lib/indexDB";
import InlineDivider from "./InlineDivider";
import CollectionSelect from "./CollectionSelect";

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
  // Create a constant used in the AddNote component so that the user key only has to be fetched once
  const [userKeyComponent, setUserKeyComponent] = useState<CryptoKey | null>(
    null,
  );
  const [collectionFilter, setCollectionFilter] = useState("");
  const collections = useMemo(
    () => [...new Set(notes.map((note) => note.collection))],
    [notes],
  );

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    console.log("Subscribed");
    const userKeyPromise = loadUserKey();
    userKeyPromise.then(setUserKeyComponent);
    const q = query(
      notesCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userKey = await userKeyPromise;
      if (!userKey) return;
      const encryptedNotes = snapshot.docs
        .map((doc) => ({
          ref: doc.ref,
          ...doc.data(),
        }))
        .filter((note) => noteTypeGaurd(note));
      if (reverse.current) encryptedNotes.reverse();
      const decryptedNotes: Note[] = await Promise.all(
        encryptedNotes.map(async (note) => ({
          ...note,
          title: await decryptWithKey(note.title, userKey),
          content: await decryptWithKey(note.content, userKey),
          collection: await decryptWithKey(note.collection, userKey),
        })),
      );
      setNotes(decryptedNotes);
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
            className="mx-auto my-auto hidden size-24 max-h-full rounded-2xl sm:inline-block"
          />
          <div className="my-auto flex flex-col items-center gap-2 text-center">
            <h1 className="text-6xl font-bold text-slate-950">
              <span className="text-red-500">Ninja</span> Notes
            </h1>
            <InlineDivider>
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
            </InlineDivider>
          </div>
        </div>
        <div className="mt-5 flex justify-center gap-4 border-b-2 border-slate-200/50 pb-10">
          <Button
            onClick={() => setViewNotes(false)}
            label="Add Note"
            style="primary"
          />
          <Button
            onClick={() => setViewNotes(true)}
            style="secondary"
            label="View Notes"
          />
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
              {notes.length > 0 ? (
                <>
                  <div className="mb-4 flex gap-2">
                    <div className="flex gap-2 *:cursor-pointer *:transition-opacity *:hover:opacity-70 *:active:opacity-60">
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
                    <div className="max-w-sm grow">
                      <CollectionSelect
                        allowAll
                        collections={collections}
                        setVal={setCollectionFilter}
                      />
                    </div>
                  </div>
                  <NoteViewer
                    notes={
                      collectionFilter.length == 0
                        ? notes
                        : notes.filter(
                            (note) => note.collection === collectionFilter,
                          )
                    }
                    closedNotes={closedNotes}
                    setClosedNotes={setClosedNotes}
                  />
                </>
              ) : (
                <span>No notes</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="addNote"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
            >
              {userKeyComponent && (
                <AddNote userKey={userKeyComponent} notes={notes} />
              )}
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
