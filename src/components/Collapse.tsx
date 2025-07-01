import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  children: React.ReactNode;
};

export default function Collapse({ open, children }: Props) {
  return (
    <motion.div
      animate={{
        height: open ? 'auto' : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
