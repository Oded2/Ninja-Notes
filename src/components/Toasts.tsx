import { useToastStore } from "@/lib/stores/toastStore";
import { Toast } from "@/lib/types";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/outline";

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
  const { duration } = toast;
  const [durationLeft, setDurationLeft] = useState(duration ?? 0);
  const remove = useToastStore((state) => state.remove);
  const { id } = toast;
  useEffect(() => {
    console.log("Toast mount");
    if (duration) {
      const interval = setInterval(
        () => setDurationLeft((state) => state - 10),
        10,
      );
      setTimeout(() => {
        clearInterval(interval);
        remove(id);
      }, duration + 50);
    }
  }, [duration, remove, id]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", duration: 0.3 }}
      className={clsx(
        "relative flex flex-col rounded-xl px-5 py-3 text-white sm:min-w-sm",
        {
          "bg-emerald-500": toast.type === "success",
          "bg-rose-500": toast.type === "error",
        },
      )}
    >
      <span className="text-lg font-semibold">{toast.title}</span>
      <span className="font-light">{toast.content}</span>
      {duration && (
        <div className="mt-2 h-3 w-full overflow-hidden rounded-2xl border">
          <div
            className="h-full bg-gray-50"
            style={{ width: `${(durationLeft / duration) * 100}%` }}
          />
        </div>
      )}
      <button
        onClick={() => remove(id)}
        className="absolute top-2 right-2 cursor-pointer rounded-full transition-opacity hover:opacity-70 active:opacity-60"
      >
        <XCircleIcon className="size-6" />
      </button>
    </motion.div>
  );
}
