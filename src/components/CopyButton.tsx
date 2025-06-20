import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  text: string;
};

export default function CopyButton({ text }: Props) {
  const [disabled, setDisabled] = useState(false);

  const handleCopy = () => {
    setDisabled(true);
    navigator.clipboard
      .writeText(text)
      .catch(() => alert("An error has occurred"))
      .then(() => {
        setTimeout(() => setDisabled(false), 2000);
      });
  };

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className="cursor-pointer rounded-2xl transition-opacity *:size-6 hover:opacity-70 active:opacity-60"
    >
      <AnimatePresence mode="wait" initial={false}>
        {disabled ? (
          <motion.div
            key="check"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <ClipboardDocumentCheckIcon />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <ClipboardDocumentIcon />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
