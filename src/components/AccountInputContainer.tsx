import React, { useState } from "react";
import Button from "./Button";

type Props = {
  handleSubmit: () => Promise<void>;
  submitText: string;
  children: React.ReactNode;
};

export default function AccountInputContainer({
  handleSubmit,
  submitText,
  children,
}: Props) {
  const [inProgress, setInProgress] = useState(false);

  return (
    <form
      className="mx-auto flex w-full max-w-sm flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setInProgress(true);
        handleSubmit().then(() => setInProgress(false));
      }}
    >
      <div className="flex flex-col gap-1">{children}</div>
      <div className="overflow-hidden rounded-lg">
        <Button
          type="submit"
          label={submitText}
          fullWidth
          rounded={false}
          style="primary"
          small
          disabled={inProgress}
        />
      </div>
    </form>
  );
}
