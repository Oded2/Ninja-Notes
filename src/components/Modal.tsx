import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  visible: boolean;
  closeFn: () => void;
  title?: string;
  handleSubmit: () => void;
  children: React.ReactNode;
};

export default function Modal({
  visible,
  closeFn,
  title,
  handleSubmit,
  children,
}: Props) {
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
            className="fixed inset-0 z-20 bg-black/40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-30 flex items-center justify-center"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="bg-base mx-5 flex min-h-40 max-w-lg flex-col rounded-lg p-5 shadow-lg sm:mx-0 sm:min-w-sm"
            >
              <h2 className="text-base-content mb-2 text-xl font-semibold">
                {title}
              </h2>
              {children}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
