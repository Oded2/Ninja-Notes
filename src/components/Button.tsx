import clsx from "clsx";

type Props = {
  style?: "primary" | "secondary" | "neutral";
  isSecondary?: boolean;
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  rounded?: boolean;
  fullWidth?: boolean;
  small?: boolean;
};

export default function Button({
  style = "neutral",
  onClick,
  label,
  type,
  disabled,
  rounded = true,
  fullWidth,
  small,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group relative cursor-pointer overflow-hidden p-1 text-slate-50 shadow disabled:cursor-default",
        {
          "bg-red-500": style === "primary",
          "bg-teal-600": style === "secondary",
          "bg-gray-600": style === "neutral",
          "rounded-xl": rounded,
          "w-full": fullWidth,
        },
      )}
    >
      <div
        className={clsx(
          "rounded-xl px-5 font-semibold transition-colors group-enabled:group-hover:bg-slate-50/10 group-enabled:active:bg-slate-100/15",
          { "py-1.5": !small, "py-1": small, "text-sm": small },
        )}
      >
        {label}
      </div>
      <div className="absolute inset-0 hidden bg-white/40 group-disabled:block" />
    </button>
  );
}
