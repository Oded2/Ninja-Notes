import { handleError } from "@/lib/helpers";
import { useUserStore } from "@/lib/stores/userStore";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";

export default function VerifyEmail() {
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);

  const handleEmailVerification = () => {
    if (!user) return;
    setInProgress(true);
    sendEmailVerification(user)
      .then(() => {
        setInProgress(false);
        alert(
          `An email has been sent to ${user.email}. If you do not see the email, please check your spam.`,
        );
      })
      .catch(handleError);
  };

  return (
    <span className="whitespace-nowrap">
      Email unverified.{" "}
      <button
        onClick={handleEmailVerification}
        disabled={inProgress}
        className="cursor-pointer underline hover:opacity-70 active:opacity-60 disabled:opacity-50"
      >
        Send verification email
      </button>
    </span>
  );
}
