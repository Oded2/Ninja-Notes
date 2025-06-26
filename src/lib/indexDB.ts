import { get, set, del } from "idb-keyval";
import { useUserStore } from "./stores/userStore";

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
  console.log("Saving user key");
  const saveUserKeyToStore = importKey(base64Key).then((key) =>
    useUserStore.getState().setKey(key),
  );
  return Promise.all([set(keyName, base64Key), saveUserKeyToStore]);
}

export async function loadUserKey() {
  console.log("Loading user key");
  const base64 = await get(keyName);
  if (typeof base64 !== "string") {
    return null;
  }
  return await importKey(base64);
}

export function clearUserKey() {
  console.log("Clearing user key");
  return del(keyName);
}
