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
        "bg-gradient-to-r",
        "p-1",
        "rounded-xl",
        "cursor-pointer",
        "active:translate-y-0.5",
        "group",
        {
          "from-pink-800": isPrimary,
          "to-pink-600": isPrimary,
        },
        {
          "from-cyan-950": !isPrimary,
          "to-teal-900": !isPrimary,
        }
      )}
    >
      <div className="group-hover:bg-slate-50/5 active:bg-slate-100/10 transition-colors py-2 px-5 rounded-xl font-semibold">
        {label}
      </div>
    </button>
  );
}
