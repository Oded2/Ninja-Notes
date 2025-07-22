import { SetValShortcut } from '@/lib/types';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  val: number;
  setVal: SetValShortcut<number>;
  maxIndex: number;
};

const neighborNumbers = (num: number, max: number) => {
  const start = Math.max(0, Math.min(num - 1, max - 2));
  return [start, start + 1, start + 2];
};

export default function Pagination({ val, setVal, maxIndex }: Props) {
  // Will not work properly if maxIndex is less than or equal to 0
  // val is the index of the page (meaning that the first page is when val is 0)
  // maxIndex is the max amount of pages - 1
  const long = maxIndex > 2;
  const numArray = maxIndex <= 1 ? [0, 1] : neighborNumbers(val, maxIndex);

  useEffect(() => {
    if (val > maxIndex) {
      // The user has filtered the notes and now the amount of pages have changed
      setVal(0);
    }
  }, [val, setVal, maxIndex]);

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="pagination"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 100, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="flex"
      >
        {long && (
          <PageButton onClick={() => setVal(0)}>
            <ChevronDoubleLeftIcon />
          </PageButton>
        )}
        <PageButton
          onClick={() => {
            if (val > 0) setVal((state) => state - 1);
          }}
        >
          <ChevronLeftIcon />
        </PageButton>
        {numArray.map((p) => (
          <PageButton
            key={p}
            isPrimary={val == p}
            onClick={() => setVal(p)}
            isIcon={false}
          >
            {(p + 1).toLocaleString()}
          </PageButton>
        ))}
        <PageButton
          onClick={() => {
            if (val < maxIndex) setVal((state) => state + 1);
          }}
        >
          <ChevronRightIcon />
        </PageButton>
        {long && (
          <PageButton onClick={() => setVal(maxIndex)}>
            <ChevronDoubleRightIcon />
          </PageButton>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

type PageButtonProps = {
  isPrimary?: boolean;
  onClick: () => void;
  disabled?: boolean;
  isIcon?: boolean;
  children: React.ReactNode;
};

function PageButton({
  isPrimary,
  onClick,
  disabled,
  isIcon = true,
  children,
}: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'cursor-pointer border-y py-2 first:rounded-s first:border-s last:rounded-e last:border-e',
        {
          'border-secondary bg-secondary text-primary-content': isPrimary,
          'border-neutral bg-base-100 hover:text-primary-content active:border-secondary active:bg-secondary active:text-primary-content hover:border-secondary-light hover:bg-secondary-light':
            !isPrimary,
          'px-2 *:size-5': isIcon,
          'px-3': !isIcon,
        },
      )}
    >
      {children}
    </button>
  );
}
