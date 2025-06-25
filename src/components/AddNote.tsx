import { useEffect, useId, useMemo, useState } from "react";
import Button from "./Button";
import InputContainer from "./InputContainer";
import {
  addDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useUserStore } from "@/lib/stores/userStore";
import { listsCollection, notesCollection } from "@/lib/firebase";
import { useEditStore } from "@/lib/stores/editStore";
import { encryptWithKey, fullTrim, handleError } from "@/lib/helpers";
import { useToastStore } from "@/lib/stores/toastStore";
import ListSelect from "./ListSelect";
import { defaultListName, maxLengths } from "@/lib/constants";
import { List } from "@/lib/types";
import { useInputStore } from "@/lib/stores/inputStore";
import { PlusIcon } from "@heroicons/react/24/solid";
import { User } from "firebase/auth";
import { useNotesStore } from "@/lib/stores/notesStore";
import { useListsStore } from "@/lib/stores/listsStore";

type Props = {
  userKey: CryptoKey;
};

export default function AddNote({ userKey }: Props) {
  const id = useId();
  const [currentList, setCurrentList] = useState<List | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);
  const activeEditNote = useEditStore((state) => state.note);
  const resetEdit = useEditStore((state) => state.reset);
  const addToast = useToastStore((state) => state.add);
  const showInput = useInputStore((state) => state.showInput);
  const addNote = useNotesStore((state) => state.add);
  const editNote = useNotesStore((state) => state.edit);
  const lists = useListsStore((state) => state.lists);
  const addList = useListsStore((state) => state.add);
  const defaultListId = useMemo(
    () => lists.find((list) => list.name === defaultListName)?.id,
    [lists],
  );

  const handleSubmit = async () => {
    setInProgress(true);
    const titleTrim = fullTrim(title);
    const contentTrim = fullTrim(content);
    if (!validate(user, titleTrim, contentTrim)) return;
    const encryptedTitle = await encryptWithKey(titleTrim, userKey);
    const encryptedContent = await encryptWithKey(contentTrim, userKey);
    const listId = currentList?.id ?? defaultListId;
    if (!listId) {
      alert("Cannot find default list ID");
      setInProgress(false);
      return;
    }
    const func = async () => {
      if (activeEditNote) {
        const { id } = activeEditNote;
        const docRef = doc(notesCollection, id);
        const toEdit = {
          title: encryptedTitle,
          content: encryptedContent,
          listId: listId,
          editedAt: serverTimestamp(),
        };
        await updateDoc(docRef, toEdit);
        editNote(id, {
          ...activeEditNote,
          ...toEdit,
          editedAt: Timestamp.now(),
          title: titleTrim,
          content: contentTrim,
        });
        resetEdit();
      } else {
        const toAdd = {
          title: encryptedTitle,
          content: encryptedContent,
          listId: listId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        const { id } = await addDoc(notesCollection, toAdd);
        addNote({
          ...toAdd,
          id,
          createdAt: Timestamp.now(),
          title: titleTrim,
          content: contentTrim,
        });
      }
    };
    func()
      .catch(handleError)
      .finally(() => {
        setInProgress(false);
        setTitle("");
        setContent("");
        addToast("success", "Note added", undefined, 2000);
      });
  };

  const validate = (
    user: User | null,
    titleTrim: string,
    contentTrim: string,
  ): user is User => {
    if (!user) return false;
    if (titleTrim.length > maxLengths.title) {
      addToast(
        "error",
        "Invalid title",
        `Title cannot exceed ${maxLengths.title.toLocaleString()} characters`,
      );
      return false;
    }
    if (!contentTrim || contentTrim.length > maxLengths.content) {
      addToast(
        "error",
        "Invalid content",
        `Content cannot empty or exceed ${maxLengths.content.toLocaleString()} characters`,
      );
      return false;
    }
    return true;
  };

  const handleListAdd = async (listName: string) => {
    if (lists.some((list) => list.name === listName)) {
      addToast("error", "Duplicate list");
      return;
    }
    const encryptedName = await encryptWithKey(listName, userKey);
    const { id } = await addDoc(listsCollection, {
      name: encryptedName,
      userId: user?.uid,
    });
    const newList: List = {
      name: listName,
      id,
    };
    addList(newList);
    setCurrentList(newList);
  };

  useEffect(() => {
    if (activeEditNote) {
      setTitle(activeEditNote.title);
      setContent(activeEditNote.content);
      const editListId = lists.find(
        (list) => list.id === activeEditNote.listId,
      );
      if (editListId) setCurrentList(editListId);
      else alert("Edit list id not found");
    }
  }, [activeEditNote, lists]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
    >
      <div className="flex gap-2">
        <ListSelect val={currentList} setVal={setCurrentList} />
        <button
          type="button"
          onClick={() =>
            showInput(
              "Enter collection name",
              handleListAdd,
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
          {activeEditNote && (
            <button
              type="button"
              onClick={resetEdit}
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
          label={activeEditNote ? "Edit" : "Add"}
          style="primary"
        />
      </div>
    </form>
  );
}
