import {
  Bytes,
  deleteDoc,
  DocumentSnapshot,
  getDocs,
  Query,
} from 'firebase/firestore';
import { useToastStore } from './stores/toastStore';
import { encryptedFieldTypeGuard, firebaseErrorTypeGuard } from './typeguards';
import { EncryptedField, List } from './types';
import { defaultListName } from './constants';
import JSZip from 'jszip';

type DecryptFunc<T> = (val: EncryptedField, key: CryptoKey) => Promise<T>;

const decryptEncryptedField = (
  { iv, data }: EncryptedField,
  key: CryptoKey,
) => {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.toUint8Array() },
    key,
    data.toUint8Array(),
  );
};

export const cleanSearch = (text: string) => {
  // The purpose of this function is to "forgive" the user for any punctuation while searching
  // Removes: hyphen, period, single quote, double quote, space, and curly apostrophe
  const forgivingRegex = /[-.'" \u2019]/g;
  return text.replace(forgivingRegex, '').toLowerCase();
};

export const censorEmail = (email: string) => {
  const [user, domain] = email.split('@');
  const first = user.slice(0, 2);
  const stars = '*'.repeat(user.length - 3);
  const last = user[user.length - 1];
  return `${first}${stars}${last}@${domain}`;
};

export async function decryptParams<T extends Record<string, unknown>>(
  key: CryptoKey,
  decryptFunc: DecryptFunc<unknown>,
  obj: Record<string, unknown>,
  ...params: Extract<keyof T, string>[]
) {
  const newObj = { ...obj };
  for (const param of params) {
    const val = obj[param];
    if (encryptedFieldTypeGuard(val))
      newObj[param] = await decryptFunc(val, key);
  }
  return newObj;
}

export const addId = (d: DocumentSnapshot): Record<string, unknown> => ({
  ...d.data(),
  id: d.id,
});

export const findDefaultListId = (lists: List[]) => {
  return lists.find((list) => list.name === defaultListName)?.id;
};

export const fullTrim = (s: string) => {
  return s
    .trim()
    .split('\n')
    .map((p) => p.trimEnd())
    .join('\n');
};

export async function deleteByQuery(q: Query) {
  const promises = await getDocs(q).then((snapshot) =>
    snapshot.docs.map((doc) => deleteDoc(doc.ref)),
  );
  return Promise.all(promises);
}

export function generateUserKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function derivePasswordKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWithKey(
  plainTextOrCryptoKey: string | CryptoKey,
  key: CryptoKey,
): Promise<EncryptedField> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  let toEncrypt: Uint8Array;
  if (typeof plainTextOrCryptoKey === 'string') {
    const encoder = new TextEncoder();
    toEncrypt = encoder.encode(plainTextOrCryptoKey);
  } else {
    const raw = await crypto.subtle.exportKey('raw', plainTextOrCryptoKey);
    toEncrypt = new Uint8Array(raw);
  }
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    toEncrypt,
  );
  const encryptedData = new Uint8Array(encrypted);
  return {
    iv: Bytes.fromUint8Array(iv),
    data: Bytes.fromUint8Array(encryptedData),
  };
}

export const decryptString: DecryptFunc<string> = async (
  encryptedText,
  key,
) => {
  const decrypted = await decryptEncryptedField(encryptedText, key);
  return new TextDecoder().decode(decrypted);
};

export const decryptCryptoKey: DecryptFunc<CryptoKey> = async (
  encryptedKey,
  key,
) => {
  const decrypted = await decryptEncryptedField(encryptedKey, key);
  return crypto.subtle.importKey('raw', decrypted, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
};

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export const getError = (err: unknown) => {
  console.error(err);
  if (firebaseErrorTypeGuard(err)) {
    const { code, message } = err;
    const errorCodeMap: Record<string, string> = {
      'auth/invalid-credential': 'Invalid credentials',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Wrong password',
      'permission-denied': 'Permission denied',
    };
    return errorCodeMap[code] ?? message;
  }
  return null;
};

export const handleError = (err: unknown) => {
  if (firebaseErrorTypeGuard(err)) {
    const { code, message } = err;
    console.warn(`Firebase error\nCode: ${code}\nMessage: ${message}`);
    const errorCodeMap: Record<string, string> = {
      'auth/invalid-credential': 'Invalid credentials',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Wrong password',
      'permission-denied': 'Permission denied',
    };
    useToastStore
      .getState()
      .add('error', 'Error', errorCodeMap[code] ?? message);
  } else console.error(err);
};

export async function zipAndDownloadJSON(
  files: { filename: string; data: unknown[] }[],
  zipFilename: string,
) {
  // Must be used in a client component
  const zip = new JSZip();
  files.forEach(({ filename, data }) => {
    const json = JSON.stringify(data, null, 2);
    zip.file(filename, json);
  });
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
