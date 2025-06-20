"use client";

import FormInput from "@/components/FormInput";
import FormInputContainer from "@/components/FormInputContainer";
import { authHandlers } from "@/lib/firebase";
import { firebaseAuthErrorTypeGaurd } from "@/lib/typegaurds";
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import Image from "next/image";
import { useState } from "react";

const errorCodeMap: Record<string, string> = {
  "auth/invalid-credential": "Invalid credentials",
};

export default function AuthClient() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const { signup, signin } = authHandlers;

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      alert("Passwords must match");
      return;
    }
    setInProgress(true);
    const func = isSignUp ? signup : signin;
    func(email, password).catch((err) => {
      setInProgress(false);
      console.error("Auth error", err);
      if (firebaseAuthErrorTypeGaurd(err)) {
        alert(errorCodeMap[err.code] ?? "Unknown error");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Image
        src="/logo.png"
        alt="Logo"
        width={1024}
        height={1024}
        className="size-48 max-h-full rounded-2xl"
        priority
      />

      <FormInputContainer
        title={isSignUp ? "Create an account" : "Sign in to your account"}
        submitText={isSignUp ? "Create Account" : "Sign In"}
        handleSubmit={handleSubmit}
        disabled={inProgress}
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
          required
        >
          <KeyIcon className="size-6" />
        </FormInput>
        {isSignUp && (
          <FormInput
            type="password"
            label="Confirm password"
            val={confirmPassword}
            setVal={setConfirmPassword}
            required
          >
            <ShieldCheckIcon className="size-6"></ShieldCheckIcon>
          </FormInput>
        )}
        <div>
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp((state) => !state)}
            className="cursor-pointer underline"
          >
            {isSignUp ? "Sign In" : "Create an account"}
          </button>
        </div>
      </FormInputContainer>
    </div>
  );
}
