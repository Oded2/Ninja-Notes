'use client';

import AddNote from '@/components/AddNote';
import Button from '@/components/Button';
import NoteViewer from '@/components/NoteViewer';
import { useEditStore } from '@/lib/stores/editStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useUserStore } from '@/lib/stores/userStore';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import VerifyEmail from '@/components/VerifyEmail';
import InlineDivider from '@/components/InlineDivider';
import { useContentStore } from '@/lib/stores/contentStore';
import { censorEmail } from '@/lib/helpers';

export default function HomeClient() {
  const [viewNotes, setViewNotes] = useState(false);
  const first = useRef(false);
  const activeEditNote = useEditStore((state) => state.note);
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const notesLength = useContentStore((state) => state.notes.length);
  const listsLength = useContentStore((state) => state.lists.length);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Prevent the email from disappearing when signing out
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (first.current) setViewNotes(!activeEditNote);
    else first.current = true;
  }, [activeEditNote]);

  return (
    <>
      <div className="flex grow flex-col gap-5">
        <div className="mx-auto flex gap-5">
          <Image
            src="/apple-icon.png"
            alt="Logo"
            width={96}
            height={96}
            className="ring-base-100-content mx-auto my-auto hidden max-h-full rounded-2xl sm:inline-block dark:ring-2"
          />
          <div className="my-auto flex flex-col items-center gap-2 text-center">
            <h1 className="text-6xl font-bold">
              <span className="text-primary">Ninja</span> Notes
            </h1>
            <InlineDivider>
              {email && <div>{censorEmail(email)}</div>}
              <div>
                {`${notesLength.toLocaleString()} ${notesLength == 1 ? 'Note' : 'Notes'}`}
              </div>
              <div>
                {`${listsLength.toLocaleString()} ${listsLength == 1 ? 'Collection' : 'Collections'}`}
              </div>
            </InlineDivider>
          </div>
        </div>
        <div className="border-base-200 mt-5 flex justify-center gap-4 border-b-2 pb-10">
          <Button onClick={() => setViewNotes(false)} style="primary">
            Add Note
          </Button>
          <Button onClick={() => setViewNotes(true)} style="secondary">
            View Notes
          </Button>
        </div>
        {listsLength ? (
          <AnimatePresence initial={false} mode="wait">
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
                className="flex grow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                <AddNote />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <Spinner />
        )}
      </div>
      {!loading && !user?.emailVerified && (
        <>
          <div className="text-base-100-content bg-base-200 fixed bottom-2 left-1/2 -translate-x-1/2 rounded-lg p-3 pointer-fine:hidden">
            <VerifyEmail />
          </div>
          <div className="fixed end-5 bottom-5 hidden items-center pointer-fine:flex">
            <ExclamationCircleIcon className="peer text-primary size-12" />
            <div className="bg-base-100-content text-base-100 pointer-events-none absolute end-full rounded-lg p-3 opacity-0 transition-opacity peer-hover:pointer-events-auto peer-hover:opacity-100 hover:pointer-events-auto hover:opacity-100">
              <VerifyEmail />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Spinner() {
  return (
    <div className="mx-auto size-8 animate-spin rounded-full border-3 border-t-transparent" />
  );
}
