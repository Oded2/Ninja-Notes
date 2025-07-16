'use client';

import { useState } from 'react';
import {
  DocumentIcon,
  EnvelopeIcon,
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
  findDefaultListId,
  generateSalt,
  handleError,
  zipAndDownloadJSON,
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
import Collapse from '@/components/Collapse';

export default function SettingsClient() {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="border-base-300-content flex w-full flex-col border-b pb-10 sm:me-10 sm:max-w-50 sm:border-e sm:border-b-0 sm:pe-10">
        <h1 className="text-base-300-content mb-4 text-4xl font-medium">
          Settings
        </h1>
        <div className="flex sm:flex-col">
          <TabSelector title="Notes" tab={tab} setTab={setTab} activeTab={0}>
            <DocumentIcon />
          </TabSelector>
          <TabSelector title="Account" tab={tab} setTab={setTab} activeTab={1}>
            <UserCircleIcon />
          </TabSelector>
        </div>
      </div>
      <div className="flex grow flex-col py-10">
        <AnimatePresence mode="wait" initial={false}>
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
      return <span className="text-error">Unknown Tab</span>;
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
        'flex grow cursor-pointer justify-center border-y p-2 first:rounded-s first:border-s last:rounded-e last:border-e sm:justify-start sm:border-x sm:text-start sm:not-first:not-last:border-y-0 sm:first:rounded-s-none sm:first:rounded-t sm:first:border-b-0 sm:last:rounded-e-none sm:last:rounded-b sm:last:border-t-0',
        {
          'text-primary-content border-secondary bg-secondary': active,
          'hover:text-primary-content active:text-primary-content text-secondary-light hover:border-secondary-light hover:bg-secondary-light active:border-secondary active:bg-secondary border-gray-700 transition-colors':
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
        <h2 className="text-base-200-content text-3xl font-medium">{header}</h2>
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
    <div className="border-neutral flex flex-col not-last:mb-4 not-last:border-b not-last:pb-2 sm:me-auto">
      <div className="mb-4 text-xl">
        <h3 className="text-base-200-content font-medium">{header}</h3>
      </div>
      {children}
    </div>
  );
}

function NotesManager() {
  const notes = useContentStore((state) => state.notes);
  const lists = useContentStore((state) => state.lists);
  const [inProgress, setInProgress] = useState(false);

  const handleExport = async () => {
    if (inProgress) return;
    setInProgress(true);
    try {
      await zipAndDownloadJSON(
        [
          {
            filename: 'notes.json',
            data: notes,
          },
          {
            filename: 'collections.json',
            data: lists,
          },
        ],
        'account-data.zip',
      );
    } catch (e) {
      handleError(e);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <TabLayout header="My Notes">
      <div className="flex flex-col">
        <FieldSector header="Export Notes">
          <div className="flex max-w-lg flex-col gap-2">
            <p className="text-sm">Save your notes locally</p>
            <Button
              small
              style="black"
              disabled={inProgress}
              onClick={handleExport}
            >
              Export Notes
            </Button>
          </div>
        </FieldSector>
      </div>
    </TabLayout>
  );
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
  const lists = useContentStore((state) => state.lists);
  const purge = useContentStore((state) => state.purge);
  const [emailInProgress, setEmailInProgress] = useState(false);
  const [passwordInProgress, setPasswordInProgress] = useState(false);
  const [showEmaiInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleEmailChange = async () => {
    if (!user || !newEmail) return;
    setEmailInProgress(true);
    try {
      await updateEmail(user, newEmail).then(() =>
        addToast(
          'success',
          'Email updated',
          'Your email has been successfully updated',
        ),
      );
    } catch (err) {
      handleError(err);
    }
    setEmailInProgress(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast('error', 'Error', 'Passwords must match');
      return;
    }
    if (!user || !userKey || passwordInProgress) return;
    setPasswordInProgress(true);
    try {
      // Re‐encrypt the E2EE vault key under the new password
      // Generate a new 16-byte salt
      const newSalt = generateSalt();
      // Derive a new password key from the new password and new salt
      const newPasswordKey = await derivePasswordKey(newPassword, newSalt);
      // Encrypt the user key
      const newEncryptedUserKey = await encryptWithKey(userKey, newPasswordKey);
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
    setPasswordInProgress(false);
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
        <div className="flex flex-col gap-4 sm:flex-row">
          <div>
            Your current email address is{' '}
            <span className="font-bold">{user?.email}</span>
          </div>
          <button
            onClick={() => setShowEmailInput((prev) => !prev)}
            className="text-secondary-text me-auto cursor-pointer hover:underline sm:ms-auto sm:me-auto"
          >
            {showEmaiInput ? 'Cancel' : 'Change'}
          </button>
        </div>
        <Collapse open={showEmaiInput}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailChange();
            }}
            className="flex max-w-sm gap-2 px-1 pt-4 pb-1"
          >
            <FormInput
              type="email"
              label="New email address"
              val={newEmail}
              setVal={setNewEmail}
              required
            >
              <EnvelopeIcon />
            </FormInput>
            <Button small style="secondary" disabled={emailInProgress}>
              Change
            </Button>
          </form>
        </Collapse>
      </FieldSector>
      <FieldSector header="Password">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
            <Button style="black" small disabled={passwordInProgress}>
              Change Password
            </Button>
          </div>
        </form>
      </FieldSector>
      <FieldSector header="Delete Account">
        <div className="flex max-w-lg flex-col gap-2">
          <p className="text-sm">
            This account has {notesLength.toLocaleString()} notes associated
            with it. Deleting your account will permanently remove all notes and
            cannot be undone.
          </p>
          <div className="mx-auto flex gap-1">
            <Button
              style="neutral"
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
            >
              Purge Account
            </Button>
            <Button
              style="primary"
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
            >
              Delete Account
            </Button>
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
      <Button style="primary" disabled={inProgress}>
        Verify Account
      </Button>
    </form>
  );
}
