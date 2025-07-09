'use client';

import { useState } from 'react';
import AccountSettings from '@/components/AccountSetttings';
import AccountVerification from '@/components/AccountVerification';
import Image from 'next/image';

export default function AccountClient() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl gap-10 rounded-2xl bg-white shadow-lg lg:my-auto lg:px-10">
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
    </div>
  );
}
