'use client';

import './globals.css';
import { useEffect, useState } from 'react';
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
import { getDocs, orderBy, Query, query, where } from 'firebase/firestore';
import { addId, decryptParams, decryptString } from '@/lib/helpers';
import { listTypeGuard, noteTypeGuard } from '@/lib/typeguards';
import { useContentStore } from '@/lib/stores/contentStore';
import { HomeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import { repoUrl } from '@/lib/constants';
import { Cog6ToothIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import IconText from '@/components/IconText';

const rubik = Rubik({
  subsets: ['latin'],
});

const protectedRoutes = ['/notes', '/settings'];

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
  const [isDark, setIsDark] = useState(true);

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
      if (protectedRoutes.includes(pathname)) {
        // User isn't logged in and is trying to access a protected page
        router.push('/auth');
      }
    } else if (pathname === '/auth') {
      // User is trying to authenticate although he's already authenticated
      router.push('/notes');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state change');
      setUser(user);
      if (!user) {
        purge(true);
        clearUserKey();
      }
    });
    return unsubscribe;
  }, [setUser, purge]);

  useEffect(() => {
    const isDarkTheme = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkTheme);
    loadUserKey();
  }, []);

  useEffect(() => {
    if (isDark) localStorage.setItem('theme', 'dark');
    else localStorage.removeItem('theme');
  }, [isDark]);

  return (
    <html
      lang="en"
      data-theme={isDark ? 'dark' : undefined}
      className="not-print:dark:scheme-dark"
    >
      <body className={rubik.className}>
        <div className="bg-base text-base-content flex min-h-screen flex-col">
          <Navbar onThemeToggle={() => setIsDark((prev) => !prev)} />
          <div className="container mx-auto flex grow flex-col px-5 py-10 sm:px-0">
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

type NavbarProps = {
  onThemeToggle: () => void;
};

function Navbar({ onThemeToggle }: NavbarProps) {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);

  return (
    <nav className="flex items-center justify-between px-8 py-3 print:hidden">
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
        <Button small style="secondary" onClick={onThemeToggle}>
          <IconText responsive text="Toggle Theme">
            <LightBulbIcon />
          </IconText>
        </Button>
        {!loading &&
          (user ? (
            <>
              <Button small style="black" href="/settings">
                <IconText responsive text="Settings">
                  <Cog6ToothIcon />
                </IconText>
              </Button>
              <Button small style="primary" onClick={authHandlers.signout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button small style="black" href="/auth">
                Login
              </Button>
              <Button
                small
                style="primary"
                href={{ pathname: '/auth', query: { display: 'signup' } }}
              >
                Sign Up
              </Button>
            </>
          ))}
      </div>
    </nav>
  );
}

const getTypedDecryptedDocs = async <T extends Record<string, unknown>>(
  q: Query,
  typeguard: (obj: unknown) => obj is T,
  key: CryptoKey,
  ...encryptedParams: Extract<keyof T, string>[]
) => {
  const snapshot = await getDocs(q);
  const decryptedDocs = snapshot.docs.map((d) => {
    const encryptedData = addId(d);
    return decryptParams(key, decryptString, encryptedData, ...encryptedParams);
  });
  return Promise.all(decryptedDocs).then((docs) => docs.filter(typeguard));
};
