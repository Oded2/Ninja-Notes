"use client";

import { useState } from "react";
import AccountInput from "./AccountInput";
import AccountInputContainer from "./AccountInputContainer";
import { useUserStore } from "@/lib/stores/userStore";
import { updateEmail, updatePassword } from "firebase/auth";
import { handleError } from "@/lib/helpers";

export default function AccountSettings() {
  const user = useUserStore((state) => state.user);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailChange = async () => {
    if (!user) return;
    await updateEmail(user, newEmail).catch(handleError);
  };
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords must match");
      return;
    }
    if (!user) return;
    await updatePassword(user, newPassword).catch(handleError);
  };

  return (
    <>
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
    </>
  );
}
