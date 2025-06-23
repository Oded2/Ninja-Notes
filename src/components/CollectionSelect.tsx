import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";
import { defaultCollection } from "@/lib/constants";
import { useInputStore } from "@/lib/stores/inputStore";
import { PlusIcon } from "@heroicons/react/24/solid";

type Props = {
  collections: string[];
  setCollections: Dispatch<SetStateAction<string[]>>;
  val: string;
  setVal: (newVal: string) => void;
};

export default function CollectionSelect({
  collections,
  setCollections,
  val,
  setVal,
}: Props) {
  const showInput = useInputStore((state) => state.showInput);

  const onAdd = (collectionName: string) => {
    setVal(collectionName);
    setCollections((state) => [...state, collectionName]);
  };

  return (
    <div className="flex gap-2">
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
      <button
        type="button"
        onClick={() => showInput("Enter collection name", onAdd)}
        className="my-auto cursor-pointer rounded-full bg-gray-300 p-1.5 text-slate-900 transition-opacity hover:bg-gray-300/90 active:bg-gray-300/80"
      >
        <PlusIcon className="size-6" />
      </button>
    </div>
  );
}
