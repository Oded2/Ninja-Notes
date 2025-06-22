import { get, set, del } from "idb-keyval";

const keyName = "userKey";

// Store base64-encoded raw key
export function saveUserKey(base64Key: string) {
  return set(keyName, base64Key);
}

export function loadUserKey() {
  return get(keyName);
}

export function clearUserKey() {
  return del(keyName);
}
