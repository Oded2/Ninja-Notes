"use client";

import { useState } from "react";
import AccountInput from "./AccountInput";
import AccountInputContainer from "./AccountInputContainer";
import { useUserStore } from "@/lib/stores/userStore";
import { updateEmail, updatePassword } from "firebase/auth";
import {
  derivePasswordKey,
  encryptWithKey,
  exportKey,
  generateSalt,
  handleError,
} from "@/lib/helpers";
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { notesCollection, usersCollection } from "@/lib/firebase";
import { loadUserKey } from "@/lib/indexDB";
import { useToastStore } from "@/lib/stores/toastStore";
import { useConfirmStore } from "@/lib/stores/confirmStore";

export default function AccountSettings() {
  const user = useUserStore((state) => state.user);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [purgeCompleted, setPurgeCompleted] = useState(false);
  const [accountDeleteCompleted, setAccountDeleteCompleted] = useState(false);
  const add = useToastStore((state) => state.add);
  const showConfirm = useConfirmStore((state) => state.showConfirm);

  const handleEmailChange = async () => {
    if (!user) return;
    await updateEmail(user, newEmail).catch(handleError);
    setNewEmail("");
  };
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      add("error", "Error", "Passwords must match");
      return;
    }
    if (!user) return;
    try {
      // Re‐encrypt your E2EE vault key under the new password
      // Load the existing userKey (CryptoKey) from IndexedDB
      const userKey = await loadUserKey();
      if (!userKey) return;
      const userKeyBase64 = await exportKey(userKey);
      // Generate a new 16-byte salt
      const newSalt = generateSalt();
      // Derive a new password key from the new password + new salt
      const newPasswordKey = await derivePasswordKey(newPassword, newSalt);
      // Encrypt the Base64 raw key under that new passwordKey
      const newEncryptedUserKey = await encryptWithKey(
        userKeyBase64,
        newPasswordKey,
      );
      // Update password
      await updatePassword(user, newPassword);
      const userDocRef = doc(usersCollection, user.uid);
      // Write the updated encrypted user key + salt back to Firestore
      await setDoc(
        userDocRef,
        {
          encryptedUserKey: newEncryptedUserKey,
          salt: Array.from(newSalt),
        },
        { merge: true },
      );
      add(
        "success",
        "Password updated",
        "Your password has been successfully updated",
      );
    } catch (err) {
      handleError(err);
    }
  };
  const handleNotePurge = async (interactive = true) => {
    setPurgeCompleted(interactive);
    const q = query(notesCollection, where("userId", "==", user?.uid));
    const promises = await getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => deleteDoc(doc.ref)),
    );
    await Promise.all(promises).catch((e) => {
      handleError(e);
      setPurgeCompleted(false);
    });
    if (interactive)
      add(
        "success",
        "Notes purged successfully",
        "Your notes have been successfully deleted",
      );
  };
  const handleAccountDelete = async () => {
    setAccountDeleteCompleted(true);
    await handleNotePurge(false);
    await deleteDoc(doc(usersCollection, user?.uid)).catch(handleError);
    await user?.delete().catch((e) => {
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
      <div className="divider mx-auto flex divide-x text-sm text-red-400 *:px-1.5 *:not-disabled:cursor-pointer *:not-disabled:hover:underline *:disabled:opacity-50">
        <button
          disabled={purgeCompleted}
          onClick={() =>
            showConfirm(
              "Purge notes",
              "Are you sure you want to delete all of your notes?",
              handleNotePurge,
            )
          }
        >
          Purge Notes
        </button>
        <button
          disabled={accountDeleteCompleted}
          onClick={() =>
            showConfirm(
              "Delete account",
              "Are you sure you want to delete your account?",
              handleAccountDelete,
            )
          }
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
