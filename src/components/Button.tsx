import clsx from 'clsx';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';

type Props = {
  style?: 'primary' | 'secondary' | 'neutral' | 'black';
  onClick?: () => void;
  href?: Url;
  externalLink?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  small?: boolean;
  children: React.ReactNode;
};

export default function Button({
  style = 'neutral',
  onClick,
  href,
  externalLink,
  type,
  disabled,
  fullWidth,
  small,
  children,
}: Props) {
  const className = clsx(
    'cursor-pointer relative flex items-center justify-center border-4 font-semibold text-primary-content shadow transition-colors disabled:pointer-events-none disabled:opacity-60',
    {
      'border-primary bg-primary hover:bg-primary/90 active:bg-primary/80':
        style === 'primary',
      'border-secondary bg-secondary hover:bg-secondary/90 active:bg-secondary/80':
        style === 'secondary',
      'border-neutral bg-neutral hover:bg-neutral/90 active:bg-neutral/80':
        style === 'neutral',
      'border-black bg-black hover:bg-black/90 active:bg-black/80':
        style === 'black',
      'w-full': fullWidth,
      'px-5 py-1.5 rounded-xl': !small,
      'px-2 py-1 text-sm rounded': small,
    },
  );

  if (href)
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  else if (externalLink)
    return (
      <a href={externalLink} target="_blank" className={className}>
        {children}
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
        {children}
      </button>
    );
}
