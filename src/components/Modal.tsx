import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

type Props = {
  visible: boolean;
  closeFn: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ visible, closeFn, title, children }: Props) {
  useEffect(() => {
    const escapeKey = (e: KeyboardEvent) => {
      if (visible && e.key === "Escape") {
        e.preventDefault();
        closeFn();
      }
    };
    window.addEventListener("keydown", escapeKey);
    return () => window.removeEventListener("keydown", escapeKey);
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
            className="fixed inset-0 z-10 bg-black/40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-20 flex items-center justify-center"
          >
            <div className="flex min-h-40 min-w-sm flex-col rounded-lg bg-gray-50 p-5 shadow-lg">
              <h2 className="text-2xl font-bold">{title}</h2>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
