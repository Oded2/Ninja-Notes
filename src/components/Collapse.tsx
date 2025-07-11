import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  children: React.ReactNode;
};

export default function Collapse({ open, children }: Props) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: open ? 'auto' : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-x-auto overflow-y-hidden"
    >
      {children}
    </motion.div>
  );
}
