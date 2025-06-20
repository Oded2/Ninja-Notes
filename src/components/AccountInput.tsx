import { useId } from "react";

type Props = {
  label: string;
  val: string;
  setVal: (newVal: string) => void;
  type?: "email" | "password";
  placeholder?: string;
};

export default function AccountInput({
  label,
  val,
  setVal,
  type,
  placeholder,
}: Props) {
  const id = useId();

  return (
    <>
      <label htmlFor={id} className="text-sm font-medium text-slate-950/80">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="rounded px-4 py-2 text-sm ring ring-slate-950/70 transition-shadow outline-none focus:ring-2"
        placeholder={placeholder}
        required
      />
    </>
  );
}
