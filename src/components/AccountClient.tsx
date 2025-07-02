'use client';

import { useState } from 'react';
import AccountSettings from './AccountSetttings';
import AccountVerification from './AccountVerification';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';

export default function AccountClient() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl gap-10 rounded-2xl bg-white py-10 shadow-lg lg:my-auto lg:px-10">
      <div className="hidden py-5 lg:inline-block">
        <Image
          src="/logo.png"
          alt="Logo"
          height={368}
          width={368}
          className="my-auto rounded-2xl"
          priority
        />
      </div>
      <div className="grow p-5">
        <h2 className="mb-4 text-center text-3xl font-bold text-slate-950/90">
          Account Settings
        </h2>
        {verified ? (
          <AccountSettings />
        ) : (
          <AccountVerification onVerify={() => setVerified(true)} />
        )}
      </div>
      <Link
        href="/"
        className="absolute top-2 left-2 opacity-90 transition-opacity hover:opacity-70"
      >
        <ChevronLeftIcon className="size-8" />
      </Link>
    </div>
  );
}
