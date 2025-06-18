import { useId } from "react";

type Props = {
  label?: string;
  placeholder?: string;
};

export default function AddNote({ label, placeholder }: Props) {
  const id = useId();

  return (
    <div className="max-w-xl flex flex-col gap-2">
      <label className="me-auto italic font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        dir="auto"
        placeholder={placeholder}
        className="bg-slate-800 resize-none outline-none focus:ring-2 focus:ring-slate-50/30 transition-shadow p-4 rounded-2xl"
        rows={10}
      ></textarea>
    </div>
  );
}
