import { useEffect, useId, useState } from "react";
import Button from "./Button";

type Props = {
  label?: string;
  placeholder?: string;
};

export default function AddNote({ label, placeholder }: Props) {
  const id = useId();
  const [note, setNote] = useState("");

  return (
    <div className="max-w-xl flex flex-col gap-2">
      <label className="me-auto italic font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="bg-slate-800 flex flex-col rounded-2xl focus-within:ring focus-within:ring-slate-50/30 transition-shadow pt-4 px-4 pb-2">
        <textarea
          onInput={(e) => setNote(e.currentTarget.value)}
          id={id}
          dir="auto"
          placeholder={placeholder}
          className="resize-none outline-none"
          rows={10}
        ></textarea>
        <div className="my-1 flex justify-end">
          <Button label="Add" isPrimary></Button>
        </div>
      </div>
    </div>
  );
}
