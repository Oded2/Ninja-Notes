'use client';

import { defaultListLabel, defaultListName } from '@/lib/constants';
import { listsCollection, notesCollection } from '@/lib/firebase';
import { addId, decryptParams, decryptString } from '@/lib/helpers';
import { useUserStore } from '@/lib/stores/userStore';
import { listTypeGuard, noteTypeGuard } from '@/lib/typeguards';
import { List, Note } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import InlineDivider from '../InlineDivider';
import Button from '../Button';
import IconText from '../IconText';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ViewerClient() {
  const { noteId } = useParams();
  const userKey = useUserStore((state) => state.key);
  const [note, setNote] = useState<Note | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const listName = useMemo(() => list?.name, [list]);
  const editedAt = useMemo(() => note?.editedAt, [note]);

  const handlePDF = async () => {
    // PDF will always be in light mode
    const html = pdfRef.current?.outerHTML;
    if (!html) return;
    setInProgress(true);
    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: html,
      headers: { 'Content-Type': 'text/html' },
    });
    console.log(res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note?.title || 'Untitled'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setInProgress(false);
  };

  useEffect(() => {
    if (typeof noteId !== 'string' || !userKey) return;
    console.log('Fetching note');
    fetchNoteAndList(noteId, userKey).then((data) => {
      if (!data) {
        console.error('Error fetching data');
        return;
      }
      setNote(data.note);
      setList(data.list);
    });
  }, [noteId, userKey]);

  return (
    <>
      {/* Important to include text-base-content so it will print correctly */}
      <div
        ref={pdfRef}
        className="text-base-content font-default mx-auto flex max-w-4xl flex-col"
      >
        <h1 className="text-center text-2xl font-bold">{note?.title}</h1>
        <div className="mx-auto">
          <InlineDivider>
            <SmallHeader>{formatTimestamp(note?.createdAt)}</SmallHeader>
            {editedAt && (
              <SmallHeader>{`Modified: ${formatTimestamp(editedAt)}`}</SmallHeader>
            )}
            {listName && <SmallHeader>{handleListName(listName)}</SmallHeader>}
          </InlineDivider>
        </div>
        <p className="mt-4 whitespace-pre-wrap">{note?.content}</p>
      </div>
      <div className="fixed right-5 bottom-5">
        <Button style="secondary" onClick={handlePDF} disabled={inProgress}>
          <IconText text="Save as PDF">
            <ArrowDownTrayIcon />
          </IconText>
        </Button>
      </div>
    </>
  );
}

type SmallHeaderProps = {
  children: React.ReactNode;
};

function SmallHeader({ children }: SmallHeaderProps) {
  return (
    <span className="text-base-content/80 text-center text-sm">{children}</span>
  );
}

const formatTimestamp = (timestamp?: Timestamp) =>
  timestamp?.toDate().toLocaleString(undefined, {
    minute: 'numeric',
    hour: 'numeric',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

async function fetchNoteAndList(
  noteId: string,
  key: CryptoKey,
): Promise<{ note: Note; list: List } | null> {
  const noteDocRef = doc(notesCollection, noteId);
  const note = await getDoc(noteDocRef)
    .then(addId)
    .then((encryptedNote) =>
      decryptParams<Note>(
        key,
        decryptString,
        encryptedNote,
        'title',
        'content',
        'listId',
      ),
    );
  if (!noteTypeGuard(note)) return null;
  const listRef = doc(listsCollection, note.listId);
  const list = await getDoc(listRef)
    .then(addId)
    .then((encryptedList) =>
      decryptParams<List>(key, decryptString, encryptedList, 'name'),
    );
  if (!listTypeGuard(list)) return null;
  return {
    note,
    list,
  };
}

function handleListName(listName: string) {
  return listName === defaultListName ? defaultListLabel : listName;
}
