import { useEffect, useId, useState } from "react";
import Button from "./Button";
import InputContainer from "./InputContainer";
import { addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/stores/userStore";
import { notesCollection } from "@/lib/firebase";
import { useEditStore } from "@/lib/stores/editStore";
import { encryptWithKey, handleError, hashText } from "@/lib/helpers";
import { useToastStore } from "@/lib/stores/toastStore";
import CollectionSelect from "./CollectionSelect";
import { defaultCollection, maxLengths } from "@/lib/constants";
import { Note } from "@/lib/types";
import { useInputStore } from "@/lib/stores/inputStore";
import { PlusIcon } from "@heroicons/react/24/solid";

type Props = {
  userKey: CryptoKey;
  notes: Note[];
};

export default function AddNote({ userKey, notes }: Props) {
  const id = useId();
  const [collections, setCollections] = useState<string[]>([]);
  const [collection, setCollection] = useState(defaultCollection);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);
  const editNote = useEditStore((state) => state.note);
  const reset = useEditStore((state) => state.reset);
  const addToast = useToastStore((state) => state.add);
  const showInput = useInputStore((state) => state.showInput);

  const handleSubmit = async () => {
    if (!user) return;
    const titleTrim = title.trim();
    if (titleTrim.length > maxLengths.title) {
      addToast(
        "error",
        "Invalid title",
        `Title cannot exceed ${maxLengths.title.toLocaleString()} characters`,
      );
      return;
    }
    const contentTrim = content.trim();
    if (!contentTrim || contentTrim.length > maxLengths.content) {
      addToast(
        "error",
        "Invalid content",
        `Content cannot empty or exceed ${maxLengths.content.toLocaleString()} characters`,
      );
      return;
    }
    setInProgress(true);
    const encryptedTitle = await encryptWithKey(titleTrim, userKey);
    const encryptedContent = await encryptWithKey(contentTrim, userKey);
    const encryptedCollection = await encryptWithKey(collection, userKey);
    const collectionHash = await hashText(collection);
    const func = async () => {
      if (editNote) {
        await updateDoc(editNote.ref, {
          title: encryptedTitle,
          content: encryptedContent,
          collection: encryptedCollection,
          collectionHash,
          createdAt: serverTimestamp(),
        });
        reset();
      } else
        await addDoc(notesCollection, {
          title: encryptedTitle,
          content: encryptedContent,
          collection: encryptedCollection,
          collectionHash,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
    };
    func().catch(handleError);
    setInProgress(false);
    setTitle("");
    setContent("");
  };

  const addCollection = (collectionName: string) => {
    if (collections.includes(collectionName)) return;
    setCollections((state) => [...state, collectionName]);
    setCollection(collectionName);
  };

  useEffect(() => {
    // Remove any duplicates
    setCollections([...new Set(notes.map((note) => note.collection))]);
  }, [notes]);

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
      setCollection(editNote.collection);
    }
  }, [editNote]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
    >
      <div className="flex gap-2">
        <CollectionSelect
          collections={collections}
          val={collection}
          setVal={setCollection}
        />
        <button
          type="button"
          onClick={() =>
            showInput(
              "Enter collection name",
              addCollection,
              maxLengths.collection,
            )
          }
          className="my-auto cursor-pointer rounded-full bg-gray-300 p-1.5 text-slate-900 transition-opacity hover:bg-gray-300/90 active:bg-gray-300/80"
        >
          <PlusIcon className="size-6" />
        </button>
      </div>
      <InputContainer>
        <label className="font-medium" htmlFor={`title-${id}`}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          id={`title-${id}`}
          placeholder="Could Bruce Wayne be the Batman?"
          className="grow outline-none"
          maxLength={maxLengths.title}
          disabled={inProgress}
        />
        <span className="text-xs">{`${title.length.toLocaleString()}/${maxLengths.title.toLocaleString()}`}</span>
      </InputContainer>
      <InputContainer>
        <label className="font-medium" htmlFor={id}>
          Create new note
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          id={id}
          dir="auto"
          placeholder="What's on your mind?"
          className="w-full resize-none outline-none"
          rows={8}
          required
          maxLength={maxLengths.content}
          disabled={inProgress}
        ></textarea>
        <div className="my-1 flex grow justify-end gap-2 text-xs">
          {editNote && (
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer hover:underline"
            >
              Cancel edit
            </button>
          )}
          <span>{`${content.length.toLocaleString()}/${maxLengths.content.toLocaleString()}`}</span>
        </div>
      </InputContainer>
      <div className="ms-auto">
        <Button
          type="submit"
          disabled={inProgress}
          label={editNote ? "Edit" : "Add"}
          style="primary"
        />
      </div>
    </form>
  );
}
