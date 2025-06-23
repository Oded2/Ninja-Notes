import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

type Props = {
  open: boolean;
  children: React.ReactNode;
};

export default function Collapse({ open, children }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [resizeSwitch, setResizeSwitch] = useState(false);

  useEffect(() => {
    const { current } = innerRef;
    if (current) setContentHeight(current.scrollHeight);
  }, [resizeSwitch]);

  useEffect(() => {
    const func = () => setResizeSwitch((state) => !state);
    window.addEventListener("resize", func);
    return () => window.removeEventListener("resize", func);
  }, []);

  return (
    <motion.div
      initial={open}
      animate={{ height: open ? contentHeight : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}
