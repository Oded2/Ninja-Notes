"use client";

import "./globals.css";
import { useEffect, useRef } from "react";
import { auth, listsCollection, notesCollection } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";
import { Rubik } from "next/font/google";
import Toasts from "@/components/Toasts";
import ConfirmModal from "@/components/ConfirmModal";
import InputModal from "@/components/InputModal";
import { loadUserKey } from "@/lib/indexDB";
import { orderBy, query, where } from "firebase/firestore";
import { decryptValues, getTypedDocs } from "@/lib/helpers";
import { listTypeGuard, noteTypeGuard } from "@/lib/typeguards";
import { useNotesStore } from "@/lib/stores/notesStore";
import { useListsStore } from "@/lib/stores/listsStore";

const geistSans = Rubik({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const setUser = useUserStore((state) => state.setUser);
  const setUserKey = useUserStore((state) => state.setKey);
  const addNote = useNotesStore((state) => state.add);
  const addList = useListsStore((state) => state.add);

  useEffect(() => {
    if (!user || !userKey) return;
    console.log("Fetching docs");

    const { uid } = user;
    // Fetch notes
    const notesQuery = query(
      notesCollection,
      where("userId", "==", uid),
      orderBy("createdAt"),
    );
    const notesPromise = getTypedDocs(notesQuery, noteTypeGuard).then(
      (encryptedNotes) =>
        decryptValues(userKey, encryptedNotes, "title", "content"),
    );
    notesPromise.then((notes) => notes.forEach((note) => addNote(note)));
    // Fetch lists
    const listsQuery = query(listsCollection, where("userId", "==", uid));
    const listsPromise = getTypedDocs(listsQuery, listTypeGuard).then(
      (encryptedLists) => decryptValues(userKey, encryptedLists, "name"),
    );
    listsPromise.then((lists) => lists.forEach((list) => addList(list)));
  }, [user, userKey, addNote, addList]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state change");
      setUser(user);
      if (!user && pathnameRef.current !== "/auth") {
        // User isn't logged in and is trying to access a page that's not auth
        routerRef.current.push("/auth");
      }
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    loadUserKey().then((key) => setUserKey(key));
  }, [setUserKey]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  return (
    <html lang="en">
      <body className={geistSans.className}>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <div className="container mx-auto flex grow flex-col px-5 py-20 text-slate-950 sm:px-0">
            {children}
          </div>
        </div>
        <Toasts />
        <ConfirmModal />
        <InputModal />
      </body>
    </html>
  );
}
