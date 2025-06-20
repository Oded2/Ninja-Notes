import { useId } from "react";

type Props = {
  type?: "email" | "password";
  label: string;
  val: string;
  setVal: (newVal: string) => void;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  children?: React.ReactNode;
};

export default function FormInput({
  type,
  label,
  val,
  setVal,
  minLength,
  maxLength,
  required,
  children: icon,
}: Props) {
  const id = useId();

  return (
    <div className="flex gap-2 rounded px-4 py-3 ring transition-shadow focus-within:ring-2">
      <label htmlFor={id}>{icon}</label>
      <input
        type={type}
        id={id}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="grow text-sm outline-none"
        placeholder={label}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
      />
    </div>
  );
}
