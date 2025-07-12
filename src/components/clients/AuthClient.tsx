'use client';

import FormInput from '@/components/FormInput';
import { defaultListName } from '@/lib/constants';
import { authHandlers, listsCollection, usersCollection } from '@/lib/firebase';
import {
  decryptCryptoKey,
  derivePasswordKey,
  encryptWithKey,
  generateSalt,
  generateUserKey,
  handleError,
} from '@/lib/helpers';
import { saveUserKey } from '@/lib/indexDB';
import { useToastStore } from '@/lib/stores/toastStore';
import { userDataTypeGuard } from '@/lib/typeguards';
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

export default function AuthClient() {
  const params = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const { signup, signin } = authHandlers;
  const router = useRouter();
  const addToast = useToastStore((state) => state.add);

  useEffect(() => {
    setIsSignUp(params.get('display') === 'signup');
  }, [params]);

  const handleSubmit = async () => {
    if (isSignUp && password !== confirmPassword) {
      addToast('error', 'Error', 'Passwords must match');
      return;
    }
    if (inProgress) return;
    setInProgress(true);
    const func = isSignUp ? signup : signin;
    try {
      const { user } = await func(email, password);
      const { uid } = user;
      const userDocRef = doc(usersCollection, uid);
      if (isSignUp) {
        const salt = generateSalt();
        const [userKey, passwordKey] = await Promise.all([
          generateUserKey(),
          derivePasswordKey(password, salt),
        ]);
        // Encrypt the key to send it to firebase securely, only being able to decrypt it using the password
        const [encryptedUserKey, encryptedDefaultListName] = await Promise.all([
          encryptWithKey(userKey, passwordKey),
          encryptWithKey(defaultListName, userKey),
        ]);
        // Create a default list for the user, save the user key to indexDB, create a document for the user
        await Promise.all([
          addDoc(listsCollection, {
            name: encryptedDefaultListName,
            userId: uid,
          }),
          saveUserKey(userKey),
          setDoc(userDocRef, {
            encryptedUserKey,
            salt: Array.from(salt),
          }),
        ]);
      } else {
        // User is logging in
        const userDoc = await getDoc(userDocRef);
        const data = userDoc.data();
        // Ensure that the data is valid
        if (userDataTypeGuard(data)) {
          // Extract the encrypted key and the salt
          const { encryptedUserKey, salt } = data;
          if (typeof encryptedUserKey === 'string')
            throw Error('Invalid encrypted user key');
          // Get the password-derived key to decrypt the extracted encrypted key
          const passwordKey = await derivePasswordKey(
            password,
            new Uint8Array(salt),
          );
          // Decrypt the encrypted key
          const decryptedUserKey = await decryptCryptoKey(
            encryptedUserKey,
            passwordKey,
          );
          // Save to indexDB
          await saveUserKey(decryptedUserKey);
        } else {
          // Keep alert
          alert('Invalid user data');
        }
      }
      router.push('/notes');
    } catch (err) {
      handleError(err);
      setInProgress(false);
    }
  };

  const handlePasswordReset = () => {
    // Keep alert
    alert(
      'Ninja Notes operates with zero-knowledge encryption. This means that only you can recover your account.',
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8">
      <Image
        src="/logo.png"
        alt="Logo"
        width={192}
        height={192}
        className="rounded-2xl"
        priority
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex w-full flex-col gap-4"
      >
        <h2 className="text-center text-xl font-semibold">
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </h2>
        <FormInput
          type="email"
          label="Email"
          val={email}
          setVal={setEmail}
          required
        >
          <EnvelopeIcon />
        </FormInput>
        <FormInput
          type="password"
          label="Password"
          val={password}
          setVal={setPassword}
          required
        >
          <KeyIcon />
        </FormInput>
        {isSignUp && (
          <>
            <FormInput
              type="password"
              label="Confirm password"
              val={confirmPassword}
              setVal={setConfirmPassword}
              required
            >
              <ShieldCheckIcon
                className={clsx({
                  'text-success':
                    password.length >= 8 && password === confirmPassword,
                })}
              />
            </FormInput>
            <span className="text-sm">
              There&apos;s no way to recover your password. Please store it
              safely to avoid losing access.
            </span>
          </>
        )}
        <div className="text-base-content/80 flex justify-between gap-2 text-sm">
          <span>
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
              className="cursor-pointer underline"
            >
              {isSignUp ? 'Sign In' : 'Create an account'}
            </button>
          </span>
          {!isSignUp && (
            <button
              type="button"
              onClick={handlePasswordReset}
              className="ms-auto cursor-pointer hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          )}
        </div>
        <Button type="submit" style="primary" disabled={inProgress}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
