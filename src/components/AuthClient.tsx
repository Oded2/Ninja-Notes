"use client";

import FormInput from "@/components/FormInput";
import FormInputContainer from "@/components/FormInputContainer";
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import Image from "next/image";
import { useState } from "react";

export default function AuthClient() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    console.log("Submitted!");
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Image
        src="/logo.png"
        alt="Logo"
        width={1024}
        height={1024}
        className="size-48 max-h-full rounded-2xl"
      />

      <FormInputContainer
        title={isSignIn ? "Create an account" : "Sign in to your account"}
        submitText={isSignIn ? "Create Account" : "Sign In"}
        handleSubmit={handleSubmit}
      >
        <FormInput
          type="email"
          label="Email"
          val={email}
          setVal={setEmail}
          required
        >
          <EnvelopeIcon className="size-6" />
        </FormInput>
        <FormInput
          type="password"
          label="Password"
          val={password}
          setVal={setPassword}
          minLength={8}
          maxLength={4096}
          required
        >
          <KeyIcon className="size-6" />
        </FormInput>
        {isSignIn && (
          <FormInput
            type="password"
            label="Confirm password"
            val={confirmPassword}
            setVal={setConfirmPassword}
            minLength={8}
            maxLength={4096}
            required
          >
            <ShieldCheckIcon className="size-6"></ShieldCheckIcon>
          </FormInput>
        )}
        <div>
          {isSignIn ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignIn((state) => !state)}
            className="cursor-pointer underline"
          >
            {isSignIn ? "Sign In" : "Create an account"}
          </button>
        </div>
      </FormInputContainer>
    </div>
  );
}
