import clsx from "clsx";

type Props = {
  isPrimary?: boolean;
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
};

export default function Button({ isPrimary, onClick, label, type }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "p-1",
        "rounded-xl",
        "cursor-pointer",
        "active:translate-y-0.5",
        "group",
        "text-white",
        "shadow",
        {
          "bg-red-500": isPrimary,
        },
        {
          "bg-teal-600": !isPrimary,
        },
      )}
    >
      <div className="rounded-xl px-5 py-2 font-semibold transition-colors group-hover:bg-slate-50/10 active:bg-slate-100/15">
        {label}
      </div>
    </button>
  );
}
