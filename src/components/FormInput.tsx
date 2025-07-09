import { RefObject, useId } from 'react';

type Props = {
  type?: 'email' | 'password';
  label: string;
  val: string;
  setVal: (newVal: string) => void;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  children?: React.ReactNode;
};

export default function FormInput({
  type,
  label,
  val,
  setVal,
  required,
  maxLength,
  pattern,
  inputRef,
  children: icon,
}: Props) {
  const id = useId();

  return (
    <div className="flex grow items-center gap-2 rounded px-4 py-3 ring transition-shadow focus-within:ring-2">
      {icon && (
        <label htmlFor={id} className="*:size-5">
          {icon}
        </label>
      )}
      <input
        ref={inputRef}
        type={type}
        id={id}
        dir="auto"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="grow text-sm font-medium text-slate-950/80 outline-none"
        placeholder={label}
        minLength={type === 'password' ? 8 : maxLength}
        maxLength={type === 'password' ? 4096 : maxLength}
        required={required}
        pattern={pattern}
      />
    </div>
  );
}
