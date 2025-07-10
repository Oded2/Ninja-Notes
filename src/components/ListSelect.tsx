import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { defaultListName } from '@/lib/constants';
import { List, SetValShortcut } from '@/lib/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useContentStore } from '@/lib/stores/contentStore';
import { findDefaultListId } from '@/lib/helpers';

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
  const [dropdownLabel, setDropdownLabel] = useState('');

  const setValWithId = (id?: string) => {
    if (id) {
      const list = lists.find((list) => list.id === id);
      setVal(list);
    } else {
      // User is filtering to all lists
      setVal(undefined);
    }
    setShowDropdown(false);
  };

  useEffect(() => {
    const name =
      val?.name === defaultListName ? 'Default collection' : val?.name;
    setDropdownLabel(name ?? (allowAll ? allListsLabel : 'Default collection'));
  }, [val, allowAll]);

  const handleClickOutside = (e: MouseEvent) => {
    const { target } = e;
    if (target instanceof Node && !containerRef.current?.contains(target))
      setShowDropdown(false);
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative grow">
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="bg-base-100 ring-neutral/50 flex h-full w-full cursor-pointer items-center rounded-2xl px-4 py-2 ring select-none"
      >
        <span>{dropdownLabel}</span>
      </button>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
      {showDropdown && (
        <div className="ring-neutral/50 absolute top-full mt-2 flex max-h-60 w-full flex-col overflow-auto rounded-2xl ring md:max-h-100">
          {allowAll && (
            <OptionButton
              title="All collections"
              onClick={() => setValWithId()}
            />
          )}
          {defaultListId && (
            <OptionButton
              title="Default collection"
              onClick={() => setValWithId(defaultListId)}
            />
          )}
          {lists
            .filter((value) => value.name !== defaultListName)
            .toSorted((a, b) => {
              const al = a.name.toLowerCase();
              const bl = b.name.toLowerCase();
              if (al === bl) return a < b ? -1 : 1; // Uppercase first if same letter
              return al < bl ? -1 : 1;
            })
            .map((value) => (
              <OptionButton
                key={value.id}
                title={value.name}
                onClick={() => setValWithId(value.id)}
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

function OptionButton({ title, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-secondary hover:text-primary-content bg-base-200 cursor-pointer px-8 py-2 text-start brightness-95 transition-colors duration-75 hover:brightness-100"
    >
      {title}
    </button>
  );
}
