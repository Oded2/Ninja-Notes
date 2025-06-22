import { get, set, del } from "idb-keyval";
import { authHandlers } from "./firebase";

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
  return set(keyName, base64Key);
}

export async function loadUserKey() {
  console.log("Loading user key");
  const base64 = await get(keyName);
  if (typeof base64 !== "string") {
    // Keep alert
    alert("Your session key is missing or invalid. Please sign in again.");
    await authHandlers.signout();
    return null;
  }
  return await importKey(base64);
}

export function clearUserKey() {
  console.log("Clearing user key");
  return del(keyName);
}
