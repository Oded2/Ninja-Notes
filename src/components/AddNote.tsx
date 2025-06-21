import { useEffect, useId, useState } from "react";
import Button from "./Button";
import InputContainer from "./InputContainer";
import { addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/stores/userStore";
import { notesCollection } from "@/lib/firebase";
import { useEditStore } from "@/lib/stores/editStore";

type Props = {
  label?: string;
};

const max = {
  title: 100,
  content: 5000,
};

export default function AddNote({ label }: Props) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const user = useUserStore((state) => state.user);
  const editNote = useEditStore((state) => state.note);
  const reset = useEditStore((state) => state.reset);
  const handleSubmit = () => {
    if (!user) return;
    if (!user) return;
    const titeTrim = title?.trim();
    const contentTrim = content?.trim();
    if (editNote) {
      updateDoc(editNote.ref, {
        title: titeTrim,
        content: contentTrim,
      });
      reset();
    } else
      addDoc(notesCollection, {
        title: titeTrim,
        content: contentTrim,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    setTitle("");
    setContent("");
  };

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title ?? "");
      setContent(editNote.content ?? "");
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
        />
        <span className="text-xs">{`${title.length.toLocaleString()}/${max.title.toLocaleString()}`}</span>
      </InputContainer>
      <InputContainer>
        <label className="font-medium" htmlFor={id}>
          {label}
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
        <Button type="submit" label={editNote ? "Edit" : "Add"} isPrimary />
      </div>
    </form>
  );
}
