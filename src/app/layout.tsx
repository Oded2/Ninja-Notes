"use client";

import "./globals.css";
import { useEffect, useRef } from "react";
// import { Note, useNoteStore } from "@/lib/stores/editStore";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const add = useNoteStore((state) => state.addNote);
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state change");
      setUser(user);
      if (user && pathnameRef.current === "/auth") routerRef.current.push("/");
      else if (!user && pathnameRef.current === "/")
        routerRef.current.push("/auth");
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <div className="container mx-auto flex grow flex-col px-5 pt-20 pb-10 sm:px-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
