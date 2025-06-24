import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore";
import { Dispatch, SetStateAction } from "react";

export type SetValShortcut<T> = Dispatch<SetStateAction<T>>;

export type ToastTypes = "success" | "error";

export type UserData = {
  encryptedUserKey: string;
  salt: number[];
};

export type Note = {
  ref: DocumentReference<DocumentData, DocumentData>;
  createdAt: Timestamp;
  editedAt?: Timestamp;
  userId: string;
  title: string;
  content: string;
  collection: string;
  collectionHash: string;
};

export type Toast = {
  type: ToastTypes;
  title: string;
  content: string;
  id: string;
  duration?: number;
};
