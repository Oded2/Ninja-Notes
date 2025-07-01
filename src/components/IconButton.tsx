import clsx from 'clsx';

type Props = {
  style: 'neutral' | 'error';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export default function IconButton({
  style,
  onClick,
  disabled,
  children,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex aspect-square h-full items-center justify-center rounded-lg border-2 p-2 transition-all *:size-4 enabled:cursor-pointer enabled:hover:text-slate-50 disabled:opacity-50',
        {
          'border-rose-500 text-rose-500 enabled:hover:bg-rose-500':
            style === 'error',
          'border-cyan-700 text-cyan-700 enabled:hover:bg-cyan-700':
            style === 'neutral',
        },
      )}
    >
      {children}
    </button>
  );
}
