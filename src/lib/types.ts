import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore";

export type UserData = {
  encryptedUserKey: string;
  salt: number[];
};

export type Note = {
  ref: DocumentReference<DocumentData, DocumentData>;
  createdAt: Timestamp;
  userId: string;
  title: string;
  content: string;
};
