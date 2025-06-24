import { RefObject, useId } from "react";

type Props = {
  label?: string;
  val: string;
  setVal: (newVal: string) => void;
  type?: "email" | "password";
  placeholder?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  maxLength?: number;
};

export default function AccountInput({
  label,
  val,
  setVal,
  type,
  placeholder,
  inputRef,
  maxLength,
}: Props) {
  const id = useId();

  return (
    <>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-950/80">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={inputRef}
        id={id}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="rounded px-4 py-2 text-sm font-medium text-slate-950/80 ring ring-slate-950/70 transition-shadow outline-none focus:ring-2"
        placeholder={placeholder}
        required
        minLength={type === "password" ? 8 : undefined}
        maxLength={type === "password" ? 4096 : maxLength}
      />
    </>
  );
}
