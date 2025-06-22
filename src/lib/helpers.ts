import { firebaseErrorTypeGaurd } from "./typegaurds";

export function generateUserKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("raw", key);
}

export function importKey(
  bufferOrBase64: Uint8Array | string,
): Promise<CryptoKey> {
  const finalBuffer =
    typeof bufferOrBase64 === "string"
      ? Uint8Array.from(atob(bufferOrBase64), (c) => c.charCodeAt(0))
      : bufferOrBase64;
  return crypto.subtle.importKey("raw", finalBuffer, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
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

export const handleError = (err: unknown) => {
  if (firebaseErrorTypeGaurd(err)) {
    const { code, message } = err;
    console.error(`Firebase error:\nCode: ${code}\nMessage: ${message}`);
    const errorCodeMap: Record<string, string> = {
      "auth/invalid-credential": "Invalid credentials",
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Wrong password",
      "permission-denied": "Permission denied",
    };
    alert(errorCodeMap[code] ?? message);
  } else console.error(err);
};
