import { Timestamp } from 'firebase/firestore';
import { Dispatch, SetStateAction } from 'react';

export type SetValShortcut<T> = Dispatch<SetStateAction<T>>;

export type ToastTypes = 'success' | 'error';

export type UserData = {
  encryptedUserKey: string;
  salt: number[];
};

export type Note = {
  id: string;
  createdAt: Timestamp;
  editedAt?: Timestamp;
  userId: string;
  title: string;
  content: string;
  listId: string;
};

export type List = {
  id: string;
  name: string;
  userId?: string;
};

export type Toast = {
  type: ToastTypes;
  title: string;
  description?: string;
  id: string;
  duration?: number;
};
