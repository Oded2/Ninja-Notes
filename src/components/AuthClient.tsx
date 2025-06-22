"use client";

import FormInput from "@/components/FormInput";
import FormInputContainer from "@/components/FormInputContainer";
import { authHandlers, usersCollection } from "@/lib/firebase";
import {
  decryptWithKey,
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  generateSalt,
  generateUserKey,
  handleError,
} from "@/lib/helpers";
import { saveUserKey } from "@/lib/indexDB";
import { userDataTypeGaurd } from "@/lib/typegaurds";
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
      // Generate a key then export it
      const userKeyBase64 = await generateUserKey().then((key) =>
        exportKey(key),
      );
      // Generate random salt
      const salt = generateSalt();
      // Generate a random key derived from the password
      const passwordKey = await derivePasswordKey(password, salt);
      // Encrypt the key to send it to firebase securely, only being able to decrypt it using the password
      const encryptedUserKey = await encryptWithKey(userKeyBase64, passwordKey);
      // Save to indexDB
      await saveUserKey(userKeyBase64);
      // Add to firebase
      await setDoc(userDocRef, {
        encryptedUserKey,
        salt: Array.from(salt),
      }).catch(handleError);
    } else {
      const userDoc = await getDoc(userDocRef);
      const data = userDoc.data();
      // Ensure that the data is valid
      if (userDataTypeGaurd(data)) {
        // Extract the encrypted key and the salt
        const { encryptedUserKey, salt } = data;
        // Get the password-derived key to decrypt the extracted encrypted key
        const passwordKey = await derivePasswordKey(
          password,
          new Uint8Array(salt),
        );
        // Decrypt the encrypted key
        const decryptedUserKeyBase64 = await decryptWithKey(
          encryptedUserKey,
          passwordKey,
        );
        // Save to indexDB
        await saveUserKey(decryptedUserKeyBase64);
      } else alert("Invalid user data");
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
