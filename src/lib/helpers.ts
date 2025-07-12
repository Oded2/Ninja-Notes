import {
  Bytes,
  deleteDoc,
  getDocs,
  Query,
  Timestamp,
} from 'firebase/firestore';
import { useToastStore } from './stores/toastStore';
import { encryptedFieldTypeGuard, firebaseErrorTypeGuard } from './typeguards';
import { EncryptedField, List } from './types';
import { defaultListName } from './constants';
import JSZip from 'jszip';

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

export const getTypedDecryptedDocs = async <
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  q: Query,
  typeguard: (obj: unknown) => obj is T,
  key: CryptoKey,
  ...decryptParams: K[]
) => {
  const snapshot = await getDocs(q);
  const typedDocs = snapshot.docs
    .map((doc) => {
      const withId = { id: doc.id, ...doc.data() };
      return withId as unknown;
    })
    .filter(typeguard);
  return Promise.all(
    typedDocs.map(async (obj) => {
      const newObj = { ...obj };
      for (const param of decryptParams) {
        const val = obj[param];
        if (encryptedFieldTypeGuard(val)) {
          // For every field that is type EncryptedField, it can also be type string
          // This means that T[K] has to be type EncryptedField | string
          newObj[param] = (await decryptString(val, key)) as T[K];
        }
      }
      return newObj;
    }),
  );
};

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

export const formatTimestamp = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleString(undefined, {
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });
};

export async function deleteByQuery(q: Query) {
  const promises = await getDocs(q).then((snapshot) =>
    snapshot.docs.map((doc) => deleteDoc(doc.ref)),
  );
  await Promise.all(promises);
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

export async function decryptString(
  encryptedText: EncryptedField,
  key: CryptoKey,
): Promise<string> {
  const decrypted = await decryptEncryptedField(encryptedText, key);
  return new TextDecoder().decode(decrypted);
}

export async function decryptCryptoKey(
  encryptedKey: EncryptedField,
  key: CryptoKey,
) {
  const decrypted = await decryptEncryptedField(encryptedKey, key);
  return crypto.subtle.importKey('raw', decrypted, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
}

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

export function possiblyEncryptedToString(val: EncryptedField | string) {
  if (typeof val === 'string') return val;
  return '__ENCRYPTED VALUE ERROR__';
}
