import { Timestamp } from "firebase/firestore";
import { Note, UserData } from "./types";

export function firebaseErrorTypeGaurd(
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

export function userDataTypeGaurd(obj: unknown): obj is UserData {
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

export function noteTypeGaurd(obj: unknown): obj is Note {
  if (typeof obj !== "object" || obj === null) return false;
  const note = obj as Record<string, unknown>;
  return (
    note.ref instanceof Object &&
    "id" in note.ref && // basic check that it's a Firestore DocumentReference
    note.createdAt instanceof Timestamp &&
    typeof note.userId === "string" &&
    (note.title === undefined || typeof note.title === "string") &&
    (note.content === undefined || typeof note.content === "string")
  );
}
