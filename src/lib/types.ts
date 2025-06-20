import { DocumentData, DocumentReference } from "firebase/firestore";

export type Note = {
  ref: DocumentReference<DocumentData, DocumentData>;
  userId: string;
  title?: string;
  content?: string;
};
