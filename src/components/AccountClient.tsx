"use client";

import Image from "next/image";
import { useState } from "react";
import AccountInput from "./AccountInput";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import AccountInputContainer from "./AccountInputContainer";

export default function AccountClient() {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //   TODO: Add logic
  const handleEmailChange = () => {};
  const handlePasswordChange = () => {};

  return (
    <div className="relative mx-auto flex w-full max-w-5xl gap-10 rounded-2xl bg-white p-10 shadow-lg md:mt-20">
      <Image
        src="/logo.png"
        alt="Logo"
        height={1024}
        width={1024}
        className="my-auto size-92 rounded-2xl"
      />
      <div className="flex grow flex-col items-center gap-2 p-5">
        <h2 className="mb-4 text-3xl font-bold text-slate-950/90">
          Account Settings
        </h2>
        <AccountInputContainer
          handleSubmit={handleEmailChange}
          submitText="Update Email"
        >
          <AccountInput
            label="Change Email"
            val={newEmail}
            setVal={setNewEmail}
            placeholder="example@domain.com"
            type="email"
          />
        </AccountInputContainer>
        <AccountInputContainer
          handleSubmit={handlePasswordChange}
          submitText="Update Password"
        >
          <AccountInput
            label="Change Password"
            val={newPassword}
            setVal={setNewPassword}
            type="password"
          />
          <AccountInput
            label="Confirm Password"
            val={confirmPassword}
            setVal={setConfirmPassword}
            type="password"
          />
        </AccountInputContainer>
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
