"use client";

import { useState } from "react";
import AccountInput from "./AccountInput";
import AccountInputContainer from "./AccountInputContainer";
import { useUserStore } from "@/lib/stores/userStore";
import { updateEmail, updatePassword } from "firebase/auth";
import {
  deleteByQuery,
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  findDefaultListId,
  generateSalt,
  handleError,
} from "@/lib/helpers";
import {
  deleteDoc,
  doc,
  documentId,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  where,
} from "firebase/firestore";
import {
  listsCollection,
  notesCollection,
  usersCollection,
} from "@/lib/firebase";
import { useToastStore } from "@/lib/stores/toastStore";
import { useConfirmStore } from "@/lib/stores/confirmStore";
import InlineDivider from "./InlineDivider";
import { useContentStore } from "@/lib/stores/contentStore";

export default function AccountSettings() {
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [purgeCompleted, setPurgeCompleted] = useState(false);
  const [accountDeleteCompleted, setAccountDeleteCompleted] = useState(false);
  const addToast = useToastStore((state) => state.add);
  const showConfirm = useConfirmStore((state) => state.showConfirm);
  const lists = useContentStore((state) => state.lists);
  const purge = useContentStore((state) => state.purge);

  const handleEmailChange = async () => {
    if (!user) return;
    await updateEmail(user, newEmail).catch(handleError);
    addToast(
      "success",
      "Email updated",
      "Your email has been successfully updated",
    );
    setNewEmail("");
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast("error", "Error", "Passwords must match");
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
        "success",
        "Password updated",
        "Your password has been successfully updated",
      );
    } catch (err) {
      handleError(err);
    }
  };

  const handleNotePurge = async (interactive = true) => {
    if (!userKey) return;
    setPurgeCompleted(interactive);
    const userId = user?.uid;
    const defaultListId = findDefaultListId(lists);
    const documentIdFieldPath = documentId();
    const listsQueryConditions: QueryConstraint[] = [
      where("userId", "==", userId),
    ];
    if (interactive) {
      // The user is not deleting the account, therefore the default list must be not be deleted
      listsQueryConditions.push(
        where(documentIdFieldPath, "!=", defaultListId),
      );
      listsQueryConditions.push(orderBy(documentIdFieldPath)); // Required by firebase;
    }
    const listsQuery = query(listsCollection, ...listsQueryConditions);
    const notesQuery = query(notesCollection, where("userId", "==", userId));
    await Promise.all([
      deleteByQuery(listsQuery),
      deleteByQuery(notesQuery),
    ]).catch((e) => {
      handleError(e);
      setPurgeCompleted(false);
    });
    if (interactive)
      addToast(
        "success",
        "Notes purged successfully",
        "Your notes have been successfully deleted",
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
    <div className="flex w-full flex-col gap-2">
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
          label="Confirm New Password"
          val={confirmPassword}
          setVal={setConfirmPassword}
          type="password"
        />
      </AccountInputContainer>
      <div className="mx-auto text-sm text-red-500 *:*:*:enabled:cursor-pointer *:*:*:enabled:hover:underline *:*:*:disabled:opacity-50">
        <InlineDivider>
          <div>
            <button
              disabled={purgeCompleted}
              onClick={() =>
                showConfirm(
                  "Purge notes",
                  "Are you sure you want to delete all of your notes?",
                  handleNotePurge,
                  "notes/purge",
                )
              }
            >
              Purge Notes
            </button>
          </div>
          <div>
            <button
              disabled={accountDeleteCompleted}
              onClick={() =>
                showConfirm(
                  "Delete account",
                  "Are you sure you want to delete your account?",
                  handleAccountDelete,
                  "account/delete",
                )
              }
            >
              Delete Account
            </button>
          </div>
        </InlineDivider>
      </div>
    </div>
  );
}
