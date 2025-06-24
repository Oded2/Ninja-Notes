type Props = {
  tip: string;
  children: React.ReactNode;
};

export default function Tooltip({ tip, children }: Props) {
  return (
    <div className="relative">
      <div className="peer">{children}</div>
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 scale-80 rounded bg-slate-900 px-2 py-1 whitespace-nowrap text-slate-50 opacity-0 shadow transition-all peer-hover:scale-100 peer-hover:opacity-100">
        {tip}
      </div>
    </div>
  );
}
