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
        <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-800 to-slate-900 text-slate-50">
          <div className="container mx-auto py-10 flex flex-col grow">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
