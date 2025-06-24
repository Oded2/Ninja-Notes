import { DocumentReference, Timestamp } from "firebase/firestore";
import { List, Note, UserData } from "./types";

export function firebaseErrorTypeGuard(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export function userDataTypeGuard(obj: unknown): obj is UserData {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "encryptedUserKey" in obj &&
    "salt" in obj
  ) {
    const casted = obj as Record<string, unknown>;
    return (
      typeof casted.encryptedUserKey === "string" &&
      Array.isArray(casted.salt) &&
      casted.salt.every((item) => typeof item === "number")
    );
  }

  return false;
}

export function noteTypeGuard(obj: unknown): obj is Note {
  if (typeof obj !== "object" || obj === null) return false;
  const note = obj as Record<string, unknown>;
  return (
    typeof note.ref === "object" &&
    note.ref !== null &&
    "id" in note.ref &&
    note.createdAt instanceof Timestamp &&
    (note.editedAt === undefined || note.editedAt instanceof Timestamp) &&
    typeof note.userId === "string" &&
    typeof note.title === "string" &&
    typeof note.content === "string"
  );
}

export function listTypeGuard(obj: unknown): obj is List {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "ref" in obj &&
    "name" in obj
  ) {
    const casted = obj as Record<string, unknown>;
    return (
      casted.ref instanceof DocumentReference && typeof casted.name === "string"
    );
  }
  return false;
}
