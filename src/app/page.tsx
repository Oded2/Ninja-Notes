"use client";

import AddNote from "@/components/AddNote";
import Button from "@/components/Button";
import NoteViewer from "@/components/NoteViewer";
import { useState } from "react";

export default function Home() {
  const [viewNotes, setViewNotes] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-r from-amber-500 to-amber-200  bg-clip-text flex mx-auto flex-col gap-1 text-center mt-10">
        <h1 className="font-bold text-6xl text-transparent">Ninja Notes</h1>
        <p>The correct way to take notes</p>
      </div>
      <div className="flex justify-center gap-4 border-b-2 pb-10 mt-5 border-orange-100/50">
        <Button
          onClick={() => setViewNotes(false)}
          label="Add Note"
          isPrimary
        />
        <Button onClick={() => setViewNotes(true)} label="View Notes" />
      </div>
      {viewNotes ? <NoteViewer /> : <AddNote label="Create new note" />}
    </div>
  );
}
