import clsx from "clsx";

type Props = {
  isPrimary?: boolean;
  onClick?: () => void;
  href?: string;
  label?: string;
  type?: "button" | "submit";
};

export default function Button({
  isPrimary,
  onClick,
  href,
  label,
  type,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "group cursor-pointer rounded-xl p-1 text-white shadow active:translate-y-0.5",
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
