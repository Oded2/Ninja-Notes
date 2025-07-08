import clsx from 'clsx';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';

type Props = {
  style?: 'primary' | 'secondary' | 'neutral' | 'black';
  onClick?: () => void;
  href?: Url;
  externalLink?: string;
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
  externalLink,
  label,
  type,
  disabled,
  rounded = true,
  fullWidth,
  small,
}: Props) {
  const className = clsx(
    'cursor-pointer flex items-center justify-center border-4 font-semibold text-slate-50 shadow transition-colors disabled:pointer-events-none disabled:opacity-60',
    {
      'border-red-500 bg-red-500 hover:bg-red-500/90 active:bg-red-500/80':
        style === 'primary',
      'border-teal-600 bg-teal-600 hover:bg-teal-600/90 active:bg-teal-600/80':
        style === 'secondary',
      'border-gray-500 bg-gray-500 hover:bg-gray-500/90 active:bg-gray-500/80':
        style === 'neutral',
      'border-slate-900 bg-slate-900 hover:bg-slate-900/90 active:bg-slate-900/80':
        style === 'black',
      'rounded-xl': rounded,
      'w-full': fullWidth,
      'px-5 py-1.5': !small,
      'px-2 py-1 text-sm': small,
    },
  );

  if (href)
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  else if (externalLink)
    return (
      <a href={externalLink} target="_blank" className={className}>
        {label}
      </a>
    );
  else
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {label}
      </button>
    );
}
