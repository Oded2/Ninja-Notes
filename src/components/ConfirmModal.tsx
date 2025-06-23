import { useConfirmStore } from "@/lib/stores/confirmStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function ConfirmModal() {
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const content = useConfirmStore((state) => state.content);
  const [inProgress, setInProgress] = useState(false);

  const handleConfirm = () => {
    if (!content) return;
    setInProgress(true);
    content.callback().then(() => {
      closeConfirm();
      setInProgress(false);
    });
  };

  useEffect(() => {
    const escapeKey = (e: KeyboardEvent) => {
      if (content && e.key === "Escape") {
        e.preventDefault();
        closeConfirm();
      }
    };
    window.addEventListener("keydown", escapeKey);
    return () => window.removeEventListener("keydown", escapeKey);
  }, [content, closeConfirm]);

  return (
    <AnimatePresence>
      {content && (
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-40 min-w-sm flex-col rounded-lg bg-gray-50 p-5 shadow-lg">
              <h2 className="text-2xl font-medium">{content.title}</h2>
              <span className="text-slate-950/80">{content.description}</span>
              <div className="flex grow items-end justify-end gap-2">
                <Button
                  label="Cancel"
                  style="neutral"
                  small
                  onClick={closeConfirm}
                />
                <Button
                  label="Confirm"
                  small
                  style="primary"
                  onClick={handleConfirm}
                  disabled={inProgress}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
