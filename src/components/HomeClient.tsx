"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditStore } from "@/lib/stores/editStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { authHandlers, listsCollection, notesCollection } from "@/lib/firebase";
import { getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { listTypeGuard, noteTypeGuard } from "@/lib/typeguards";
import { List } from "@/lib/types";
import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import VerifyEmail from "./VerifyEmail";
import { decryptWithKey } from "@/lib/helpers";
import { loadUserKey } from "@/lib/indexDB";
import InlineDivider from "./InlineDivider";
import { useNotesStore } from "@/lib/stores/notesStore";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const first = useRef(false);
  const editNote = useEditStore((state) => state.note);
  const addNote = useNotesStore((state) => state.add);
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const [email, setEmail] = useState<string | null>(null);
  const [userKey, setUserKey] = useState<CryptoKey | null>(null);
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    loadUserKey().then(setUserKey);
  }, []);

  useEffect(() => {
    if (!user || !userKey) return;
    console.log("Subscribed");
    const { uid } = user;

    const notesQuery = query(
      notesCollection,
      where("userId", "==", uid),
      orderBy("createdAt"),
    );
    const listsQuery = query(listsCollection, where("userId", "==", uid));

    const notesPromise = getDocs(notesQuery)
      .then((snapshot) =>
        snapshot.docs
          .map((doc) => ({
            id: doc.ref.id,
            ...doc.data(),
          }))
          .filter((note) => noteTypeGuard(note))
          .map(async (note) => ({
            ...note,
            title: await decryptWithKey(note.title, userKey),
            content: await decryptWithKey(note.content, userKey),
          })),
      )
      .then((decryptedNotesPromise) => Promise.all(decryptedNotesPromise));
    notesPromise.then((notes) => notes.forEach((note) => addNote(note)));

    const unsubscribeLists = onSnapshot(listsQuery, async (snapshot) => {
      const encryptedLists = snapshot.docs
        .map((doc) => ({
          id: doc.ref.id,
          ...doc.data(),
        }))
        .filter((list) => listTypeGuard(list));
      const decryptedLists: List[] = await Promise.all(
        encryptedLists.map(async (list) => ({
          ...list,
          name: await decryptWithKey(list.name, userKey),
        })),
      );
      setLists(decryptedLists);
    });
    return unsubscribeLists;
  }, [user, userKey, addNote]);

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
        {userKey && (
          <AnimatePresence initial={false} mode="wait">
            {viewNotes ? (
              <motion.div
                key="noteViewer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                <NoteViewer lists={lists} userKey={userKey} />
              </motion.div>
            ) : (
              <motion.div
                key="addNote"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                <AddNote userKey={userKey} lists={lists} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
