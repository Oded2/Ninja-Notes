import { get, set, del } from "idb-keyval";

const keyName = "userKey";

function importKey(base64: string): Promise<CryptoKey> {
  // Moved from helpers.ts
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", buffer, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

// Store base64-encoded raw key
export function saveUserKey(base64Key: string) {
  return set(keyName, base64Key);
}

export async function loadUserKey() {
  const base64 = await get(keyName);
  if (typeof base64 !== "string") throw Error("Invalid user key");
  return importKey(base64);
}

export function clearUserKey() {
  return del(keyName);
}
