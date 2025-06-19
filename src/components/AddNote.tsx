import { useId, useState } from "react";
import Button from "./Button";
import { useNoteStore } from "@/lib/stores/noteStore";

type Props = {
  label?: string;
};

export default function AddNote({ label }: Props) {
  const max = {
    title: 100,
    content: 5000,
  };
  const id = useId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const add = useNoteStore((state) => state.addNote);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTitle("");
        setContent("");
        add(title.trim(), content.trim());
      }}
      className="max-w-xl w-full flex flex-col gap-4 mx-auto"
    >
      <div className="flex gap-2 bg-slate-800 px-4 py-3 rounded-xl focus-within:ring focus-within:ring-slate-50/30 transition-shadow">
        <label className="italic font-medium" htmlFor={`title-${id}`}>
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
      </div>
      <div className="bg-slate-800 flex flex-col gap-2 rounded-2xl focus-within:ring focus-within:ring-slate-50/30 transition-shadow py-2 px-4">
        <label className="italic font-medium" htmlFor={id}>
          {label}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          id={id}
          dir="auto"
          placeholder="What's on your mind?"
          className="resize-none outline-none"
          rows={8}
          required
          maxLength={max.content}
        ></textarea>
        <div className="my-1 flex justify-end"></div>
      </div>
      <div className="ms-auto gap-2 flex">
        <Button type="submit" label="Add" isPrimary></Button>
      </div>
    </form>
  );
}
