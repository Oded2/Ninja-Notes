import clsx from 'clsx';

type Props = {
  style: 'neutral' | 'error' | 'white';
  onClick?: () => void;
  disabled?: boolean;
  circle?: boolean;
  children: React.ReactNode;
};

export default function IconButton({
  style,
  onClick,
  disabled,
  circle,
  children,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex aspect-square h-full items-center justify-center self-center border-2 p-2 transition-all enabled:cursor-pointer enabled:hover:text-base disabled:opacity-50',
        {
          'border-primary text-primary enabled:hover:bg-primary':
            style === 'error',
          'border-secondary text-secondary enabled:hover:bg-secondary':
            style === 'neutral',
          'border-neutral text-neutral enabled:hover:bg-neutral brightness-125':
            style === 'white',
        },
        circle ? 'rounded-full' : 'rounded-lg',
      )}
    >
      {children}
    </button>
  );
}
