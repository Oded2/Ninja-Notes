'use client';

import { useUserStore } from '@/lib/stores/userStore';
import Link from 'next/link';
import Button from './Button';

export default function NotFoundClient() {
  const user = useUserStore((state) => state.user);
  return (
    <div className="mx-auto flex w-full max-w-md grow flex-col justify-center text-center">
      <h1 className="mb-4 text-6xl font-extrabold">404</h1>
      <h2 className="mb-2 text-2xl font-semibold">Even ninjas get lost!</h2>
      <p className="mb-6 text-slate-950/30">Not found</p>
      <Link href={user ? '/' : '/auth'} className="overflow-hidden rounded-xl">
        <Button style="primary" label="Go back" fullWidth />
      </Link>
    </div>
  );
}
