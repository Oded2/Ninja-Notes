import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function InputContainer({ children }: Props) {
  return (
    <div className="bg-slate-200 flex flex-wrap items-baseline gap-2 rounded-2xl focus-within:ring focus-within:ring-slate-950/80 transition-shadow py-3 px-4 shadow-lg">
      {children}
    </div>
  );
}
