import { deleteDoc, getDocs, Query, Timestamp } from 'firebase/firestore';
import { useToastStore } from './stores/toastStore';
import { firebaseErrorTypeGuard } from './typeguards';
import { List } from './types';
import { defaultListName } from './constants';
import JSZip from 'jszip';

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
        if (typeof val === 'string') {
          // Since val is of type T[K], it means that T[K] is a string, making it safe to cast
          newObj[param] = (await decryptWithKey(val, key)) as T[K];
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

export function importKey(base64: string) {
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', buffer, 'AES-GCM', true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function exportKey(key: CryptoKey) {
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
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
  plainText: string,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plainText),
  );
  return `${uint8ArrayToBase64(iv)}:${uint8ArrayToBase64(new Uint8Array(encrypted))}`;
}

export async function decryptWithKey(
  encryptedText: string,
  key: CryptoKey,
): Promise<string> {
  const [ivB64, dataB64] = encryptedText.split(':');
  const iv = base64ToUint8Array(ivB64);
  const data = base64ToUint8Array(dataB64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );
  return new TextDecoder().decode(decrypted);
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
    console.error(`Firebase error\nCode: ${code}\nMessage: ${message}`);
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

function uint8ArrayToBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8));
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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
