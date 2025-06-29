import clsx from 'clsx';

type Props = {
  style?: 'primary' | 'secondary' | 'neutral';
  onClick?: () => void;
  label?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  rounded?: boolean;
  fullWidth?: boolean;
  small?: boolean;
};

export default function Button({
  style = 'neutral',
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
        'border-4 px-5 font-semibold text-slate-50 shadow transition-colors enabled:cursor-pointer disabled:opacity-60',
        {
          'border-red-500 bg-red-500 enabled:hover:bg-red-500/90 enabled:active:bg-red-500/80':
            style === 'primary',
          'border-teal-600 bg-teal-600 enabled:hover:bg-teal-600/90 enabled:active:bg-teal-600/80':
            style === 'secondary',
          'border-gray-500 bg-gray-500 enabled:hover:bg-gray-500/90 enabled:active:bg-gray-500/80':
            style === 'neutral',
          'rounded-xl': rounded,
          'w-full': fullWidth,
          'py-1.5': !small,
          'py-1': small,
        },
      )}
    >
      {label}
    </button>
  );
}
