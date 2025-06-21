import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function InputContainer({ children }: Props) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 rounded-2xl bg-gray-200 px-4 py-3 shadow-lg transition-shadow focus-within:ring focus-within:ring-slate-950/80">
      {children}
    </div>
  );
}
