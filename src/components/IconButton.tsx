import clsx from 'clsx';

type Props = {
  style: 'primary' | 'secondary' | 'neutral';
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
            style === 'primary',
          'border-secondary text-secondary enabled:hover:bg-secondary':
            style === 'secondary',
          'border-base-200-content enabled:hover:bg-base-200-content text-base-200-content':
            style === 'neutral',
        },
        circle ? 'rounded-full' : 'rounded-lg',
      )}
    >
      {children}
    </button>
  );
}
