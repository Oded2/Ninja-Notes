'use client';

import { useState } from 'react';
import Button from './Button';

type Props = {
  title: string;
  submitText: string;
  handleSubmit: () => Promise<void>;
  children: React.ReactNode;
};

export default function FormInputContainer({
  title,
  submitText,
  handleSubmit,
  children,
}: Props) {
  const [inProgress, setInProgress] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setInProgress(true);
        handleSubmit().then(() => setInProgress(false));
      }}
      className="flex w-full flex-col gap-4"
    >
      <h2 className="text-center text-xl font-semibold">{title}</h2>
      {children}
      <Button type="submit" style="primary" disabled={inProgress}>
        {submitText}
      </Button>
    </form>
  );
}
