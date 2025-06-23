"use client";

import "./globals.css";
import { useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";
import { Rubik } from "next/font/google";
import Toasts from "@/components/Toasts";
import ConfirmModal from "@/components/ConfirmModal";
import InputModal from "@/components/InputModal";

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
  const setUser = useUserStore((state) => state.setUser);

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
