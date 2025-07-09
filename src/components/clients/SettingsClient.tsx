'use client';

import { useState } from 'react';
import {
  DocumentIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import IconText from '@/components/IconText';
import clsx from 'clsx';
import { SetValShortcut } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from '@/lib/stores/userStore';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { useContentStore } from '@/lib/stores/contentStore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import {
  deleteByQuery,
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  findDefaultListId,
  generateSalt,
  handleError,
} from '@/lib/helpers';
import { useToastStore } from '@/lib/stores/toastStore';
import { useConfirmStore } from '@/lib/stores/confirmStore';
import {
  listsCollection,
  notesCollection,
  usersCollection,
} from '@/lib/firebase';
import {
  deleteDoc,
  doc,
  documentId,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  where,
} from 'firebase/firestore';
import { useInputStore } from '@/lib/stores/inputStore';

export default function SettingsClient() {
  const [tab, setTab] = useState(1);

  return (
    <div className="flex">
      <div className="me-10 flex flex-col border-e border-gray-300 pe-10">
        <div className="mb-4 border-b border-gray-300 px-2 pb-2">
          <h1 className="text-4xl font-medium text-gray-700">Settings</h1>
        </div>
        <div className="flex flex-col">
          <TabSelector title="Notes" tab={tab} setTab={setTab} activeTab={0}>
            <DocumentIcon />
          </TabSelector>
          <TabSelector title="Account" tab={tab} setTab={setTab} activeTab={1}>
            <UserCircleIcon />
          </TabSelector>
        </div>
      </div>
      <div className="flex grow flex-col py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <RenderTab tab={tab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

type RenderTabProps = {
  tab: number;
};

function RenderTab({ tab }: RenderTabProps) {
  switch (tab) {
    case 0:
      return <NotesManager />;
    case 1:
      return <AccountManager />;
    default:
      return <span className="text-rose-500">Unknown Tab</span>;
  }
}

type TabSelectorProps = {
  activeTab: number;
  tab: number;
  setTab: SetValShortcut<number>;
  title: string;
  children: React.ReactNode;
};

function TabSelector({
  activeTab,
  tab,
  setTab,
  title,
  children: icon,
}: TabSelectorProps) {
  const active = tab == activeTab;

  return (
    <button
      onClick={() => setTab(activeTab)}
      className={clsx(
        'cursor-pointer border-x p-2 first:rounded-t first:border-t last:rounded-b last:border-b',
        {
          'border-red-400 bg-red-400 text-slate-50': active,
          'border-gray-300 text-red-300 transition-colors hover:border-red-300 hover:bg-red-300 hover:text-slate-50 active:border-red-400 active:bg-red-400':
            !active,
        },
      )}
    >
      <IconText text={title}>{icon}</IconText>
    </button>
  );
}

type TabLayoutProps = {
  header: string;
  children: React.ReactNode;
};

function TabLayout({ header, children }: TabLayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-10">
        <h2 className="text-3xl font-medium text-gray-800">{header}</h2>
      </div>
      {children}
    </div>
  );
}

type FieldSectorProps = {
  header: string;
  children: React.ReactNode;
};

function FieldSector({ header, children }: FieldSectorProps) {
  return (
    <div className="me-auto flex flex-col border-gray-300 not-last:mb-4 not-last:border-b not-last:pb-2">
      <div className="mb-4 text-xl">
        <h3 className="font-medium text-gray-800">{header}</h3>
      </div>
      {children}
    </div>
  );
}

function NotesManager() {
  return <TabLayout header="My Notes">Coming soon...</TabLayout>;
}

function AccountManager() {
  const [verified, setVerified] = useState(false);
  return (
    <TabLayout header="Account">
      <AnimatePresence mode="wait" initial={false}>
        {verified ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <AccountSettings />
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <VerifyAccount onVerify={() => setVerified(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </TabLayout>
  );
}

function AccountSettings() {
  const notesLength = useContentStore((state) => state.notes.length);
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [purgeCompleted, setPurgeCompleted] = useState(false);
  const [accountDeleteCompleted, setAccountDeleteCompleted] = useState(false);
  const addToast = useToastStore((state) => state.add);
  const showConfirm = useConfirmStore((state) => state.showConfirm);
  const showInput = useInputStore((state) => state.showInput);
  const lists = useContentStore((state) => state.lists);
  const purge = useContentStore((state) => state.purge);

  const handleEmailChange = (newEmail: string) => {
    if (!user) return;
    return updateEmail(user, newEmail)
      .then(() =>
        addToast(
          'success',
          'Email updated',
          'Your email has been successfully updated',
        ),
      )
      .catch(handleError);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast('error', 'Error', 'Passwords must match');
      return;
    }
    if (!user || !userKey) return;
    try {
      // Re‐encrypt the E2EE vault key under the new password
      // Generate a new 16-byte salt
      const newSalt = generateSalt();
      // Derive a new password key from the new password + new salt
      const [userKeyBase64, newPasswordKey] = await Promise.all([
        exportKey(userKey),
        derivePasswordKey(newPassword, newSalt),
      ]);
      // Encrypt the Base64 raw key under that new passwordKey
      const newEncryptedUserKey = await encryptWithKey(
        userKeyBase64,
        newPasswordKey,
      );
      const userDocRef = doc(usersCollection, user.uid);
      // Write the updated encrypted user key + salt back to Firestore and change the password
      await Promise.all([
        updatePassword(user, newPassword),
        setDoc(
          userDocRef,
          {
            encryptedUserKey: newEncryptedUserKey,
            salt: Array.from(newSalt),
          },
          { merge: true },
        ),
      ]);
      addToast(
        'success',
        'Password updated',
        'Your password has been successfully updated',
      );
    } catch (err) {
      handleError(err);
    }
  };

  const handleNotePurge = async (accountDelete = true) => {
    if (!userKey) return;
    setPurgeCompleted(accountDelete);
    const userId = user?.uid;
    const defaultListId = findDefaultListId(lists);
    const documentIdFieldPath = documentId();
    const listsQueryConditions: QueryConstraint[] = [
      where('userId', '==', userId),
    ];
    if (accountDelete) {
      // The user is not deleting the account, therefore the default list must not be deleted
      listsQueryConditions.push(
        where(documentIdFieldPath, '!=', defaultListId),
      );
      listsQueryConditions.push(orderBy(documentIdFieldPath)); // Required by firebase;
    }
    const listsQuery = query(listsCollection, ...listsQueryConditions);
    const notesQuery = query(notesCollection, where('userId', '==', userId));
    await Promise.all([
      deleteByQuery(listsQuery),
      deleteByQuery(notesQuery),
    ]).catch((e) => {
      handleError(e);
      setPurgeCompleted(false);
    });
    if (accountDelete)
      addToast(
        'success',
        'Notes purged successfully',
        'Your notes have been successfully deleted',
      );
    purge();
  };

  const handleAccountDelete = async () => {
    if (!user) return;
    setAccountDeleteCompleted(true);
    const docRef = doc(usersCollection, user.uid);
    await Promise.all([handleNotePurge(false), deleteDoc(docRef)]).catch(
      (e) => {
        handleError(e);
        setAccountDeleteCompleted(false);
      },
    );
    await user.delete().catch((e) => {
      handleError(e);
      setAccountDeleteCompleted(false);
    });
  };

  return (
    <div className="flex flex-col">
      <FieldSector header="Email Address">
        <div className="flex flex-wrap gap-4">
          <div>
            Your current email address is{' '}
            <span className="font-bold">{user?.email}</span>
          </div>
          <button
            onClick={() =>
              showInput('Enter your new email address', handleEmailChange)
            }
            className="ms-auto cursor-pointer text-indigo-600 hover:underline"
          >
            Change
          </button>
        </div>
      </FieldSector>
      <FieldSector header="Password">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              type="password"
              label="New Password"
              val={newPassword}
              setVal={setNewPassword}
              required
            />
            <FormInput
              type="password"
              label="Confirm New Password"
              val={confirmPassword}
              setVal={setConfirmPassword}
              required
            />
          </div>
          <div className="flex justify-end py-4">
            <Button style="black" label="Change Password" small />
          </div>
        </form>
      </FieldSector>
      <FieldSector header="Delete Account">
        <div className="flex max-w-lg flex-col">
          <p className="text-sm">
            This account has {notesLength.toLocaleString()} notes associated
            with it. Deleting your account will permanently remove all notes and
            cannot be undone.
          </p>
          <div className="mx-auto mt-2 flex gap-1">
            <Button
              style="neutral"
              label="Purge Account"
              small
              disabled={purgeCompleted}
              onClick={() =>
                showConfirm(
                  'Purge account',
                  'All of your notes and collections will be permanantly deleted. Your account will not be deleted.',
                  handleNotePurge,
                  'account/purge',
                )
              }
            />
            <Button
              style="primary"
              label="Delete Account"
              small
              disabled={accountDeleteCompleted}
              onClick={() =>
                showConfirm(
                  'Delete account',
                  "Your account will be permanently deleted, and you won't be able to recover your account later.",
                  handleAccountDelete,
                  'account/delete',
                )
              }
            />
          </div>
        </div>
      </FieldSector>
    </div>
  );
}

type VerifyAccountProps = {
  onVerify: () => void;
};

function VerifyAccount({ onVerify }: VerifyAccountProps) {
  const [password, setPassword] = useState('');
  const user = useUserStore((state) => state.user);
  const [inProgress, setInProgress] = useState(false);

  const handleVerify = async () => {
    const email = user?.email;
    if (!password || !email) return;
    setInProgress(true);
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential)
      .then(onVerify)
      .catch((e) => {
        setInProgress(false);
        handleError(e);
      });
  };

  return (
    <form
      className="flex max-w-sm flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleVerify();
      }}
    >
      <FormInput
        type="password"
        label="Enter your password"
        val={password}
        setVal={setPassword}
      >
        <KeyIcon />
      </FormInput>
      <Button style="primary" label="Verify Account" disabled={inProgress} />
    </form>
  );
}
