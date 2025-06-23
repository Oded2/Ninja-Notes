import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction, useId } from "react";
import Button from "./Button";
import { defaultCollection } from "@/lib/constants";
import { useInputStore } from "@/lib/stores/inputStore";

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
  const id = useId();
  const showInput = useInputStore((state) => state.showInput);

  const onAdd = (collectionName: string) => {
    setVal(collectionName);
    setCollections((state) => [...state, collectionName]);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium" htmlFor={id}>
        Select Collection
      </label>
      <div className="flex gap-2">
        <div className="relative grow">
          <select
            id={id}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full appearance-none rounded-2xl border-2 border-slate-950/0 bg-gray-100 px-4 py-2 ring ring-slate-950/20 transition-all outline-none focus:border-slate-950 focus:ring-0"
          >
            <option value={defaultCollection}>Default</option>
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
        <Button
          type="button"
          style="neutral"
          label="New"
          onClick={() => showInput("Enter collection name", onAdd)}
        />
      </div>
    </div>
  );
}
