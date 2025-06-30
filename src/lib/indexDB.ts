import { get, set, del } from 'idb-keyval';
import { useUserStore } from './stores/userStore';

// All logic here should synchronize between indexDB and the user store

const keyName = 'userKey';

// Store base64-encoded raw key
export async function saveUserKey(key: CryptoKey) {
  console.log('Saving user key');
  useUserStore.getState().setKey(key);
  return set(keyName, key);
}

export async function loadUserKey() {
  console.log('Loading user key');
  const key = await get(keyName);
  if (!(key instanceof CryptoKey)) return;
  useUserStore.getState().setKey(key);
}

export function clearUserKey() {
  console.log('Clearing user key');
  useUserStore.getState().setKey(null);
  return del(keyName);
}
