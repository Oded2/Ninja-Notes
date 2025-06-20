import clsx from "clsx";

type Props = {
  isPrimary?: boolean;
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  isPrimary,
  onClick,
  label,
  type,
  disabled,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group relative cursor-pointer overflow-hidden rounded-xl p-1 text-white shadow disabled:cursor-default",
        {
          "bg-red-500": isPrimary,
        },
        {
          "bg-teal-600": !isPrimary,
        },
      )}
    >
      <div className="rounded-xl px-5 py-2 text-sm font-semibold transition-colors group-enabled:group-hover:bg-slate-50/10 group-enabled:active:bg-slate-100/15">
        {label}
      </div>
      <div className="absolute inset-0 hidden bg-white/40 group-disabled:block" />
    </button>
  );
}
