import { Bytes, Timestamp } from 'firebase/firestore';
import { EncryptedField, List, Note, UserData } from './types';

function objectTypeGuard(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

export function firebaseErrorTypeGuard(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export function encryptedFieldTypeGuard(obj: unknown): obj is EncryptedField {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'iv' in obj &&
    'data' in obj &&
    obj.iv instanceof Bytes &&
    obj.data instanceof Bytes
  ) {
    return true;
  }
  return false;
}

export function noteTypeGuard(obj: unknown): obj is Note {
  if (!objectTypeGuard(obj)) return false;

  if (typeof obj.id !== 'string') return false;
  if (!(obj.createdAt instanceof Timestamp)) return false;

  const isOptString = (val: unknown): val is string | undefined =>
    typeof val === 'string' || val === undefined;

  const isField = (val: unknown): val is string | EncryptedField =>
    typeof val === 'string' || encryptedFieldTypeGuard(val);

  if (!isOptString(obj.userId)) return false;
  if (!isField(obj.title)) return false;
  if (!isField(obj.content)) return false;
  if (!isField(obj.listId)) return false;
  if (obj.editedAt !== undefined && !(obj.editedAt instanceof Timestamp))
    return false;

  return true;
}

export function listTypeGuard(obj: unknown): obj is List {
  if (!objectTypeGuard(obj)) return false;

  if (typeof obj.id !== 'string') return false;

  if (!(typeof obj.name === 'string' || encryptedFieldTypeGuard(obj.name)))
    return false;

  if (obj.userId !== undefined && typeof obj.userId !== 'string') return false;

  return true;
}

export function userDataTypeGuard(obj: unknown): obj is UserData {
  if (!objectTypeGuard(obj)) return false;

  const encryptedUserKey = obj.encryptedUserKey;
  if (
    typeof encryptedUserKey !== 'string' &&
    !encryptedFieldTypeGuard(encryptedUserKey)
  )
    return false;

  if (!Array.isArray(obj.salt)) return false;
  if (!obj.salt.every((n) => typeof n === 'number')) return false;

  return true;
}
