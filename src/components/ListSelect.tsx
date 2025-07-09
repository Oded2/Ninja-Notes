import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { defaultListName } from '@/lib/constants';
import { List, SetValShortcut } from '@/lib/types';
import { useId, useMemo } from 'react';
import { useContentStore } from '@/lib/stores/contentStore';
import { findDefaultListId } from '@/lib/helpers';

type Props = {
  val: List | undefined;
  setVal: SetValShortcut<List | undefined>;
  allowAll?: boolean;
};

export default function ListSelect({ val, setVal, allowAll }: Props) {
  const allId = useId();
  const lists = useContentStore((state) => state.lists);
  const defaultListId = useMemo(() => findDefaultListId(lists), [lists]);

  return (
    <div className="relative grow">
      <select
        value={val?.id ?? allId}
        onChange={({ target: { value: listRefId } }) => {
          const selectedList = lists.find((list) => list.id === listRefId);
          setVal(selectedList);
        }}
        className="bg-base-100 border-neutral/0 ring-neutral/20 focus:border-neutral w-full appearance-none rounded-2xl border-2 px-4 py-2 ring transition-all outline-none focus:ring-0"
      >
        {/* All values are the id of the collection */}
        {allowAll && <option value={allId}>All collections</option>}
        {defaultListId && (
          <option value={defaultListId}>Default collection</option>
        )}
        {lists
          .filter((value) => value.name !== defaultListName)
          .toSorted((a, b) => {
            const al = a.name.toLowerCase();
            const bl = b.name.toLowerCase();
            if (al === bl) return a < b ? -1 : 1; // Uppercase first if same letter
            return al < bl ? -1 : 1;
          })
          .map((value, index) => (
            <option key={index} value={value.id}>
              {value.name}
            </option>
          ))}
      </select>
      <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        <ChevronDownIcon className="size-4" />
      </div>
    </div>
  );
}
