import { Bytes, Timestamp } from 'firebase/firestore';
import { EncryptedField, List, Note, UserData } from '@/lib/types';

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

export function userDataTypeGuard(obj: unknown): obj is UserData {
  if (!objectTypeGuard(obj)) return false;

  const encryptedUserKey = obj.encryptedUserKey;
  const salt = obj.salt;

  const validEncryptedUserKey =
    typeof encryptedUserKey === 'string' ||
    encryptedFieldTypeGuard(encryptedUserKey);

  const validSalt =
    Array.isArray(salt) && salt.every((item) => typeof item === 'number');

  return validEncryptedUserKey && validSalt;
}

export function noteTypeGuard(obj: unknown): obj is Note {
  if (!objectTypeGuard(obj)) return false;

  if (typeof obj.id !== 'string') return false;
  if (!(obj.createdAt instanceof Timestamp)) return false;
  if (obj.editedAt !== undefined && !(obj.editedAt instanceof Timestamp))
    return false;
  if (obj.userId !== undefined && typeof obj.userId !== 'string') return false;
  if (typeof obj.title !== 'string') return false;
  if (typeof obj.content !== 'string') return false;
  if (typeof obj.listId !== 'string') return false;

  return true;
}

export function listTypeGuard(obj: unknown): obj is List {
  if (!objectTypeGuard(obj)) return false;
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.name !== 'string') return false;
  if (obj.userId !== undefined && typeof obj.userId !== 'string') return false;

  return true;
}
