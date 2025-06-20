import { useEffect, useId, useState } from "react";
import Button from "./Button";
import { useEditNoteStore, useNoteStore } from "@/lib/stores/noteStore";
import InputContainer from "./InputContainer";

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
  const add = useNoteStore((state) => state.addNote);
  const edit = useNoteStore((state) => state.editNote);
  const editNote = useEditNoteStore((state) => state.note);
  const reset = useEditNoteStore((state) => state.reset);
  const handleSubmit = () => {
    setTitle("");
    setContent("");
    const titeTrim = title?.trim();
    const contentTrim = content?.trim();
    if (editNote) {
      edit(editNote.id, titeTrim, contentTrim);
      reset();
    } else add(titeTrim, contentTrim);
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
        <label className="font-medium italic" htmlFor={`title-${id}`}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          id={`title-${id}`}
          placeholder="Evidence that Batman is Bruce Wayne"
          className="grow outline-none"
          maxLength={max.title}
        />
        <span className="text-xs">{`${title.length.toLocaleString()}/${max.title.toLocaleString()}`}</span>
      </InputContainer>
      <InputContainer>
        <label className="font-medium italic" htmlFor={id}>
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
