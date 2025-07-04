import { handleError } from '@/lib/helpers';
import { useToastStore } from '@/lib/stores/toastStore';
import { useUserStore } from '@/lib/stores/userStore';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

export default function VerifyEmail() {
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);
  const add = useToastStore((state) => state.add);

  const handleEmailVerification = () => {
    if (!user) return;
    setInProgress(true);
    sendEmailVerification(user)
      .then(() => {
        setInProgress(false);
        add(
          'success',
          'Email sent',
          `An email has been sent to ${user.email}. If you do not see the email, please check your spam.`,
          10000,
        );
      })
      .catch(handleError);
  };

  return (
    <span className="whitespace-nowrap">
      Email unverified.{' '}
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
