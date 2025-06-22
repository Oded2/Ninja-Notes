import { useEffect, useId, useState } from "react";
import Button from "./Button";
import InputContainer from "./InputContainer";
import { addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/stores/userStore";
import { notesCollection } from "@/lib/firebase";
import { useEditStore } from "@/lib/stores/editStore";
import { encryptWithKey, handleError } from "@/lib/helpers";

type Props = {
  userKey: CryptoKey;
};

const max = {
  title: 100,
  content: 5000,
};

export default function AddNote({ userKey }: Props) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);
  const editNote = useEditStore((state) => state.note);
  const reset = useEditStore((state) => state.reset);
  const handleSubmit = async () => {
    if (!user) return;
    setInProgress(true);
    const titleTrim = title.trim();
    if (titleTrim.length > max.title) {
      alert(`Title cannot exceed ${max.title.toLocaleString()} characters`);
      return;
    }
    const contentTrim = content.trim();
    if (contentTrim.length > max.content) {
      alert(`Content cannot exceed ${max.content.toLocaleString()} characters`);
      return;
    }
    const encryptedTitle = await encryptWithKey(titleTrim, userKey);
    const encryptedContent = await encryptWithKey(contentTrim, userKey);
    const func = async () => {
      if (editNote) {
        await updateDoc(editNote.ref, {
          title: encryptedTitle,
          content: encryptedContent,
        });
        reset();
      } else
        await addDoc(notesCollection, {
          title: encryptedTitle,
          content: encryptedContent,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
    };
    func()
      .catch(handleError)
      .finally(() => {
        setTitle("");
        setContent("");
      });
    setInProgress(false);
  };

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
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
          maxLength={max.title}
          disabled={inProgress}
        />
        <span className="text-xs">{`${title.length.toLocaleString()}/${max.title.toLocaleString()}`}</span>
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
          maxLength={max.content}
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
          <span>{`${content.length.toLocaleString()}/${max.content.toLocaleString()}`}</span>
        </div>
      </InputContainer>
      <div className="ms-auto">
        <Button
          type="submit"
          disabled={inProgress}
          label={editNote ? "Edit" : "Add"}
          isPrimary
        />
      </div>
    </form>
  );
}
