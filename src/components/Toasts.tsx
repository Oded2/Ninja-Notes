import { useToastStore } from '@/lib/stores/toastStore';
import { Toast } from '@/lib/types';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon as XCircleIconSolid,
} from '@heroicons/react/24/solid';

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
  const { duration, id, description, type: toastType } = toast;
  const remove = useToastStore((state) => state.remove);
  useEffect(() => {
    console.log('Toast mount');
    if (!duration) return;
    const timeout = setTimeout(() => remove(id), duration + 25);
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
        'text-success-light-content relative flex max-w-md flex-col rounded-lg border-2 px-5 py-3 shadow sm:min-w-sm md:max-w-lg',
        {
          'border-success bg-success-light': toast.type === 'success',
          'border-error bg-error-light': toast.type === 'error',
        },
      )}
    >
      <div className="flex items-center gap-2">
        {toastType === 'success' && (
          <CheckCircleIcon className="text-success size-12" />
        )}
        {toastType === 'error' && (
          <XCircleIconSolid className="text-error size-12" />
        )}
        <div className="flex flex-col">
          <span className="font-medium">{toast.title}</span>
          {description && <span className="text-sm">{description}</span>}
        </div>
      </div>
      {!!duration && (
        <div
          className={clsx(
            'border-error mt-2 h-3 w-full overflow-hidden rounded border',
            {
              'border-success': toastType === 'success',
              'border-error': toastType === 'error',
            },
          )}
        >
          <motion.div
            className={clsx('h-full', {
              'bg-success': toastType === 'success',
              'bg-error': toastType === 'error',
            })}
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
