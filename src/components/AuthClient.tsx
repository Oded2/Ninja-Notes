"use client";

import FormInput from "@/components/FormInput";
import FormInputContainer from "@/components/FormInputContainer";
import { authHandlers, usersCollection } from "@/lib/firebase";
import {
  decryptWithKey,
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  generateUserKey,
  handleError,
} from "@/lib/helpers";
import { saveUserKey } from "@/lib/indexDB";
import { UserData } from "@/lib/types";
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { useState } from "react";

export default function AuthClient() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const { signup, signin, forgotPassword } = authHandlers;

  const handleSubmit = async () => {
    if (isSignUp && password !== confirmPassword) {
      alert("Passwords must match");
      return;
    }
    setInProgress(true);
    const func = isSignUp ? signup : signin;
    const { user } = await func(email, password).catch((err) => {
      setInProgress(false);
      handleError(err);
      return { user: null };
    });
    if (!user) return;
    const userDocRef = doc(usersCollection, user.uid);
    if (isSignUp) {
      const userKeyRaw = await generateUserKey().then((key) => exportKey(key));
      const userKeyBase64 = btoa(
        String.fromCharCode(...new Uint8Array(userKeyRaw)),
      );
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const passwordKey = await derivePasswordKey(password, salt);
      const encryptedUserKey = await encryptWithKey(userKeyBase64, passwordKey);
      await saveUserKey(userKeyBase64);
      await setDoc(userDocRef, {
        encryptedUserKey,
        salt: Array.from(salt),
      });
    } else {
      const userDoc = await getDoc(userDocRef);
      const { encryptedUserKey, salt } = userDoc.data() as UserData;
      const passwordKey = await derivePasswordKey(
        password,
        new Uint8Array(salt),
      );
      const decryptedUserKeyBase64 = await decryptWithKey(
        encryptedUserKey,
        passwordKey,
      );
      await saveUserKey(decryptedUserKeyBase64);
    }
  };

  const handlePasswordReset = () => {
    if (email.length == 0) {
      alert("Please enter your email");
      return;
    }
    setInProgress(true);
    forgotPassword(email)
      .then(() => alert(`An email has been sent to ${email} with instructions`))
      .catch(handleError)
      .finally(() => setInProgress(false));
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
        <div className="flex justify-between gap-2 text-xs text-slate-950/80">
          <span>
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp((state) => !state)}
              className="cursor-pointer underline"
            >
              {isSignUp ? "Sign In" : "Create an account"}
            </button>
          </span>
          {!isSignUp && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={inProgress}
              className="ms-auto cursor-pointer hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          )}
        </div>
      </FormInputContainer>
    </div>
  );
}
