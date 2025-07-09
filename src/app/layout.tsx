'use client';

import './globals.css';
import { useEffect } from 'react';
import {
  auth,
  authHandlers,
  listsCollection,
  notesCollection,
} from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { Rubik } from 'next/font/google';
import Toasts from '@/components/Toasts';
import ConfirmModal from '@/components/ConfirmModal';
import InputModal from '@/components/InputModal';
import { clearUserKey, loadUserKey } from '@/lib/indexDB';
import { orderBy, query, where } from 'firebase/firestore';
import { getTypedDecryptedDocs } from '@/lib/helpers';
import { listTypeGuard, noteTypeGuard } from '@/lib/typeguards';
import { useContentStore } from '@/lib/stores/contentStore';
import { HomeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import { repoUrl } from '@/lib/constants';

const geistSans = Rubik({
  subsets: ['latin'],
});

const protectedRoutes = ['/notes', '/account'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const loading = useUserStore((state) => state.loading);
  const setUser = useUserStore((state) => state.setUser);
  const listsLength = useContentStore((state) => state.lists.length);
  const addList = useContentStore((state) => state.addList);
  const purge = useContentStore((state) => state.purge);

  useEffect(() => {
    if (
      !user ||
      !userKey ||
      !protectedRoutes.includes(
        pathname,
      ) /* Only the protected routes need to fetch */ ||
      listsLength /* Lists were already fetched */
    )
      return;
    console.log('Fetching docs');
    const { uid } = user;
    // Fetch notes
    const notesQuery = query(
      notesCollection,
      where('userId', '==', uid),
      orderBy('createdAt'),
    );
    const notesPromise = getTypedDecryptedDocs(
      notesQuery,
      noteTypeGuard,
      userKey,
      'title',
      'content',
      'listId',
    );
    // Fetch lists
    const listsQuery = query(listsCollection, where('userId', '==', uid));
    const listsPromise = getTypedDecryptedDocs(
      listsQuery,
      listTypeGuard,
      userKey,
      'name',
    );
    Promise.all([notesPromise, listsPromise]).then(([notes, lists]) =>
      lists.forEach((list) =>
        addList(
          list,
          notes.filter((note) => note.listId === list.id),
        ),
      ),
    );
  }, [user, userKey, addList, pathname, listsLength]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      purge(true);
      clearUserKey().then(() => {
        if (protectedRoutes.includes(pathname)) {
          // User isn't logged in and is trying to access a protected page
          router.push('/auth');
        }
      });
    } else if (pathname === '/auth') {
      // User is trying to authenticate although he's already authenticated
      router.push('/notes');
    }
  }, [user, loading, purge, pathname, router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state change');
      setUser(user);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    loadUserKey();
  }, []);

  return (
    <html lang="en">
      <body className={geistSans.className}>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <Navbar />
          <div className="container mx-auto flex grow flex-col px-5 py-10 text-slate-950 sm:px-0">
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

function Navbar() {
  const user = useUserStore((state) => state.user);

  return (
    <nav className="flex w-full items-center justify-between px-8 py-3">
      <Link href="/">
        <HomeIcon className="size-6" />
      </Link>
      <div className="flex gap-2">
        <a href={repoUrl} className="cursor-pointer">
          <Image
            src="/github-logo.png"
            alt="Github logo"
            width={36}
            height={36}
          />
        </a>
        {user ? (
          <>
            <Button label="Account" small style="black" href="/account" />
            <Button
              label="Sign out"
              small
              style="primary"
              onClick={authHandlers.signout}
            />
          </>
        ) : (
          <>
            <Button label="Login" small style="black" href="/auth" />
            <Button
              label="Sign Up"
              small
              style="primary"
              href={{ pathname: '/auth', query: { display: 'signup' } }}
            />
          </>
        )}
      </div>
    </nav>
  );
}
