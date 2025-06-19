import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function InputContainer({ children }: Props) {
  return (
    <div className="bg-slate-900 flex flex-wrap gap-2 rounded-2xl focus-within:ring focus-within:ring-amber-500/80 transition-shadow py-3 px-4 shadow-lg">
      {children}
    </div>
  );
}
