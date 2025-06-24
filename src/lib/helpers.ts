import { deleteDoc, getDocs, Query, Timestamp } from "firebase/firestore";
import { useToastStore } from "./stores/toastStore";
import { firebaseErrorTypeGuard } from "./typeguards";

export const fullTrim = (s: string) => {
  return s
    .trim()
    .split("\n")
    .map((p) => p.trimEnd())
    .join("\n");
};

export const formatTimestamp = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleString(undefined, {
    minute: "numeric",
    hour: "numeric",
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

export async function deleteByQuery(q: Query) {
  const promises = await getDocs(q).then((snapshot) =>
    snapshot.docs.map((doc) => deleteDoc(doc.ref)),
  );
  await Promise.all(promises);
}

export function generateUserKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportKey(key: CryptoKey) {
  const rawKey = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
}

export async function derivePasswordKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptWithKey(
  plainText: string,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText),
  );
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}

export async function decryptWithKey(
  encryptedText: string,
  key: CryptoKey,
): Promise<string> {
  const [ivB64, dataB64] = encryptedText.split(":");
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
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
      "auth/invalid-credential": "Invalid credentials",
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Wrong password",
      "permission-denied": "Permission denied",
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
      "auth/invalid-credential": "Invalid credentials",
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Wrong password",
      "permission-denied": "Permission denied",
    };
    useToastStore
      .getState()
      .add("error", "Error", errorCodeMap[code] ?? message);
  } else console.error(err);
};
