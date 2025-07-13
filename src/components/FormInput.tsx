import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { RefObject, useId, useState } from 'react';
type Props = {
  type?: 'email' | 'password';
  label: string;
  val: string;
  setVal: (newVal: string) => void;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  showClearButton?: boolean;
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
  showClearButton,
  inputRef,
  children: icon,
}: Props) {
  const id = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="ring-base-content bg-base flex grow items-center gap-2 overflow-hidden rounded py-3 ps-4 ring transition-shadow [&:has(input:focus-visible)]:ring-2">
      {icon && (
        <label htmlFor={id} className="*:size-5">
          {icon}
        </label>
      )}
      <input
        ref={inputRef}
        type={passwordVisible ? 'text' : type}
        id={id}
        dir="auto"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="text-base-content/80 placeholder:text-base-content/50 peer min-w-0 grow pe-4 text-sm font-medium outline-none"
        placeholder={label}
        minLength={type === 'password' ? 8 : undefined}
        maxLength={type === 'password' ? 4096 : maxLength}
        required={required}
        pattern={pattern}
      />
      {type === 'password' && (
        <button
          type="button"
          className="me-4 cursor-pointer outline-none *:size-4"
          onClick={() => setPasswordVisible((prev) => !prev)}
        >
          {passwordVisible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      )}
      {showClearButton && (
        <button
          type="button"
          className="bg-error-light text-error me-4 cursor-pointer rounded px-1 py-0.5 text-xs shadow outline-none peer-placeholder-shown:hidden"
          onClick={() => setVal('')}
        >
          Clear
        </button>
      )}
    </div>
  );
}
