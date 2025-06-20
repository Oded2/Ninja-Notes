"use client";

import { useState } from "react";
import AccountSettings from "./AccountSetttings";
import AccountVerification from "./AccountVerification";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

export default function AccountClient() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl gap-10 rounded-2xl bg-white p-10 shadow-lg md:mt-20">
      <Image
        src="/logo.png"
        alt="Logo"
        height={1024}
        width={1024}
        className="my-auto size-96 rounded-2xl"
      />
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
      <button
        onClick={() => setVerified((state) => !state)}
        className="absolute top-2 right-2 opacity-90 transition-opacity hover:opacity-70"
      >
        toggle
      </button>
    </div>
  );
}
