type Props = {
  onClick?: () => void;
  children: React.ReactNode;
};

export default function IconButton({ onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex aspect-square h-full cursor-pointer items-center justify-center rounded border-2 border-rose-500 p-2 text-rose-500 transition-colors *:size-4 hover:bg-rose-500 hover:text-slate-50"
    >
      {children}
    </button>
  );
}
