'use client';

import FormInput from '@/components/FormInput';
import FormInputContainer from '@/components/FormInputContainer';
import { defaultListName } from '@/lib/constants';
import { authHandlers, listsCollection, usersCollection } from '@/lib/firebase';
import {
  decryptWithKey,
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  generateSalt,
  generateUserKey,
  handleError,
  importKey,
} from '@/lib/helpers';
import { saveUserKey } from '@/lib/indexDB';
import { useContentStore } from '@/lib/stores/contentStore';
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
    setInProgress(true);
    const func = isSignUp ? signup : signin;
    const { user } = await func(email, password).catch((err) => {
      setInProgress(false);
      handleError(err);
      return { user: null };
    });
    if (!user) return;
    const { uid } = user;
    const userDocRef = doc(usersCollection, uid);
    if (isSignUp) {
      const salt = generateSalt();
      const userKey = await generateUserKey();
      const [userKeyBase64, passwordKey] = await Promise.all([
        exportKey(userKey),
        derivePasswordKey(password, salt),
      ]);
      // Encrypt the key to send it to firebase securely, only being able to decrypt it using the password
      const [encryptedUserKey, encryptedDefaultListName] = await Promise.all([
        encryptWithKey(userKeyBase64, passwordKey),
        encryptWithKey(defaultListName, userKey),
      ]);
      // Create a default list for the user, save the user key to indexDB, create a document for the user
      const [{ id }] = await Promise.all([
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
      // Since the default list was added to the user's lists, then it needs to be added locally as well
      useContentStore.getState().addList(
        {
          name: defaultListName,
          id,
        },
        [],
      );
    } else {
      // User is logging in
      const userDoc = await getDoc(userDocRef);
      const data = userDoc.data();
      // Ensure that the data is valid
      if (userDataTypeGuard(data)) {
        // Extract the encrypted key and the salt
        const { encryptedUserKey, salt } = data;
        // Get the password-derived key to decrypt the extracted encrypted key
        const passwordKey = await derivePasswordKey(
          password,
          new Uint8Array(salt),
        );
        // Decrypt the encrypted key
        const decryptedUserKey = await decryptWithKey(
          encryptedUserKey,
          passwordKey,
        ).then(importKey);
        // Save to indexDB
        await saveUserKey(decryptedUserKey);
      } else {
        // Keep alert
        alert('Invalid user data');
      }
    }
    router.push('/notes');
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
        width={1024}
        height={1024}
        className="size-48 max-h-full rounded-2xl"
        priority
      />
      <FormInputContainer
        title={isSignUp ? 'Create an account' : 'Sign in to your account'}
        submitText={isSignUp ? 'Create Account' : 'Sign In'}
        handleSubmit={handleSubmit}
      >
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
              onClick={() => setIsSignUp((state) => !state)}
              className="cursor-pointer underline"
            >
              {isSignUp ? 'Sign In' : 'Create an account'}
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
