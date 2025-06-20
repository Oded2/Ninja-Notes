import React from "react";
import Button from "./Button";

type Props = {
  title: string;
  submitText: string;
  handleSubmit: () => void;
  children: React.ReactNode;
};

export default function FormInputContainer({
  title,
  submitText,
  handleSubmit,
  children,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="mx-auto flex w-full max-w-md flex-col gap-4"
    >
      <h2 className="text-center text-xl font-semibold">{title}</h2>
      {children}
      <Button type="submit" label={submitText} isPrimary />
    </form>
  );
}
