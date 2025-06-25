import clsx from "clsx";

type Props = {
  style: "neutral" | "error";
  onClick?: () => void;
  children: React.ReactNode;
};

export default function IconButton({ style, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex aspect-square h-full cursor-pointer items-center justify-center rounded-lg border-2 p-2 transition-colors *:size-4 hover:text-slate-50",
        {
          "border-rose-500 text-rose-500 hover:bg-rose-500": style === "error",
          "border-cyan-700 text-cyan-700 hover:bg-cyan-700":
            style === "neutral",
        },
      )}
    >
      {children}
    </button>
  );
}
