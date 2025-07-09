import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  visible: boolean;
  closeFn: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ visible, closeFn, title, children }: Props) {
  useEffect(() => {
    const escapeKey = (e: KeyboardEvent) => {
      if (visible && e.key === 'Escape') {
        e.preventDefault();
        closeFn();
      }
    };
    window.addEventListener('keydown', escapeKey);
    return () => window.removeEventListener('keydown', escapeKey);
  }, [visible, closeFn]);
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center"
          >
            <div className="mx-5 flex min-h-40 flex-col rounded-lg bg-gray-50 p-5 shadow-lg sm:mx-0 sm:min-w-sm">
              <h2 className="text-xl font-semibold">{title}</h2>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
