"use client";

import { useState } from "react";
import AccountInput from "./AccountInput";
import AccountInputContainer from "./AccountInputContainer";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useUserStore } from "@/lib/stores/userStore";
import { handleError } from "@/lib/helpers";

type Props = {
  onVerify: () => void;
};

export default function AccountVerification({ onVerify }: Props) {
  const [password, setPassword] = useState("");
  const user = useUserStore((state) => state.user);

  const handleVerify = async () => {
    const email = user?.email;
    if (!email) return;
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential)
      .then(onVerify)
      .catch(handleError);
  };

  return (
    <AccountInputContainer handleSubmit={handleVerify} submitText="Verify">
      <AccountInput
        type="password"
        label="Enter your password"
        val={password}
        setVal={setPassword}
      />
    </AccountInputContainer>
  );
}
