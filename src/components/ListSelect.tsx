import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { defaultListLabel, defaultListName } from '@/lib/constants';
import { List, SetValShortcut } from '@/lib/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContentStore } from '@/lib/stores/contentStore';
import { findDefaultListId } from '@/lib/helpers';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const allListsLabel = 'All Collections';

type Props = {
  val: List | undefined;
  setVal: SetValShortcut<List | undefined>;
  allowAll?: boolean;
};

export default function ListSelect({ val, setVal, allowAll }: Props) {
  const lists = useContentStore((state) => state.lists);
  const defaultListId = useMemo(() => findDefaultListId(lists), [lists]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedLists = useMemo(() => {
    return lists
      .filter((list) => list.name !== defaultListName)
      .toSorted((a, b) => {
        const al = a.name.toLowerCase();
        const bl = b.name.toLowerCase();
        if (al === bl) return a < b ? -1 : 1;
        return al < bl ? -1 : 1;
      });
  }, [lists]);

  const dropdownLabel = useMemo(() => {
    if (!val) return allowAll ? allListsLabel : defaultListLabel;
    return val.name === defaultListName ? defaultListLabel : val.name;
  }, [val, allowAll]);

  const setValWithId = useCallback(
    (id?: string) => {
      if (id) {
        const list = lists.find((list) => list.id === id);
        setVal(list);
      } else {
        setVal(undefined);
      }
      setShowDropdown(false);
    },
    [lists, setVal],
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (e.target instanceof Node && !containerRef.current?.contains(e.target)) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const onDefaultClick = useCallback(
    () => setValWithId(defaultListId),
    [defaultListId, setValWithId],
  );
  const onAllClick = useCallback(() => setValWithId(), [setValWithId]);

  return (
    <div ref={containerRef} className="relative min-w-3xs grow lg:grow-0">
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="bg-base-200 ring-base-100-content/30 flex h-full w-full cursor-pointer items-center rounded-2xl px-4 py-2 ring select-none"
      >
        <span className="truncate">{dropdownLabel}</span>
        <ChevronDownIcon className="pointer-events-none ms-auto size-4" />
      </button>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.125 }}
            className="ring-base-100-content/30 absolute top-full z-10 mt-2 flex max-h-[60svh] w-full flex-col overflow-auto rounded-xl shadow-lg ring"
          >
            {allowAll && (
              <MemoizedOptionButton
                title={allListsLabel}
                onClick={onAllClick}
              />
            )}
            {defaultListId && (
              <MemoizedOptionButton
                title={defaultListLabel}
                onClick={onDefaultClick}
              />
            )}
            {sortedLists.map((list) => (
              <MemoizedOptionButton
                key={list.id}
                title={list.name}
                onClick={() => setValWithId(list.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type OptionButtonProps = {
  title: string;
  onClick: () => void;
};

const OptionButton = ({ title, onClick }: OptionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="hover:bg-secondary active:bg-secondary-light hover:text-primary-content active:text-primary-content bg-base-300 cursor-pointer overflow-auto px-8 py-2 text-start whitespace-nowrap brightness-95 transition-colors duration-75 hover:brightness-100 active:brightness-100"
  >
    {title}
  </button>
);

const MemoizedOptionButton = React.memo(OptionButton);
