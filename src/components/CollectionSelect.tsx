import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { defaultCollection } from "@/lib/constants";
import { SetValShortcut } from "@/lib/types";

type Props = {
  collections: string[];
  val: string;
  setVal: SetValShortcut<string>;
};

export default function CollectionSelect({ collections, val, setVal }: Props) {
  return (
    <div className="relative grow">
      <select
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full appearance-none rounded-2xl border-2 border-slate-950/0 bg-gray-100 px-4 py-2 ring ring-slate-950/20 transition-all outline-none focus:border-slate-950 focus:ring-0"
      >
        <option value={defaultCollection}>Default collection</option>
        {collections
          .filter((value) => value !== defaultCollection)
          .map((value, index) => (
            <option key={index} value={value}>
              {value}
            </option>
          ))}
      </select>
      <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        <ChevronDownIcon className="size-4" />
      </div>
    </div>
  );
}
