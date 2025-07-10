import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { defaultListName } from '@/lib/constants';
import { List, SetValShortcut } from '@/lib/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContentStore } from '@/lib/stores/contentStore';
import { findDefaultListId } from '@/lib/helpers';
import React from 'react';

const defaultCollectionLabel = 'Default Collection';
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
    if (!val) return allowAll ? allListsLabel : defaultCollectionLabel;
    return val.name === defaultListName ? defaultCollectionLabel : val.name;
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
    <div ref={containerRef} className="relative grow">
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="bg-base-100 ring-neutral/50 flex h-full w-full cursor-pointer items-center rounded-2xl px-4 py-2 ring select-none"
      >
        <span>{dropdownLabel}</span>
        <ChevronDownIcon className="pointer-events-none ml-auto size-4" />
      </button>

      {showDropdown && (
        <div className="ring-neutral/50 bg-base-200 absolute top-full z-50 mt-2 flex max-h-60 w-full flex-col overflow-auto rounded-2xl ring md:max-h-100">
          {allowAll && (
            <MemoizedOptionButton title={allListsLabel} onClick={onAllClick} />
          )}
          {defaultListId && (
            <MemoizedOptionButton
              title={defaultCollectionLabel}
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
        </div>
      )}
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
    className="hover:bg-secondary hover:text-primary-content bg-base-200 cursor-pointer px-8 py-2 text-start brightness-95 transition-colors duration-75 hover:brightness-100"
  >
    {title}
  </button>
);

const MemoizedOptionButton = React.memo(OptionButton);
