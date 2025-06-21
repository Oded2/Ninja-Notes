"use client";

import { useState } from "react";
import AccountInput from "./AccountInput";
import AccountInputContainer from "./AccountInputContainer";
import { useUserStore } from "@/lib/stores/userStore";
import {
  sendEmailVerification,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { handleError } from "@/lib/helpers";
import { deleteDoc, getDocs, query, where } from "firebase/firestore";
import { notesCollection } from "@/lib/firebase";

export default function AccountSettings() {
  const user = useUserStore((state) => state.user);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailChange = async () => {
    if (!user) return;
    await updateEmail(user, newEmail).catch(handleError);
    alert(`Your email has been updated to ${newEmail}`);
    setNewEmail("");
  };
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords must match");
      return;
    }
    if (!user) return;
    await updatePassword(user, newPassword).catch(handleError);
    alert("Your password has been updated");
  };
  const handleAccountDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;
    const q = query(notesCollection, where("userId", "==", user?.uid));
    const promises = await getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => deleteDoc(doc.ref)),
    );
    Promise.all(promises)
      .then(() => user?.delete().catch(handleError))
      .catch(handleError);
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
      <button
        onClick={handleAccountDelete}
        className="mx-auto cursor-pointer text-sm text-red-400 hover:underline"
      >
        Delete Account
      </button>
    </div>
  );
}
