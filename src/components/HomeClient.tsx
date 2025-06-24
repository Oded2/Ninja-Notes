"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useEditStore } from "@/lib/stores/editStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { authHandlers, listsCollection, notesCollection } from "@/lib/firebase";
import {
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { listTypeGuard, noteTypeGuard } from "@/lib/typeguards";
import { List, Note } from "@/lib/types";
import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";
import {
  ArrowsUpDownIcon,
  ChevronDoubleUpIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import VerifyEmail from "./VerifyEmail";
import { decryptWithKey, deleteByQuery, handleError } from "@/lib/helpers";
import { loadUserKey } from "@/lib/indexDB";
import InlineDivider from "./InlineDivider";
import ListSelect from "./ListSelect";
import IconButton from "./IconButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useToastStore } from "@/lib/stores/toastStore";
import { useConfirmStore } from "@/lib/stores/confirmStore";
import { defaultListName } from "@/lib/constants";

export default function ClientHome() {
  const [viewNotes, setViewNotes] = useState(false);
  const addToast = useToastStore((state) => state.add);
  const showConfirm = useConfirmStore((state) => state.showConfirm);
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
  // An undefined implies all lists
  const [listFilter, setListFilter] = useState<List | undefined>(undefined);
  const [lists, setLists] = useState<List[]>([]);
  const filteredNotes = useMemo(
    () =>
      listFilter
        ? notes.filter((note) => note.listId === listFilter.ref.id)
        : notes,
    [notes, listFilter],
  );

  const deleteCollection = async (list: List) => {
    if (!userKeyComponent) {
      // Keep alert
      alert("User encryption key not found");
      return;
    }
    const q = query(
      notesCollection,
      where("userId", "==", user?.uid),
      where("listId", "==", list.ref.id),
    );
    await deleteByQuery(q).catch(handleError);
    if (list.name !== defaultListName) {
      // User isn't deleting the default collection
      // Delete the list
      await deleteDoc(list.ref).catch(handleError);
      // Set the collection filter back to all
      setListFilter(undefined);
    }
    const { name } = list;
    addToast(
      "success",
      "Collection delete",
      name === defaultListName
        ? "The default collection has been successfully deleted"
        : `Collection '${name}' has been successfully deleted`,
    );
  };

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    console.log("Subscribed");
    const { uid } = user;
    const userKeyPromise = loadUserKey();
    userKeyPromise.then(setUserKeyComponent);

    const notesQuery = query(
      notesCollection,
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
    );
    const listsQuery = query(listsCollection, where("userId", "==", uid));

    const unsubscribeNotes = onSnapshot(notesQuery, async (snapshot) => {
      const userKey = await userKeyPromise;
      if (!userKey) return;
      const encryptedNotes = snapshot.docs
        .map((doc) => ({
          ref: doc.ref,
          ...doc.data(),
        }))
        .filter((note) => noteTypeGuard(note));
      if (reverse.current) encryptedNotes.reverse();
      const decryptedNotes: Note[] = await Promise.all(
        encryptedNotes.map(async (note) => ({
          ...note,
          title: await decryptWithKey(note.title, userKey),
          content: await decryptWithKey(note.content, userKey),
        })),
      );
      setNotes(decryptedNotes);
    });

    const unsubscribeLists = onSnapshot(listsQuery, async (snapshot) => {
      const userKey = await userKeyPromise;
      if (!userKey) return;
      const encryptedLists = snapshot.docs
        .map((doc) => ({
          ref: doc.ref,
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
    return () => {
      unsubscribeNotes();
      unsubscribeLists();
    };
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
        {userKeyComponent && (
          <AnimatePresence initial={false} mode="wait">
            {viewNotes ? (
              <motion.div
                key="noteViewer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                <div className="mb-4 flex gap-2 *:flex *:gap-2">
                  <div className="*:cursor-pointer *:transition-opacity *:hover:opacity-70 *:active:opacity-60">
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
                    <ListSelect
                      allowAll
                      lists={lists}
                      val={listFilter}
                      setVal={setListFilter}
                    />
                  </div>
                  {listFilter && (
                    <div>
                      <IconButton
                        onClick={() => {
                          const { name } = listFilter;
                          const isDefaultList = name === defaultListName;
                          showConfirm(
                            "Delete collection?",
                            isDefaultList
                              ? "All notes under the default collection will be deleted."
                              : `All notes under the collection '${name}' will be deleted.`,
                            async () => await deleteCollection(listFilter),
                            isDefaultList ? "Default collection" : name,
                          );
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  )}
                </div>
                {filteredNotes.length > 0 ? (
                  <NoteViewer
                    notes={filteredNotes}
                    closedNotes={closedNotes}
                    setClosedNotes={setClosedNotes}
                    lists={lists}
                    userKey={userKeyComponent}
                    setListFilter={setListFilter}
                  />
                ) : (
                  <div>No notes</div>
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
                <AddNote userKey={userKeyComponent} lists={lists} />
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
