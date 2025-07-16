import { useEffect, useId, useState } from 'react';
import Button from '@/components/Button';
import {
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useUserStore } from '@/lib/stores/userStore';
import { listsCollection, notesCollection } from '@/lib/firebase';
import { useEditStore } from '@/lib/stores/editStore';
import {
  encryptWithKey,
  findDefaultListId,
  fullTrim,
  handleError,
} from '@/lib/helpers';
import { useToastStore } from '@/lib/stores/toastStore';
import ListSelect from '@/components/ListSelect';
import { decoyListId, maxLengths } from '@/lib/constants';
import { List } from '@/lib/types';
import { useInputStore } from '@/lib/stores/inputStore';
import { PlusIcon } from '@heroicons/react/24/solid';
import { User } from 'firebase/auth';
import { useContentStore } from '@/lib/stores/contentStore';
import IconButton from '@/components//IconButton';
import clsx from 'clsx';

export default function AddNote() {
  const labelId = useId();
  const [currentList, setCurrentList] = useState<List | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const user = useUserStore((state) => state.user);
  const userKey = useUserStore((state) => state.key);
  const activeEditNote = useEditStore((state) => state.note);
  const resetEdit = useEditStore((state) => state.reset);
  const addToast = useToastStore((state) => state.add);
  const showInput = useInputStore((state) => state.showInput);
  const addNote = useContentStore((state) => state.addNote);
  const editNote = useContentStore((state) => state.editNote);
  const lists = useContentStore((state) => state.lists);
  const renameList = useContentStore((state) => state.renameList);
  const addDecoyList = useContentStore((state) => state.addDecoyList);
  const removeDecoyList = useContentStore((state) => state.removeDecoyList);

  const validate = (
    user: User | null,
    titleTrim: string,
    contentTrim: string,
  ): user is User => {
    if (!user) return false;
    if (titleTrim.length > maxLengths.title) {
      addToast(
        'error',
        'Invalid title',
        `Title cannot exceed ${maxLengths.title.toLocaleString()} characters`,
      );
      return false;
    }
    if (!contentTrim || contentTrim.length > maxLengths.content) {
      addToast(
        'error',
        'Invalid content',
        `Content cannot empty or exceed ${maxLengths.content.toLocaleString()} characters`,
      );
      return false;
    }
    return true;
  };

  const addNoteDoc = async (titleTrim: string, contentTrim: string) => {
    if (!userKey || !user) return;
    // In a situation where the user has not picked a list, then currentList will remain undefined, but the user sees the default list as selected
    let noteListId = currentList?.id ?? findDefaultListId(lists);
    if (!noteListId) {
      // This if statement shouldn't be reachable if everything works as expected
      console.error('Default list not found', noteListId, currentList);
      alert('Default list id not found');
      return;
    }
    let newList: List | undefined;
    if (noteListId === decoyListId && currentList) {
      // User has created a new list
      console.log('Adding list');
      const encryptedName = await encryptWithKey(
        fullTrim(currentList.name),
        userKey,
      );
      const { id } = await addDoc(listsCollection, {
        name: encryptedName,
        userId: user.uid,
      });
      newList = { ...currentList, id };
      noteListId = id;
    }
    const [encryptedTitle, encryptedContent, encryptedListId] =
      await Promise.all([
        encryptWithKey(titleTrim, userKey),
        encryptWithKey(contentTrim, userKey),
        encryptWithKey(noteListId, userKey),
      ]);
    if (activeEditNote) {
      const promises: Promise<void>[] = [];
      const { id } = activeEditNote;
      const docRef = doc(notesCollection, id);
      promises.push(
        updateDoc(docRef, {
          title: encryptedTitle,
          content: encryptedContent,
          listId: encryptedListId,
          editedAt: serverTimestamp(),
        }),
      );
      const deletedListId = editNote(
        id,
        {
          ...activeEditNote,
          listId: noteListId,
          editedAt: Timestamp.now(),
          title: titleTrim,
          content: contentTrim,
        },
        newList,
      );
      if (deletedListId) {
        // The user has changed the note's list, and the original list is now empty
        // deletedList will remain undefined if the default list is the now empty list
        const listDocRef = doc(listsCollection, deletedListId);
        promises.push(deleteDoc(listDocRef));
      }
      await Promise.all(promises);
      resetEdit();
    } else {
      const toAdd = {
        title: encryptedTitle,
        content: encryptedContent,
        listId: encryptedListId,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      const { id } = await addDoc(notesCollection, toAdd);
      addNote(
        {
          listId: noteListId,
          id,
          createdAt: Timestamp.now(),
          title: titleTrim,
          content: contentTrim,
        },
        newList,
      );
    }
    if (newList) {
      // Set the selected value in the list select to the new list
      setCurrentList(newList);
      // Remove the decoy list, since the new one that was just created is now there
      removeDecoyList();
    }
  };

  const handleSubmit = () => {
    const titleTrim = title ? fullTrim(title) : 'Untitled';
    const contentTrim = fullTrim(content);
    if (!validate(user, titleTrim, contentTrim)) return;
    setInProgress(true);
    addNoteDoc(titleTrim, contentTrim)
      .catch(handleError)
      .finally(() => {
        setInProgress(false);
        setTitle('');
        setContent('');
        addToast(
          'success',
          activeEditNote ? 'Note edit' : 'Note add',
          activeEditNote
            ? 'Your note has been edited successfully'
            : 'Your note has been added successfully',
        );
      });
  };

  const handleListAdd = (listName: string) => {
    // Add the list locally before adding it to firebase, in case the user changes his mind
    if (!user || !userKey) return;
    if (lists.some((list) => list.name === listName)) {
      addToast(
        'error',
        'Duplicate list',
        `You already have a list with the name: ${listName}`,
      );
      return;
    }
    const existingDecoyList = lists.find((list) => list.id === decoyListId);
    if (existingDecoyList) {
      console.log('Editing decoy list');
      // The user already added a list, but is now adding a different one
      renameList(decoyListId, listName); // Maybe: Introduce renameDecoyList function
      setCurrentList({ ...existingDecoyList, name: listName });
      return;
    }
    const decoyList = addDecoyList(listName);
    setCurrentList(decoyList);
  };

  useEffect(() => {
    return () => removeDecoyList();
  }, [removeDecoyList]);

  useEffect(() => {
    if (activeEditNote) {
      // Lists need to be read from the state, otherwise this useEffect will have to run every time a list gets added
      const { lists: stateLists } = useContentStore.getState();
      setTitle(activeEditNote.title);
      setContent(activeEditNote.content);
      const editListId = stateLists.find(
        (list) => list.id === activeEditNote.listId,
      );
      if (editListId) setCurrentList(editListId);
      else alert('Edit list id not found');
    }
  }, [activeEditNote]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="mx-auto flex w-full max-w-3xl grow flex-col gap-4"
    >
      <div className="flex flex-col-reverse gap-4 md:flex-row">
        <InputContainer>
          <label className="font-medium" htmlFor={`title-${labelId}`}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            dir="auto"
            type="text"
            id={`title-${labelId}`}
            placeholder="Could Bruce Wayne be the Batman?"
            className="grow outline-none"
            maxLength={maxLengths.title}
            disabled={inProgress}
          />
          <span className="text-xs">{`${title.length.toLocaleString()}/${maxLengths.title.toLocaleString()}`}</span>
        </InputContainer>
        <div className="flex gap-2">
          <ListSelect val={currentList} setVal={setCurrentList} />
          <IconButton
            onClick={() =>
              showInput('Enter collection name', handleListAdd, maxLengths.list)
            }
            style="neutral"
            circle
          >
            <PlusIcon className="size-5.5" />
          </IconButton>
        </div>
      </div>
      <InputContainer col>
        <label className="me-auto font-medium" htmlFor={labelId}>
          Create new note
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          id={labelId}
          dir="auto"
          placeholder="What's on your mind?"
          className="min-h-52 w-full grow resize-none outline-none"
          required
          maxLength={maxLengths.content}
          disabled={inProgress}
        />
        <div className="my-1 ms-auto gap-2 text-xs">
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
        <Button type="submit" disabled={inProgress} style="primary">
          {activeEditNote ? 'Edit' : 'Add'}
        </Button>
      </div>
    </form>
  );
}

type InputContainerProps = {
  col?: boolean;
  children: React.ReactNode;
};

function InputContainer({ col, children }: InputContainerProps) {
  return (
    <div
      className={clsx(
        'bg-base-200 ring-base-100-content/30 focus-within:ring-base-100-content flex grow flex-wrap items-center gap-2 rounded-2xl px-4 py-3 ring transition-all focus-within:ring-2',
        {
          'flex-col': col,
        },
      )}
    >
      {children}
    </div>
  );
}
