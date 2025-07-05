import clsx from 'clsx';
import Link from 'next/link';

type Props = {
  style?: 'primary' | 'secondary' | 'neutral' | 'black';
  onClick?: () => void;
  href?: string;
  newTab?: boolean;
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
  href,
  newTab,
  label,
  type,
  disabled,
  rounded = true,
  fullWidth,
  small,
}: Props) {
  return (
    <>
      {href ? (
        <Link
          href={href}
          target={newTab ? '_blank' : undefined}
          className="group"
        >
          <ButtonDisplay
            style={style}
            rounded={rounded}
            fullWidth={fullWidth}
            small={small}
            label={label}
          />
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className="group"
        >
          <ButtonDisplay
            style={style}
            rounded={rounded}
            fullWidth={fullWidth}
            small={small}
            label={label}
          />
        </button>
      )}
    </>
  );
}

function ButtonDisplay({ style, rounded, fullWidth, small, label }: Props) {
  return (
    <div
      className={clsx(
        'border-4 px-5 font-semibold text-slate-50 shadow transition-colors group-enabled:cursor-pointer group-disabled:opacity-60',
        {
          'border-red-500 bg-red-500 group-enabled:hover:bg-red-500/90 group-enabled:active:bg-red-500/80':
            style === 'primary',
          'border-teal-600 bg-teal-600 group-enabled:hover:bg-teal-600/90 group-enabled:active:bg-teal-600/80':
            style === 'secondary',
          'border-gray-500 bg-gray-500 group-enabled:hover:bg-gray-500/90 group-enabled:active:bg-gray-500/80':
            style === 'neutral',
          'border-slate-900 bg-slate-900 group-enabled:hover:bg-slate-900/90 group-enabled:active:bg-slate-900/80':
            style === 'black',
          'rounded-xl': rounded,
          'w-full': fullWidth,
          'py-1.5': !small,
          'py-1': small,
        },
      )}
    >
      {label}
    </div>
  );
}
