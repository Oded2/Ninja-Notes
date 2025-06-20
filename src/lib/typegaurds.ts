import { Note } from "./types";

export function firebaseAuthErrorTypeGaurd(
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

export function noteTypeGaurd(obj: unknown): obj is Note {
  if (typeof obj !== "object" || obj === null) return false;
  const note = obj as Record<string, unknown>;
  return (
    note.ref instanceof Object &&
    "id" in note.ref && // basic check that it's a Firestore DocumentReference
    typeof note.userId === "string" &&
    (note.title === undefined || typeof note.title === "string") &&
    (note.content === undefined || typeof note.content === "string")
  );
}
