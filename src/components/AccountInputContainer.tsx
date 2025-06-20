import React from "react";
import Button from "./Button";

type Props = {
  handleSubmit: () => void;
  submitText: string;
  children: React.ReactNode;
};

export default function AccountInputContainer({
  handleSubmit,
  submitText,
  children,
}: Props) {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex flex-col gap-1">{children}</div>
      <div className="overflow-hidden rounded-lg">
        <Button
          type="submit"
          label={submitText}
          fullWidth
          rounded={false}
          isPrimary
          small
        />
      </div>
    </form>
  );
}
