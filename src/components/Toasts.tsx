import { useToastStore } from '@/lib/stores/toastStore';
import { Toast } from '@/lib/types';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function Toasts() {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <div className="fixed bottom-5 left-1/2 flex w-full -translate-x-1/2 flex-col gap-4 px-5 sm:left-5 sm:w-auto sm:-translate-x-0 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

type ToastProps = { toast: Toast };

function ToastComponent({ toast }: ToastProps) {
  const { duration, id, description } = toast;
  const remove = useToastStore((state) => state.remove);
  useEffect(() => {
    console.log('Toast mount');
    if (!duration) return;
    const timeout = setTimeout(() => remove(id), duration + 50);
    return () => clearTimeout(timeout);
  }, [duration, id, remove]);
  return (
    <motion.div
      layout
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className={clsx(
        'relative flex flex-col rounded-xl px-5 py-3 text-white sm:min-w-sm',
        {
          'bg-emerald-500': toast.type === 'success',
          'bg-rose-500': toast.type === 'error',
        },
      )}
    >
      <span className="text-lg font-semibold">{toast.title}</span>
      {description && <span className="font-light">{description}</span>}
      {duration && (
        <div className="mt-2 h-3 w-full overflow-hidden rounded-2xl border">
          <motion.div
            className="bg-base-content h-full"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      )}
      <button
        onClick={() => remove(id)}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 cursor-pointer rounded-full transition-opacity hover:opacity-70 active:opacity-60"
      >
        <XCircleIcon className="size-6" />
      </button>
    </motion.div>
  );
}
