"use client";

import "./globals.css";
import { useEffect } from "react";
import { Note, useNoteStore } from "@/lib/stores/noteStore";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const add = useNoteStore((state) => state.addNote);
  useEffect(() => {
    const localStorageNotes = localStorage.getItem("notes");
    if (localStorageNotes) {
      const notes = JSON.parse(localStorageNotes) as Note[];
      notes.forEach((note) => add(note.title, note.content));
    }
  }, [add]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <div className="container mx-auto flex grow flex-col px-5 py-10 sm:px-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
