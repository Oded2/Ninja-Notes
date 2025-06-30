type Props = {
  children: React.ReactNode;
};

export default function InputContainer({ children }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 ring ring-slate-950/20 transition-all focus-within:ring-2 focus-within:ring-slate-950">
      {children}
    </div>
  );
}
