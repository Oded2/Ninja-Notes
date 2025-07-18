'use client';

import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFoundClient() {
  return (
    <div className="mx-auto flex w-full max-w-md grow flex-col justify-center text-center">
      <h1 className="mb-4 text-6xl font-extrabold">404</h1>
      <h2 className="mb-2 text-2xl font-semibold">Even ninjas get lost!</h2>
      <p className="text-base-100-content/30 mb-6">Not found</p>
      <Link href="/" className="overflow-hidden rounded-xl">
        <Button style="primary" fullWidth>
          Go back
        </Button>
      </Link>
    </div>
  );
}
